/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */
RDFauthor.registerWidget({
    // Uncomment this to execute code when your widget is instantiated, 
    // e.g. load scripts/stylesheets etc.
    init: function () {
        this.datatype = 'http://www.w3.org/2001/XMLSchema#date';
        RDFauthor.loadScript(RDFAUTHOR_BASE + 'libraries/jquery.ui.datepicker.js');
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.date.css');
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
            '<div class="container" style="width:' + this.availableWidth() + 'px;">\
                <input type="text" style="width:50%" class="text" id="date-edit-' + this.ID + '" value="' 
                    + (this.statement.hasObject() ? this.statement.objectValue() : '') + '"/>\
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
                    var newStatement = this.statement.copyWithObject({value: this.value(), options: {datatype: this.datatype}});
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
        var value = $('#date-edit-' + this.ID).val();
        if ('' !== value) {
            return value;
        }
        
        return null;
    }
}, {
        name: 'datatype',
        values: ['http://www.w3.org/2001/XMLSchema#date']
    }
);