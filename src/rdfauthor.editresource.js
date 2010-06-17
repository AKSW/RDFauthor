/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

RDFauthor.registerWidget({
    name: 'ResourceEdit', 
    
    /*
    init: function () {
        alert('init: ' + this.ID + ' (' + this.element().length + ')');
    }, 
    
    ready: function () {
        alert('ready: ' + this.ID + ' (' + this.element().length + ')');
    }, 
    */
    
    element: function () {
        return jQuery('#resource-input-' + this.ID);
    }, 
    
    markup: function () {    
        var markup = '\
            <div class="container resource-value" style="width:90%">\
                <input type="hidden" id="resource-value-' + this.ID + '" value="' + this.statement.objectValue() + '" />\
                <input type="text" id="resource-input-' + this.ID + '" class="text resource-edit-input" \
                       value="' + this.statement.objectValue() + '" style="width:100%" />\
            </div>';

        return markup;
    }, 
    
    remove: function () {
        this.removeOnSubmit = true;
    }, 
    
    submit: function () {
        alert('Submit');
    }
    
}, {
    hookName: '__OBJECT__'
});
