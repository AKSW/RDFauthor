/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

RDFauthor.registerWidget({    
    _loadNicEditor: function () {        
        if (this._nicEditLoaded && this._domReady) {
            var editorOptions = {
                iconsPath: RDFAUTHOR_BASE + 'libraries/nicEditorIcons.gif', 
                fullPanel: true, 
                xhtml: true
            };

            var editor = new nicEditor(editorOptions);
            editor.setPanel('xmlliteral-edit-panel-' + this.ID);
            editor.addInstance('xmlliteral-edit-input-' + this.ID);
            this._editor = editor;
        }
    }, 
    
    // Uncomment this to execute code when your widget is instantiated, 
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this._nicEditLoaded = false;
        this._editor        = null;
        this._domReady      = false;
        this._datatype      = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral';
        
        var self = this;
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/nicEdit.js', function () {
            self._nicEditLoaded = true;
            self._loadNicEditor();
        });
        
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.xmlliteral.css');
    },
    
    // Uncomment this to execute code when you widget's markup is ready in the DOM, 
    // e.g. load jQuery plug-ins, attache event handlers etc.
    ready: function () {
        this._domReady = true;
        this._loadNicEditor();
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
            <div class="container xmlliteral-value">\
                <div id="xmlliteral-edit-panel-' + this.ID + '" class="xmlliteral-edit-panel"></div>\
                <div id="xmlliteral-edit-input-' + this.ID + '" class="xmlliteral-edit-input">' 
                    + (this.statement.hasObject() ? this.statement.objectValue() : '') 
                    + '</div>\
            </div>';

        return markup;
    }, 
    
    // commit changes here (add/remove/change)
    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank = RDFauthor.databankForGraph(this.statement.graphURI());
            
            var somethingChanged = (
                this.statement.hasObject() 
                && this.statement.objectValue() !== this.value()
            );
            
            if (somethingChanged || this.removeOnSubmit) {
                databank.remove(this.statement.asRdfQueryTriple());
            }
            
            if ((null !== this.value()) && !this.removeOnSubmit) {
                try {
                    var newStatement = this.statement.copyWithObject({value: this.value(), options: {datatype: this._datatype}});
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
        var editor = this._editor.instanceById('xmlliteral-edit-input-' + this.ID);        
        if (editor && ('' !== editor.getContent())) {
            return editor.getContent();
        }
        
        return null;
    }
}, {
        name: 'datatype',
        values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
    }
);