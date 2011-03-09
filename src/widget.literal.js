/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

var WIDGET_LITERAL_JS = 1;

RDFauthor.registerWidget({
    init: function () {
        this.disclosureID = 'disclosure-' + RDFauthor.nextID();
        this.languages    = RDFauthor.literalLanguages();
        this.datatypes    = RDFauthor.literalDatatypes();
        this.namespaces   = RDFauthor.namespaces();

        this.languages.unshift('');
        
        // modify Safari input behaviour (CSS3)
        if ($.browser.webkit) {
            RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.literal.css');
        }
    }, 
    
    ready: function () {
        var widget = this;
        
        // disclosure button
        jQuery('#' + widget.disclosureID).click(function () {
            var close = $(this).hasClass('open') ? true : false;

            // update UI accordingly
            var button = this;
            if (close) {
                if (this.animate) {
                    $('.' + widget.disclosureID).fadeIn(250, function() {
                        $(button).removeClass('open').addClass('closed');
                    });
                } else {
                    $('.' + widget.disclosureID).show();
                    $(button).removeClass('open').addClass('closed');
                }
            } else {
                if (this.animate) {
                    $('.' + widget.disclosureID).fadeOut(250, function() {
                        $(button).removeClass('cosed').addClass('open');
                    });
                } else {
                    $('.' + widget.disclosureID).hide();
                    $(button).removeClass('cosed').addClass('open');
                }
            }
        });
        
        // literal options
        $('.literal-type .radio').click(function() {
            var jDatatypeSelect = $('#' + $(this).attr('name').replace('literal-type', 'literal-datatype')).eq(0);
            var jLangSelect     = $('#' + $(this).attr('name').replace('literal-type', 'literal-lang')).eq(0);

            if ($(this).val() == 'plain') {
                jDatatypeSelect.closest('div').hide();
                jLangSelect.closest('div').show();
                // clear datatype
                jDatatypeSelect.val('');
            } else {
                jDatatypeSelect.closest('div').show();
                jLangSelect.closest('div').hide();
                // clear lang
                jLangSelect.val('');
            }
        });
        
    }, 
    
    valueClass: function () {
        var length = this.statement.hasObject() ? this.statement.objectValue().length : 0;
        var cls;
        switch (true) {
            case length >= 52:
                cls = 'literal-value literal-value-large';
                break;
            case length >= 26:
                cls = 'literal-value literal-value-medium';
                break;
            default:
                cls =  'literal-value literal-value-short';
        }
        
        return cls;
    }, 
    
    isLarge: function () {
        if (this.statement.hasObject()) {
            var objectValue = this.statement.objectValue();
            if (objectValue.search) {
                return ((objectValue.length >= 52) || 0 <= objectValue.search(/\n/));
            }
        }

        return false;
    }, 
    
    isMedium: function () {
        if (this.statement.hasObject()) {
            return (this.statement.objectValue().length >= 20);
        }

        return false;
    }, 
    
    makeOptionString: function(options, selected, replaceNS) {
        replaceNS = replaceNS || false;

        var optionString = '';
        for (var i = 0; i < options.length; i++) {
            var display = options[i];
            if (replaceNS) {
                for (var s in this.ns) {
                    if (options[i].match(this.ns[s])) {
                        display = options[i].replace(this.ns[s], s + ':');
                        break;
                    }
                }
            }

            var current = options[i] == selected;
            if (current) {
                // TODO: do something
            }

            // Firefox hack
            if (display == '') {
                display = '[none]';
            }

            optionString += '<option value="' + options[i] + '"' + (current ? 'selected="selected"' : '') + '>' + display + '</option>';
        }

        return optionString;
    }, 
    
    element: function () {
        return jQuery('#literal-value-' + this.ID);
    }, 
    
    markup: function () {
        var areaConfig = {
            rows: (this.isLarge() ? '3' : '1'), 
            buttonClass: /*(this.isLarge()) ? 'disclosure-button-horizontal' :*/ 'disclosure-button-vertical', 
            containerClass: this.valueClass()
        }

        var areaMarkup = '\
            <div class="container ' + areaConfig.containerClass + '" style="width:100%">\
                <textarea rows="' + String(areaConfig.rows) + '" cols="20" id="literal-value-' + 
                    this.ID + '">' + (this.statement.hasObject() ? this.statement.objectValue() : '') + '</textarea>\
            </div>\
            <div class="container util" style="clear:left">\
                <a class="disclosure-button ' + areaConfig.buttonClass + ' open" id="' + this.disclosureID 
                        + '" title="Toggle details disclosure"></a>\
            </div>';

        var markup = '\
            ' + areaMarkup + '\
            <div class="container literal-type util ' + this.disclosureID + '" style="display:none">\
                <label><input type="radio" class="radio" name="literal-type-' + this.ID + '"' 
                        + (this.statement.objectDatatype() ? '' : ' checked="checked"') + ' value="plain" />Plain</label>\
                <label><input type="radio" class="radio" name="literal-type-' + this.ID + '"' 
                        + (this.statement.objectDatatype() ? ' checked="checked"' : '') + ' value="typed" />Typed</label>\
            </div>\
            <div class="container util ' + this.disclosureID + '" style="display:none">\
                <div class="literal-lang"' + (this.statement.objectDatatype() ? ' style="display:none"' : '') + '>\
                    <label for="literal-lang-' + this.ID + '">Language:\
                        <select id="literal-lang-' + this.ID + '" name="literal-lang-' + this.ID + '">\
                            ' + this.makeOptionString(this.languages, this.statement.objectLang()) + '\
                        </select>\
                    </label>\
                </div>\
                <div class="literal-datatype"' + (this.statement.objectDatatype() ? '' : ' style="display:none"') + '>\
                    <label>Datatype:\
                        <select id="literal-datatype-' + this.ID + '" name="literal-datatype-' + this.ID + '">\
                            ' + this.makeOptionString(this.datatypes, this.statement.objectDatatype(), true) + '\
                        </select>\
                    </label>\
                </div>\
            </div>';

        return markup;
    }, 
    
    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank = RDFauthor.databankForGraph(this.statement.graphURI());
            
            /* 
            var v = this.value();
            // */
            
            var somethingChanged = (
                this.statement.hasObject() && (
                    // existing statement should have been edited
                    this.statement.objectValue() !== this.value() || 
                    this.statement.objectLang() !== this.lang() || 
                    this.statement.objectDatatype() !== this.datatype()
                )
            );
            
            // new statement must not be empty
            var isNew = !this.statement.hasObject() && (null !== this.value());
            
            if (somethingChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(String(rdfqTriple));
                }
            }
            
            if ((null !== this.value()) && !this.removeOnSubmit && (somethingChanged || isNew)) {
                try {
                    var objectOptions = {};
                    if (null !== this.lang()) {
                        objectOptions.lang = this.lang();
                    } else if (null !== this.datatype()) {
                        objectOptions.datatype = this.datatype();
                    }
                    var newStatement = this.statement.copyWithObject({
                        value: this.value(), 
                        options: objectOptions, 
                        type: 'literal'
                    });
                    databank.add(newStatement.asRdfQueryTriple());
                } catch (e) {
                    var msg = e.message ? e.message : e;
                    alert('Could not save literal for the following reason: \n' + msg);
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
    
    type: function () {
        var type = $('input[name=literal-type-' + this.ID + ']:checked').eq(0).val();
        
        if ('' !== type) {
            return type;
        }
        
        return null;
    }, 
    
    lang: function () {
        var lang = $('#literal-lang-' + this.ID + ' option:selected').eq(0).val();
        if ((this.type() == 'plain') && ('' !== lang)) {
            return lang;
        }
        
        return null;
    }, 
    
    datatype: function () {
        var datatype = $('#literal-datatype-' + this.ID + ' option:selected').eq(0).val();
        if ((this.type() == 'typed') && ('' !== datatype)) {
            return datatype;
        }
        
        return null;
    }, 
    
    value: function () {
        var value = this.element().val();
        if (String(value).length > 0) {
            return value;
        }
        
        return null;
    }
}, {
        name: '__LITERAL__'
    }
);

