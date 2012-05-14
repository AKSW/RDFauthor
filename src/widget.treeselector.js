/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 *         Clemens Hoffmann <cannelony@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated,
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this._jsTreeLoaded = false;
        this._domRdy = false;
        var self = this;

        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.treeselector.css');

        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jstree/jquery.jstree.js', function(){
            self._jsTreeLoaded = true;
            self._init();
        });

    },

    // Uncomment this to execute code when you widget's markup is ready in the DOM,
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        var self = this;
        self._domRdy = true;
        self._init();
    },

    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#treeselector-edit-' + this.ID);
    },

    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the
    // return value of element().
    focus: function () {},
    */

    // return your widget's markup code here
    markup: function () {
        var markup =
            '<div class="container" style="width:100%">\
                <input type="text" style="width:100%;" class="text treeselector" name="treeselector" id="treeselector-edit-' + this.ID + '" value="'
                    + (this.statement.hasObject() ? this.statement.objectValue() : '') + '" />\
            </div>';

        var treeselector =
            '<div id="treeselector" class="window" style="display: none;">\
               <h1 class="title">TreeSelector</h1>\
               <div class="window-buttons">\
                 <div class="window-buttons-left"></div>\
                 <div class="window-buttons-right">\
                   <span class="button button-windowclose"><span>\
                 </div>\
               </div>\
               <div class="content">\
                 <div id="treeselector-content">\
                 </div>\
              </div>\
             </div>\
            ';

        if( $('#treeselector').length == 0 ) {
            $('body').append(treeselector);
        }
        return markup;
    },

    // commit changes here (add/remove/change)
    submit: function () {
                if (this.shouldProcessSubmit()) {
            // get databank
            var databank   = RDFauthor.databankForGraph(this.statement.graphURI());
            var hasChanged = (
                this.statement.hasObject()
                && this.statement.objectValue() !== this.value()
                && null !== this.value()
            );

            if (hasChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(rdfqTriple);
                }
            }

            if (!this.removeOnSubmit && this.value()) {
                var self = this;
                try {
                    var newStatement = this.statement.copyWithObject({
                        value: '<' + this.value() + '>',
                        type: 'uri'
                    });
                    databank.add(newStatement.asRdfQueryTriple());
                } catch (e) {
                    var msg = e.message ? e.message : e;
                    alert('Could not save resource for the following reason: \n' + msg);
                    return false;
                }
            }
        }
        $('#treeselector').remove();
        return true;    },

    shouldProcessSubmit: function () {
        var t1 = !this.statement.hasObject();
        var t2 = null === this.value();
        var t3 = this.removeOnSubmit;

        return (!(t1 && t2) || t3);
    },

    value: function () {
        var value = this.element().val();
        if (String(value).length > 0) {
            return value;
        }

        return null;
    },

    _getRootNode: function (callback) {
        var self = this;
        var subjectURI = self.statement.subjectURI();
        var graphURI = self.statement.graphURI();
        var prefixPattern = '\
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n';
        var selectPattern = '?rootNode ?label\n';
        var uriPattern1 = '?rootNode ?p ?o .\n';
        var uriPattern2 = '?rootNode ?p <http://www.w3.org/2002/07/owl#Class> .\n';
        var optional = 'OPTIONAL { ?rootNode <http://www.w3.org/2000/01/rdf-schema#label> ?label .} .\n';

        var query = prefixPattern + 'SELECT ' + selectPattern
                                  + 'WHERE { \n'
                                  + uriPattern1
                                  + uriPattern2
                                  + optional
                                  + '}';
        var rootNode = {};
        //query
        RDFauthor.queryGraph(graphURI, query, {
            callbackSuccess: function(data) {
                var serializedNodes = {'data' : []};
                var results = data.results.bindings;
                console.log(results);
                for (var i in results) {
                    if( (results[i].rootNode != "undefined") && (i != "last") ) {
                        console.log(results[i].rootNode.value + ' - ' + results[i].label.value);
                        var val = results[i].rootNode.value;
                        serializedNodes['data'].push({
                          'data' : val,
                          'attr' : { 'id' : val},
                          'state' : 'closed'
                        });
                    }
                }
                console.log(serializedNodes);
                $.isFunction(callback) ? callback(serializedNodes) : null;
            },
            callbackError: function() {
                $.isFunction(callback) ? callback(serializedNodes) : null;
            }
        });
    },

    _serializeNodes: function (node, label) {
        var node = node != undefined ? node : null;
        var label = label != undefined ? label : null;
        var data = {}
        console.log(data);
        return data;
    },

    _init: function () {
        var self = this;
        var focus;
        if (self._jsTreeLoaded && self._domRdy) {
            self.element().click(function(){
                focus = true;
                $('#treeselector').data('current',self.element().attr('id'));
                // positioning
                var left = self._getPosition().left;
                var top = self._getPosition().top;

                $('#treeselector').data('input',$(this))
                                  .show()
                                  .offset({left: left, top: top})
                                  .resizable({
                                    minHeight: 400,
                                    minWidth: 550,
                                    alsoResize: $('#treeselector')
                                  });
                //query
                self._getRootNode();
                self._serializeNodes()
            });

            self._getRootNode(function(serializedNodes) {
                $('#treeselector-content').jstree({
                    "json_data" : serializedNodes,
                    "plugins"   : [ "themes", "json_data", "ui" ]
                });
            })
            
            $('#treeselector-content a').live('click', function(event) {
                self.element().val($(this).text());
                var parent = $(this);
                $('#treeselector-content').jstree('toggle_node', this).jstree(
                                              'create_node',
                                              parent,
                                              'inside',
                                              { 'data' : 'child', 'state' : 'closed'},
                                              function() {},
                                              true
                                         );
            });

            $('html').unbind('click').click(function(event){
                if ($('#treeselector').css("display") != "none" && focus == false) {
                    $('#treeselector').fadeOut();
                }else if (focus == true){
                    $('#treeselector').fadeIn();
                }
            });
            $('#treeselector,input[name="treeselector"]').mouseover(function(){
                focus = true;
            });
            $('#treeselector,input[name="treeselector"]').mouseout(function(){
                focus = false;
            });

            $('.rdfauthor-view-content,html').scroll(function() {
                var left = self._getPosition().left + 'px !important;';
                var top = self._getPosition().top + 'px !important';

                $('#treeselector').css('left',left)
                                .css('top',top);
                $('#treeselector').fadeOut();
            });

            $('#treeselector .button-windowclose').live('click', function() {
                $('#treeselector').fadeOut();
            });

        }
    },

    _getPosition: function () {
        var pos = {
            'top' : this.element().offset().top + this.element().outerHeight(),
            'left': this.element().offset().left
        };
        return pos;
    }

}, {
        name: 'property',
        values: ['http://mytest.de/treeselector']
   }
);
