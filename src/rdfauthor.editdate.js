/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated, 
    // e.g. load scripts/stylesheets etc.
    init: function () {
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/rdfauthor.editdate.css');
    },
    
    // Uncomment this to execute code when you widget's markup is ready in the DOM, 
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        this.element().datepicker({
            dateFormat: $.datepicker.ISO_8601, 
            // showOn: 'both', 
            firstDay: 1
        });

        $('#ui-datepicker-div').css('z-index', 10000);
    },
    
    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#date-edit-' + this.ID);
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
            '<div class="container">\
                <input type="text" class="text" id="date-edit-' + this.ID + '" value="' 
                    + (this.statement.hasObject() ? this.statement.objectValue() : '') + '"/>\
            </div>';

        return markup;
    }, 
    
    // perform widget and triple removal here
    remove: function () {
        
    }, 
    
    // commit changes here (add/remove/change)
    submit: function () {
        
    }
}, {
        name: 'datatype',
        values: ['http://www.w3.org/2001/XMLSchema#date']
    }
);