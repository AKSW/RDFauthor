/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

var WIDGET_TEL_JS = 1;

/*
 * RDFauthor widget template.
 * Use this as a base for your own widget implementations.
 */
RDFauthor.registerWidget({
    /*
    // Uncomment this to execute code when your widget is instantiated, 
    // e.g. load scripts/stylesheets etc.
    init: function () {},
    */ 
    
    // Uncomment this to execute code when you widget's markup is ready in the DOM, 
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {
        var self   = this;
        var cssRed = 'rgb(255, 187, 187)';
        this.element().keyup(function (event) {
            if (!self.validateLabel(self.element().val())) {
                var currentColour = self.element().css('background-color');
                if (currentColour != cssRed) {
                    self.element().data('previousColour', self.element().css('background-color'));
                }
                self.element().css('background-color', cssRed);
            } else {
                self.element().css('background-color', self.element().data('previousColour'));
            }
        });
    },
    
    // return your jQuery-wrapped main input element here
    element: function () {
        return $('#phone-value-' + this.ID);
    }, 
    
    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the 
    // return value of element().
    focus: function () {},
    */ 
    
    // return your widget's markup code here
    markup: function () {
        var markup = '\
            <div class="container resource-value" style="width:100%">\
                <input type="text" id="phone-value-' + this.ID + '" class="text" size="20"\
                 value="' + this.labelForURI(this.statement.objectValue()) + '"\
                 style="width:51%;\
                        box-sizing: border-box;\
                        -moz-box-sizing: border-box;\
                        -webkit-box-sizing: border-box;\
                        background-position: 1% center;\
                        background-image:url(\'' + RDFAUTHOR_BASE + 'img/phone.png\');\
                        background-repeat:no-repeat;\
                        padding-left:20px" />\
            </div>';

        return markup;
    }, 
    
    // commit changes here (add/remove/change)
    submit: function () {
        if (this.shouldProcessSubmit()) {
            // get databank
            var databank   = RDFauthor.databankForGraph(this.statement.graphURI());
            var hasChanged = (
                this.statement.hasObject() 
                && this.statement.objectValue() !== this.value()
            );
            
            if (hasChanged || this.removeOnSubmit) {
                var rdfqTriple = this.statement.asRdfQueryTriple();
                if (rdfqTriple) {
                    databank.remove(String(rdfqTriple));
                }
            }
            
            if (!this.removeOnSubmit) {
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
    
    value: function() {
        var typedValue = this.element().val();
        if ('' !== typedValue) {
            return this.URIForLabel(typedValue);
        }
        
        return null;
    },
    
    labelForURI: function (URI) {
        var label = String(URI)
            .replace(/tel:/g, '')   // remove the tel: prefix
            .replace(/-/g, ' ');    // create spaces
        
        return label;
    }, 
    
    validateLabel: function (label) {
        var phoneRE = new RegExp(
            /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/
        );
        
        return phoneRE.test(label);
    }, 
    
    URIForLabel: function (label) {
        var URI = String(label)
            .replace(/\ /g, '-');   // create "-" instead of spaces
        
        return 'tel:' + URI;
    }
}, [{
    // hooks to register your widget for
        // Uncomment this if your widgets binds to the property hook, 
        // and denote the type of property (ObjectProperty or DatatypeProperty).
        // For other hooks this can be inferred automatically.
        type: 'ObjectProperty', 
        // name of first hook
        name: 'property',
        // array of values for first hook 
        values: ['http://xmlns.com/foaf/0.1/phone', 
                 'http://purl.org/net/ldap#mobile', 
                 'http://purl.org/net/ldap#homePhone', 
                 'http://purl.org/net/ldap#telephoneNumber', 
                 'http://purl.org/net/ldap#fax']
    }]
);

