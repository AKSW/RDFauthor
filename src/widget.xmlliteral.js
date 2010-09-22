/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

RDFauthor.registerWidget({    
    _loadMCE: function () {
        if (this._mceLoaded && this._domReady) {
            $('#xmlliteral-edit-input-' + this.ID).tinymce({
                script_url: RDFAUTHOR_BASE + 'libraries/tiny_mce/tiny_mce.js', 
                theme: 'advanced', 
                skin: 'default', 
                plugins:  'media, paste, fullscreen, visualchars, xhtmlxtras, safari, wordcount', 
                // toggletoolbars_status: 'on', 
                theme_advanced_toolbar_location : 'top', 
                theme_advanced_toolbar_align : 'left', 
                theme_advanced_buttons1: 'bold, italic, strikethrough, |, bullist, numlist, blockquote, |, justifyleft, justifycenter, justifyright, |, link, unlink, |, cleanup, fullscreen, code', 
                theme_advanced_buttons2: 'formatselect, underline, justifyfull, forecolor, |, media, pastetext, pasteword, removeformat, |, charmap, |, outdent, indent, |, undo, redo, help', 
                theme_advanced_buttons3: '', 
                theme_advanced_buttons4: '', 
                theme_advanced_statusbar_location: 'bottom'
            });
        }
    }, 
    
    // Uncomment this to execute code when your widget is instantiated, 
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this._mceLoaded = false;
        this._domReady  = false;
        this._datatype  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral';
        
        var self = this;
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/tiny_mce/jquery.tinymce.js', function () {
            self._mceLoaded = true;
            self._loadMCE();
        });
    },
    
    // Uncomment this to execute code when you widget's markup is ready in the DOM, 
    // e.g. load jQuery plug-ins, attache event handlers etc.
    ready: function () {
        this._domReady = true;
        this._loadMCE();
    },
    
    // return your jQuery-wrapped main input element here
    element: function () {
        return jQuery('#xmlliteral-edit-input-' + this.ID);
    }, 
    
    // Uncomment to give focus to your widget.
    // Default implementation will giver focus to the return value of element().
    focus: function () {
        jQuery('#xmlliteral-edit-input-' + this.ID).focus();
    },
    
    // return your widget's markup code here
    markup: function () {
        var markup = '\
            <div class="container xmlliteral-value" style="width:' + this.availableWidth() + 'px">\
                <textarea id="xmlliteral-edit-input-' + this.ID + '" class="xmlliteral-edit-input" style="width:100%">' 
                    + (this.statement.hasObject() ? this.statement.objectValue() : '') + 
                '</textarea>\
            </div>';

        return markup;
    }, 
    
    // commit changes here (add/remove/change)
    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank = RDFauthor.databankForGraph(this.statement.graphURI());
            
            var somethingChanged = (
                this.statement.hasObject() && 
                    (this.statement.objectValue() !== this.value()) || 
                !this.statement.hasObject() && 
                    this.value()
            );
            
            if (somethingChanged || this.removeOnSubmit) {
                databank.remove(this.statement.asRdfQueryTriple());
            }
            
            if ((null !== this.value()) && !this.removeOnSubmit && somethingChanged) {
                try {
                    var newStatementOptions = {};
                    if (this.statement.objectDatatype()) {
                        newStatementOptions.datatype = this.statement.objectDatatype();
                    }
                    
                    var val = this.value();
                    var newStatement = this.statement.copyWithObject({
                        value: val, 
                        options: newStatementOptions, 
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
    
    value: function () {
        return this.element().val();
    }, 
    
    encodeTags: function (stringContainingTags) {
        var replace = {
            '<': '&lt;', 
            '>': '&gt;', 
            '&': '&amp;'
        }
        
        var re = new RegExp('[<>&]', 'g');
        
        return stringContainingTags.replace(re, function (match, offset, s) {
            return replacement = replace[match];
        });
    }
}, [{
        name: 'range', 
        values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
    }, {
        name: 'datatype',
        values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
    }]
);