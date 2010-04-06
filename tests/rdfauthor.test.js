$(document).ready(function() {
    module('rdfauthor', {
        setup: function () {
            this.fixture = RDFauthor;
        }, 
        
        teardown: function () {
            this.fixture = null;
        }
    });
    
    test('setup', function() {
        ok(typeof this.fixture == 'object', 'RDFauthor should be of type \'object\'.');
    });
    
    test('nextID', function() {
        var first = this.fixture.nextID();
        equal(this.fixture.nextID(), Number(first) + 1);
        equal(this.fixture.nextID('prefix'), 'prefix' + (Number(first) + 2));
    })
});
