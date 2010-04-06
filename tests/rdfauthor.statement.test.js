$(document).ready(function() {
    module('rdfauthor.statement', {
        setup: function () {
            this.fixture = new Statement({
                subject: '<http://example.com/r1>', 
                predicate: '<http://ns.aksw.org/update/p1>', 
                object: {
                    value: 'Foo'
                }}, {hidden: true, required: true, protected: true, title: 'Property One'});
        }, 
        teardown: function () {
            this.fixture = null;
        }
    });
    
    test('initSimple', function() {
       expect(2);
       var s1 = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: '<http://example.com/o1>'});
       equal(
           String(s1), 
           '<http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .', 
           'Statement should be <http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .');
       
       var s2 = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: 'Bar'});
       equal(
           String(s2), 
           '<http://example.com/r1> <http://example.com/p1> "Bar" .', 
           'Statement should be <http://example.com/r1> <http://example.com/p1> "Bar" .');
    });
    
    test('initComlex', function() {
        expect(3);
        
        var s1 = new Statement({
            subject: {value: '<http://example.com/r1>'}, 
            predicate: {value: 'ex:p1', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: '<http://example.com/o1>'}
        });
        equal(
            String(s1), 
            '<http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .', 
            'Statement should be <http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .');

        var s2 = new Statement({
            subject: '<http://example.com/r1>', 
            predicate: '<http://example.com/p1>', 
            object: {value: 'Bar', options: {datatype: 'http://www.w3.org/2001/XMLSchema#string'}}});
        equal(
            String(s2), 
            '<http://example.com/r1> <http://example.com/p1> "Bar"^^<http://www.w3.org/2001/XMLSchema#string> .', 
            'Statemetn should be <http://example.com/r1> <http://example.com/p1> "Bar"^^<http://www.w3.org/2001/XMLSchema#string> .');
        
        var s3 = new Statement({
            subject: '<http://example.com/r1>', 
            predicate: '<http://example.com/p1>', 
            object: {value: 'ttt', options: {lang: 'de'}}});
        equal(
            String(s3), 
            '<http://example.com/r1> <http://example.com/p1> "ttt"@de .', 
            'Statement should be <http://example.com/r1> <http://example.com/p1> "ttt"@de .');
    });
    
    test('asRdfQueryTriple', function() {
        expect(2);
        ok(this.fixture.asRdfQueryTriple() instanceof $.rdf.triple, 'should be instanceof $.rdf.triple');
        equal(
            String(this.fixture.asRdfQueryTriple()), 
            '<http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .', 
            'Statement should be <http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .');
    });
    
    test('toString', function() {
        expect(1);
        equal(
            this.fixture.toString(), 
            '<http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .', 
            'Statement should be <http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .');
    });
    
    test('isHiddden', function() {
        expect(1);
        ok(this.fixture.isHidden(), 'Statement should be hidden.');
    });
    
    test('isRequired', function() {
        expect(1);
        ok(this.fixture.isRequired(), 'Statement should be required.');
    });
    
    test('isProtected', function() {
        expect(1);
        equals(this.fixture.isProtected(), true, 'Statement should be protected.');
    });
    
    test('isUpdateVocab', function() {
       expect(1);
       equals(this.fixture.isUpdateVocab(), true, 'Statement should be from update vocab.');
    });
    
    test('hasObject', function() {
        expect(2);
        ok(this.fixture.hasObject(), 'Test w/ object defined', 'Statement should have an object.');
        
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: null});
        equal(s.hasObject(), false, 'Test w/o object defined', 'Statement should not have an object.');
    });
    
    test('predicateLabel', function() {
        expect(3);
        equal(this.fixture.predicateLabel(), 'Property One', 'predicate label should be Property One.');
        
        // if no label given, URI should be used
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: '<http://example.com/o1>'});
        equal(s.predicateLabel(), 'p1', 'predicate label should be p1');
        
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com#ttt>', object: '<http://example.com#abc>'});
        equal(s.predicateLabel(), 'ttt', 'predicate label should be ttt.');
    });
    
    test('isDatatypeValid', function() {
        expect(2);
        
        // xsd:string should be valid
        ok(this.fixture.isDatatypeValid('http://www.w3.org/2001/XMLSchema#string'), 'xsd:string should be valid.');
        
        // this should fail
        equal(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), false, 'ex:myUnregisteredDatatype should not be valid.');
    });
    
    test('registerDatatype', function() {
        expect(2);
        
        // datatype should be invalid
        equal(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), false, 'ex:myUnregisteredDatatype should be invalid.');
        
        // register it
        this.fixture.registerDatatype('http://example.com/myUnregisteredDatatype');
        
        // should be ok now
        ok(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), 'ex:myUnregisteredDatatype should be valid.');
    });
});

