$(document).ready(function() {
    // dummy widget to work with
    RDFauthor.registerWidget({
        // Uncomment this to execute code when your widget is instantiated, 
        // e.g. load scripts/stylesheets etc.
        init: function () {
            this._init = true;
            this._ready = false;
            this._element = false;
        },

        /*
        // Uncomment this to execute code when you widget's markup is ready in the DOM, 
        // e.g. load jQuery plug-ins, attach event handlers etc.
        ready: function () {},
        */ 

        // Return your jQuery-wrapped main input element here
        element: function () {

        }, 

        /*
        // Uncomment to give focus to your widget.
        // The default implementation will give focus to the first match in the 
        // return value of element().
        focus: function () {},
        */ 

        // Return your widget's markup code here using this.ID for an
        // identifier. See widget.prototype.js for other variables/methods
        // you can use.
        markup: function () {

        }, 

        /*
        // Uncomment to mark the current triple for removal here.
        // Actual databank writes should be done in submit().
        // Removing the widget markup from the DOM is done by RDFauthor.
        // The default implementation sets 
        //   this.removeOnSubmit = true;
        remove: function () {

        },
        */ 

        // Commit changes to databank here (add/remove/change).
        // You can retrieve the databank containing the graph your widget's 
        // triple belongs to from RDFauthor by calling
        //   var databank = RDFauthor.databankForGraph(this.statement.graphURI());
        submit: function () {

        }
    }, [{
            // Name of first hook
            name: '__DEBUG__'
        }/* add more hooks here */]
    );
    
    module('rdfauthor.widget');
    
    // test('instantiation', 1, function() {
    //     MyWidget = new Widget();
    //     
    //     var w1 = new MyWidget('foo');
    //     var w2 = new MyWidget('bar');
    //     ok(w1.ID != w2.ID, 'Two widget instances should have different IDs.');
    // });
});
