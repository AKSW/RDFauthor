/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */


RDFauthor.registerWidget({
    init: function () {
        this.results         = [];

        this._domReady     = false;
        this._pluginLoaded = false;
        this._initialized  = false;
        this._autocomplete = null;

        this._namespaces = jQuery.extend({
            foaf: 'http://xmlns.com/foaf/0.1/',
            dc:   'http://purl.org/dc/terms/',
            owl:  'http://www.w3.org/2002/07/owl#',
            rdf:  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            skos: 'http://www.w3.org/2004/02/skos/core#',
            geo:  'http://www.w3.org/2003/01/geo/wgs84_pos#',
            dbp:  'http://dbpedia.org/property/',
            xsd:  'http://www.w3.org/2001/XMLSchema#',
            sioc: 'http://rdfs.org/sioc/ns#'
        }, RDFauthor.namespaces());

        /* default options */
        this._options = jQuery.extend({
            // Autocomplete options:
            minChars:           3,      /* minmum chars needed to be typed before search starts */
            delay:              1000,   /* delay in ms before search starts */
        }, this.options);

        var self = this;
        if (undefined === jQuery.ui.autocomplete) {
            RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.ui.autocomplete.js', function () {
                self._pluginLoaded = true;
                self._init();
            });
        } else {
            self._pluginLoaded = true;
            self._init();
        }

        // jQuery UI styles
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/jquery.ui.autocomplete.css');

        // load stylesheets
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.property.css');
    },

    ready: function () {
        this._domReady = true;
        this._init();
    },

    element: function () {
        return $('#property-input-' + this.ID);
    },

    markup: function () {
            var markup = '\
            <div class="container resource-value">\
                <input type="text" id="property-input-' + this.ID + '" name="propertpicker" class="text resource-edit-input" />\
            </div>';
            var propertyPicker = 
                        '<div id="propertypicker" class="window" style="display: none;">\
                           <h1 class="title">Suggested Properties\
                             <br/>\
                             <input id="filterProperties" autocomplete="off" type="text" class="text inner-label width99" style="margin: 5px 5px 0px 0px;"/>\
                           </h1>\
                           <div class="window-buttons">\
                             <div class="window-buttons-left"></div>\
                             <div class="window-buttons-right">\
                               <span class="button button-windowclose"><span>\
                             </div>\
                           </div>\
                           <div class="content">\
                             <h1 class="propertyHeadline">\
                               <span style="display: inline-block !important;" class="ui-icon ui-icon-minus"></span>\
                               <span>In use elsewhere (\
                               <span id="suggestedInUseCount"></span>\
                               )</span>\
                             </h1>\
                             <div id="suggestedInUse">\
                             </div>\
                             <h1 class="propertyHeadline">\
                               <span style="display: inline-block !important;" class="ui-icon ui-icon-minus"></span>\
                               <span>Gerenal applicable (\
                               <span id="suggestedGernalCount"></span>\
                               )</span>\
                             </h1>\
                             <div id="suggestedGernal">\
                             </div>\
                             <h1 class="propertyHeadline">\
                               <span style="display: inline-block !important;" class="ui-icon ui-icon-plus"></span>\
                               <span>Applicable (\
                                <span id="suggestedApplicableCount"></span>\
                               )</span>\
                             </h1>\
                             <div id="suggestedApplicable">\
                             </div>\
                          </div>\
                         </div>\
                        ';
                    
        if( $('#propertypicker').length == 0 ) {
            $('body').append(propertyPicker);
        }

        return markup;
    },

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
                    databank.remove(String(rdfqTriple));
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

        return true;
    },

    shouldProcessSubmit: function () {
        var t1 = !this.statement.hasObject();
        var t2 = null === this.value();
        var t3 = this.removeOnSubmit;

        return (!(t1 && t2) || t3);
    },

    value: function () {
        var typedValue = this.element().val();
        if (typedValue.length != 0) {
            return typedValue;
        }

        return null;
    },

    generateURI: function (item, prefix) {
        var lastChar = prefix.charAt(prefix.length - 1);
        if (!(lastChar == '/' || lastChar == '#')) {
            prefix += '/';
        }

        return prefix + item;
    },

    isURI: function (term) {
        // TODO: more advanced URI check
        return (/(https?:\/\/|mailto:|tel:)/.exec(term) !== null);
    },

    highlight: function (text, term) {
        var highlight = text.replace(RegExp(term, 'i'), '<em>$&</em>');
        return highlight;
    },

    localName: function (uri) {
        var s = String(uri);
        var l;
        if (s.lastIndexOf('#') > -1) {
            l = s.substr(s.lastIndexOf('#') + 1);
        } else {
            l = s.substr(s.lastIndexOf('/') + 1);
        }

        return (l !== '') ? l : s;
    },

    expandNamespace: function (prefixedName) {
        var splits = prefixedName.split(':', 2);
        if (splits.length >= 2) {
            if (splits[0] in this._namespaces) {
                return this._namespaces[splits[0]] + splits[1];
            }
        }

        return prefixedName;
    },

    _normalizeValue: function (value) {
        if (!this.selectedResource) {
            this.selectedResource      = this.expandNamespace(value);
            this.selectedResourceLabel = this.localName(value);
        }
    },

    _init: function () {
        var self = this;
        var focus;
        if (this._pluginLoaded && this._domReady) {
            self.element().click(function() {
                focus = true;
                // positioning
                var left = self._getPosition().left + 'px !important;';
                var top = self._getPosition().top + 'px !important';

                $('#propertypicker').css('left',left)
                                    .css('top',top)
                                    .data('input',$(this))
                                    .show();
            });

            $('html').click(function(){
                if ($('#propertypicker').css("display") != "none" && focus == false) {
                    $('#propertypicker').fadeOut();
                }else if (focus == true){
                    $('#propertypicker').fadeIn();
                }
            });
            $('#propertypicker,input[name="propertypicker"]').mouseover(function(){
                focus = true;
            });
            $('#propertypicker,input[name="propertypicker"]').mouseout(function(){
                focus = false;
            });

            $('.rdfauthor-view-content,html').scroll(function() {
                var left = self._getPosition().left + 'px !important;';
                var top = self._getPosition().top + 'px !important';
                    
                $('#propertypicker').css('left',left)
                                .css('top',top);
                $('#propertypicker').fadeOut();
            });

            $('#propertypicker .button-windowclose').live('click', function() {
                $('#propertypicker').fadeOut();
            });

        }
    },

    _getPosition: function() {
        var pos = {
            'top' : this.element().offset().top + this.element().outerHeight(),
            'left': this.element().offset().left
        };
        return pos;
    }

}, [{
        name: '__PROPERTY__'
    }]
);
