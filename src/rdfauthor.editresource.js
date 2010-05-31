/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

var ResourceEdit = RDFauthor.createWidget();

// ResourceEdit.prototype.ready = function () {
//     
// }

ResourceEdit.prototype.name = 'ResourceEdit';

ResourceEdit.prototype.element = function () {
    return jQuery('#resource-input-' + this.ID);
}

ResourceEdit.prototype.markup = function () {    
    var markup = '\
        <div class="container resource-value" style="width:90%">\
            <input type="hidden" id="resource-value-' + this.ID + '" value="' + this.statement.objectValue() + '" />\
            <input type="text" id="resource-input-' + this.ID + '" class="text resource-edit-input" \
                   value="' + this.statement.objectValue() + '" style="width:100%" />\
        </div>';
    
    return markup;
}

ResourceEdit.prototype.remove = function () {
    this.removeOnSubmit = true;
}

ResourceEdit.prototype.submit = function () {
    alert('Submit');
}

RDFauthor.registerWidget({constructorFunction: ResourceEdit, hookName: '__OBJECT__'});