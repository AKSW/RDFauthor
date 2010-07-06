/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

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
            <div class="container resource-value" style="width:' + this.availableWidth() + 'px;">\
                <input type="text" id="phone-value-' + this.ID + '" class="text" size="20"\
                 value="' + this.labelForURI(this.statement.objectValue()) + '"\
                 style="width:' + (this.availableWidth() / 2 - 20) + 'px;\
                        background-position:1% center;\
                        background-image:url(\'' + RDFAUTHOR_BASE + 'img/phone.png\');\
                        background-repeat:no-repeat;\
                        padding-left:20px" />\
            </div>';

        return markup;
    }, 
    
    // perform widget and triple removal here
    remove: function () {
        
    }, 
    
    // commit changes here (add/remove/change)
    submit: function () {
        
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
    
    URIForLabel: function () {
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