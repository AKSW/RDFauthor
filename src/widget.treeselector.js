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

        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.jstree.js', function(){
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
                <input type="text" style="width:100%;" class="text image-icon treeselector" name="treeselector" id="treeselector-edit-' + this.ID + '" value="'
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
