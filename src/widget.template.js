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
    
    /*
    // Uncomment this to execute code when you widget's markup is ready in the DOM, 
    // e.g. load jQuery plug-ins, attach event handlers etc.
    ready: function () {},
    */ 
    
    // return your jQuery-wrapped main input element here
    element: function () {
        
    }, 
    
    /*
    // Uncomment to give focus to your widget.
    // The default implementation will give focus to the first match in the 
    // return value of element().
    focus: function () {},
    */ 
    
    // return your widget's markup code here
    markup: function () {
        
    }, 
    
    // perform widget and triple removal here
    remove: function () {
        
    }, 
    
    // commit changes here (add/remove/change)
    submit: function () {
        
    }
}, {
    // hooks to register your widget for
    hooks: [{
        /*
        // Uncomment this if your widgets binds to the property hook, 
        // and denote the type of property (ObjectProperty or DatatypeProperty).
        // For other hooks this can be inferred automatically.
        type: 'DatatypeProperty', 
        */
        // name of first hook
        name: 'datatype',
        // array of values for first hook 
        values: ['http://www.w3.org/2001/XMLSchema#string']
    }/* add more hooks here */]
});