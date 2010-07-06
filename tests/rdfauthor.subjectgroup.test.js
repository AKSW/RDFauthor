$(document).ready(function() {    
    // dummy RDFauthor
    RDFauthor = {
        nextID: function() {return Math.round(Math.random() * 1000)}, 
        getWidgetForHook: function () {return new _Widget}. 
        getWidgetForStatement: function () {return new _Widget}
    }
    
    // dummy statements
    var statement1 = {
        subjectURI: function () {return 'http://example.com/subject1'}, 
        predicateURI: function () {return 'http://example.com/predicate1'}, 
        predicateLabel: function () {return 'Predicate 1'}, 
        hasObject: function () {return false}, 
        objectDatatype: function () {return null}, 
        objectLang: function () {return null}, 
        objectType: function () {return 'uri'}
    };

    // dummy widget
    _Widget = function(s) {
        this.s = s;
        this.remove = false;
        this.cancel = false;
        this.submit = false;
    }
    // dummy widget prototype
    _Widget.prototype = {
        init: function () {
            // do nothing
        }, 
        markup: function () {
            return '<span>I am a widget!</span>';
        }, 
        remove: function() {
            this.remove = true;
        }, 
        cancel: function() {
            this.cancel = true;
        }, 
        submit: function() {
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
        
        this.fixture.addWidget(statement1, new _Widget);
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
        this.fixture.addWidget(statement1, new _Widget);
        var r = this.fixture.getRowByPredicate('http://example.com/predicate1');
        ok(r instanceof PredicateRow, 'Should be an instanceof PredicateRow');
        this.fixture.addWidget(statement1, _Widget);
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
