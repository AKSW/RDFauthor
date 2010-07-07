/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */
RDFauthor.registerWidget({
    init: function () {
        this.disclosureID = 'disclosure-' + RDFauthor.nextID();
        this.languages    = RDFauthor.literalLanguages();
        this.datatypes    = RDFauthor.literalDatatypes();
        this.namespaces   = RDFauthor.namespaces();

        this.languages.unshift('');
        
        // RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/autoresize.jquery.min.js');
    }, 
    
    ready: function () {
        var widget = this;
        
        // disclosure button
        jQuery('#' + widget.disclosureID).click(function () {
            var close = $(this).hasClass('open') ? true : false;

            // update UI accordingly
            var button = this;
            if (close) {
                $('.' + widget.disclosureID).fadeIn(250, function() {
                    $(button).removeClass('open').addClass('closed');
                });
            } else {
                $('.' + widget.disclosureID).fadeOut(250, function() {
                    $(button).removeClass('cosed').addClass('open');
                });
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
    
    isLarge: function () {
        if (this.statement.hasObject()) {
            var objectValue = this.statement.objectValue();
            if (objectValue.search) {
                return ((objectValue.length >= 50) || 0 <= objectValue.search(/\n/));
            }
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
            style: (this.isLarge() ? 'width:100%' : 'width:50%;height:1.3em;padding-top:0.2em'), 
            buttonClass: (this.isLarge()) ? 'disclosure-button-horizontal' : 'disclosure-button-vertical'
        }

        var areaMarkup = '\
            <div class="container literal-value" style="width:' + this.availableWidth() + 'px">\
                <textarea rows="' + String(areaConfig.rows) + '" cols="20" style="' + areaConfig.style + '" id="literal-value-' + 
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
            
            var somethingChanged = (
                this.statement.hasObject() && (
                    this.statement.objectValue() !== this.value()
                    || this.statement.objectLang() !== this.lang()
                    || this.statement.objectDatatype() !== this.datatype()
                )
            );
            
            if (somethingChanged || this.removeOnSubmit) {
                databank.remove(this.statement.asRdfQueryTriple());
            }
            
            if ((null !== this.value()) && !this.removeOnSubmit) {
                try {
                    var objectOptions = {};
                    if (null !== this.lang()) {
                        objectOptions.lang = this.lang();
                    } else if (null !== this.datatype()) {
                        objectOptions.datatype = this.datatype();
                    }
                    var newStatement = this.statement.copyWithObject({value: this.value(), options: objectOptions});
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
        var value = $('#literal-value-' + this.ID).val();
        if ('' !== value) {
            return value;
        }
        
        return null;
    }
}, {
        name: '__LITERAL__'
    }
);