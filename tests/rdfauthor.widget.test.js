$(document).ready(function() {    
    // dummy RDFauthor
    if (typeof RDFauthor == 'undefined') {
        RDFauthor = {
            nextID: function() {
                return Math.round(Math.random() * 1000);
            }, 
            newWidget: function() {
                function F() {
                    Widget.construct.apply(this, arguments);
                    this.ID = RDFauthor.nextID();
                };
                F.prototype = Widget;
                return F;
            }
        }
    }
    
    module('rdfauthor.widget');
    
    test('instantiation', 1, function() {
        MyWidget = RDFauthor.createWidget();
        
        var w1 = new MyWidget('foo');
        var w2 = new MyWidget('bar');
        ok(w1.ID != w2.ID, 'Two widget instances should have different IDs.');
    });
});
