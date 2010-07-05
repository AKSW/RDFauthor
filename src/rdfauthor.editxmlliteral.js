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
        }
    }, 
    
    // Uncomment this to execute code when your widget is instantiated, 
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this._nicEditLoaded = false;
        this._domReady      = false;
        
        var self = this;
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/nicEdit.js', function () {
            self._nicEditLoaded = true;
            self._loadNicEditor();
        });
        
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/rdfauthor.editxmlliteral.css');
    },
    
    // Uncomment this to execute code when you widget's markup is ready in the DOM, 
    // e.g. load jQuery plug-ins, attache event handlers etc.
    ready: function () {
        this._domReady = true;
        this._loadNicEditor();
    },
    
    // return your jQuery-wrapped main input element here
    element: function () {
        return jQuery(this.ID);
    }, 
    
    /*
    // Uncomment to give focus to your widget.
    // Default implementation will giver focus to the return value of element().
    focus: function () {},
    */ 
    
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
    
    // perform widget and triple removal here
    remove: function () {
        
    }, 
    
    // commit changes here (add/remove/change)
    submit: function () {
        
    }
}, [{
        name: 'datatype',
        values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
    }]
);