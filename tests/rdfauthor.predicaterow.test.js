$(document).ready(function() {
    // dummy RDFauthor
    RDFauthor = {
        nextID: function() {return Math.round(Math.random() * 1000)}
    }

    // dummy widget
    Widget = function(s) {
        this.s = s;
        this.remove = false;
        this.cancel = false;
        this.submit = false;
    }
    // dummy widget prototype
    Widget.prototype = {
        init: function () {
            // do nothing
        }, 
        getHTML: function () {
            return '<span>I am a widget!</span>';
        }, 
        onRemove: function() {
            this.remove = true;
        }, 
        onCancel: function() {
            this.cancel = true;
        }, 
        onSubmit: function() {
            this.submit = true;
        }
    };

    module('rdfauthor.predicaterow', {
        setup: function () {
            this.fixture = new PredicateRow('http://example.com/r1', 'http://example.com/p1', 'Predicate', $('#test-container'), 123);
        }, 
        teardown: function () {
            this.fixture = null;
            $('#' + TEST_CONTAINER_ID).empty();
        }
    });

    test('init', function() {
        expect(4);
        ok(this.fixture instanceof PredicateRow, 'Should be instanceof PredicateRow');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').length, 1, 'Test container should have 1 child of class property-row.');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').attr('id'), this.fixture._idPrefix + 123, 'Property row id should be ' + this.fixture._idPrefix + 123);
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
    });

    test('addWidget', function() {       
        expect(4);
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget({}, Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').children('fieldset').children('.widget').length, 1, 'HTML for one widget should be in DOM.');
        equal($('#' + TEST_CONTAINER_ID).children('.property-row').children('fieldset').children('#' + id).attr('id'), id, 'Widget CSS id should be the id returned.');
    });

    test('getWidgetForID', function() {
        expect(1);
        var id = this.fixture.addWidget({}, Widget);
        same(this.fixture.getWidgetForID(id), new Widget({}), 'Widget should be the same as a newly created one.');
    });
    
    test('removeWidget', function() {
        expect(5);
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget({}, Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');
        this.fixture.removeWidget(id);
        equal(this.fixture.getWidgetForID(id).remove, true, 'onRemove should have been called for widget.');
        
        // test for issue 1
        // http://code.google.com/p/rdfauthor/issues/detail?id=1
        // alert($('#' + this.cssID()).children('fieldset').children('.widget').length);
        equal($('#' + this.fixture.cssID()).children('fieldset').children('.widget').length, 0, 'Ther sould be 0 widgets visible.');
        equal($('#' + this.fixture.cssID()).css('display'), 'none', 'Should be hidden if all widgets have been removed.');
    });
    
    test('onCancel', function() {
        expect(3);
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget({}, Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');
        this.fixture.onCancel();
        equal(this.fixture.getWidgetForID(id).cancel, true, 'onCancel should have been called for widget.');
    });
    
    test('onSubmit', function() {
        expect(3);
        equal(this.fixture.numberOfWidgets(), 0, 'Should have no widgets.');
        var id = this.fixture.addWidget({}, Widget);
        equal(this.fixture.numberOfWidgets(), 1, 'Should have 1 widget.');
        this.fixture.onSubmit();
        equal(this.fixture.getWidgetForID(id).submit, true, 'onSubmit should have been called for widget.');
    });
});