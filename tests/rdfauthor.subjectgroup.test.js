$(document).ready(function() {
    // dummy statements
    var statement1 = {
        subjectURI: function () {return 'http://example.com/subject1'}, 
        predicateURI: function () {return 'http://example.com/predicate1'}, 
        predicateLabel: function () {return 'Predicate 1'}
    };
    var statement2 = {
        subjectURI: function () {return 'http://example.com/s1'}, 
        predicateURI: function () {return 'http://example.com/p2'}, 
        predicateLabel: function () {return 'Predicate 2'}
    };
    var statement1 = {
        subjectURI: function () {return 'http://example.com/subject1'}, 
        predicateURI: function () {return 'http://example.com/predicate1'}, 
        predicateLabel: function () {return 'Predicate 1\''}
    };
    
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
    
    if (PredicateRow == undefined) {
        PredicateRow = function (sub, pred, tit, cont, id) {};
        PredicateRow.prototype = {
            addWidget: function (s) {}
        }
    }
    
    module('rdfauthor.subjectgroup', {
        setup: function () {
            this.fixture = new SubjectGroup('http://example.com/subject1', 'Subject 1', $('#test-container'), 11);
        }, 
        teardown: function () {
            this.fixture = null;
            $('#' + TEST_CONTAINER_ID).empty();
        }
    });
    
    test('init', function() {
       expect(2),
       ok(this.fixture instanceof SubjectGroup, 'Should be instanceof SubjectGroup');
       equal($('#test-container').children('.subject-group').length, 1, 'Container should have 1 child of class subject-group.');
    });
    
    test('addWidget', function() {
        expect(2);
        
        this.fixture.addWidget(statement1, Widget);
        equal(this.fixture.numberOfRows(), 1, 'Should have 1 row.');
        
        // add wrong statement
        try {
            this.fixture.addWidget(statement2);
        } catch (e) {
            equal(String(e), 'Statement not associated with this row (invalid subject).', 'Expected exception');
        }
    });
    
    test('getRowByID', function() {
        
    });
    
    test('getRowByPredicate', function() {
        expect(2);
        this.fixture.addWidget(statement1, Widget);
        var r = this.fixture.getRowByPredicate('http://example.com/predicate1');
        ok(r instanceof PredicateRow, 'Should be an instanceof PredicateRow');
        this.fixture.addWidget(statement1, Widget);
        var r2 = this.fixture.getRowByPredicate('http://example.com/predicate1');
        equal(r2, r, 'Rows should be equal.');
    });
    
    test('show', function() {
        expect(2);
        var el = this.fixture.getElement();
        $(el).hide();
        equal($(el).css('display'), 'none', 'Element should not be visible before');
        this.fixture.show(false);
        ok($(el).css('display') != 'none', 'Element should be visible afterwards.');
    });
    
    test('hide', function() {
        expect(2);
        var el = this.fixture.getElement();
        $(el).show();
        ok($(el).css('display') != 'none', 'Element should be visible before.');
        this.fixture.hide(false);
        equal($(el).css('display'), 'none', 'Element should not be visible afterwards');
    });
});
