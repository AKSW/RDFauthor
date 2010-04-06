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
    
    // dummy RDFauthor
    if (RDFauthor == undefined) {
        RDFauthor = {
            nextID: function() {return Math.round(Math.random() * 1000)}
        }
    }
    
    // dummy widget
    if (Widget == undefined) {
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
    }
    
    if (SubjectGroup == undefined) {
        SubjectGroup = function (uri, title, container, id) {};
        SubjectGroup.prototype = {
            addWidget: function (s) {}
        }
    }
    
    module('rdfauthor.view', {
        setup: function () {
            this.fixtureID = 'rdfAuthorViewTest';
            this.fixtureTitle = 'View Test Title';
            this.fixtureContentContainerClass = 'rdfAuthorViewTestContentContainer';
            this.fixture = new View({
                id: this.fixtureID, 
                container: $('#' + TEST_CONTAINER_ID), 
                title: this.fixtureTitle, 
                contentContainerClass: this.fixtureContentContainerClass
            });
        }, 
        teardown: function () {
            this.fixture = null;
            // $('#' + TEST_CONTAINER_ID).empty();
        }
    });
    
    test('init', function() {
        expect(4);
        ok(this.fixture instanceof View, 'Should be instance of View.');
        equal($('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).length, 1, 'Container should have 1 child with view\'s id.');
        ok($('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).hasClass('window'), 'View should have class window.');
        equal($('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).children('.title').html(), this.fixtureTitle, 
              'View window should have the title that was set on instantiation.');
    });
    
    test('addWidget', function() {
        expect(3);
        this.fixture.addWidget(statement1, Widget);
        equal(this.fixture._subjectCount, 1, 'Should have 1 subject.');
        this.fixture.addWidget(statement2, Widget);
        equal(this.fixture._subjectCount, 2, 'Should have 2 subjects.');
        this.fixture.addWidget(statement1, Widget);
        equal(this.fixture._subjectCount, 2, 'Should have 2 subjects.');
    });
    
    test('getContentContainer', function() {
        expect(1);
        equal(this.fixture.getContentContainer().get(0), 
            $('#' + TEST_CONTAINER_ID).children('#' + this.fixtureID).children('.' + this.fixtureContentContainerClass).get(0), 
            'Returned DOM element should match container set on instantiation.');
    });
    
    test('getElement', function() {
        expect(2);
        ok(this.fixture.getElement() instanceof HTMLElement, 'Element returned should be an instance of HTMLElement.');
        equal($(this.fixture.getElement()).attr('id'), 'rdfAuthorViewTest', 'Should have the id given on initialization.');
    });
    
    test('getSubjectGroup', function() {
        expect(2);
        this.fixture.addWidget(statement1, Widget);
        equal(this.fixture._subjectCount, 1, 'Should have 1 subject.');
        ok(this.fixture.getSubjectGroup('http://example.com/subject1') instanceof SubjectGroup, 
            'Returned subject group should be an instance of SubjectGroup.');
    });
    
    test('cssID', function() {
        expect(1);
        equal(this.fixture.cssID(), this.fixtureID, 'Should return CSS id passed on initialization.');
    });
    
    test('numberOfSubjects', function() {
        expect(4);
        equal(this.fixture.numberOfSubjects(), 0, 'Should have 0 subjects.');
        this.fixture.addWidget(statement1, Widget);
        equal(this.fixture.numberOfSubjects(), 1, 'Should have 1 subject.');
        this.fixture.addWidget(statement2, Widget);
        equal(this.fixture.numberOfSubjects(), 2, 'Should have 2 subjects.');
        this.fixture.addWidget(statement1, Widget);
        equal(this.fixture.numberOfSubjects(), 2, 'Should still have 2 subjects.');
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