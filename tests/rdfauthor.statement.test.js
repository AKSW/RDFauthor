$(document).ready(function() {
    module('Statement', {
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
       equal(String(s1), '<http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .');
       
       var s2 = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: 'Bar'});
       equal(String(s2), '<http://example.com/r1> <http://example.com/p1> "Bar" .');
    });
    
    test('initComlex', function() {
        expect(3);
        
        var s1 = new Statement({
            subject: {value: '<http://example.com/r1>'}, 
            predicate: {value: 'ex:p1', options: {namespaces: {'ex': 'http://example.com/'}}}, 
            object: {value: '<http://example.com/o1>'}
        });
        equal(String(s1), '<http://example.com/r1> <http://example.com/p1> <http://example.com/o1> .');

        var s2 = new Statement({
            subject: '<http://example.com/r1>', 
            predicate: '<http://example.com/p1>', 
            object: {value: 'Bar', options: {datatype: 'http://www.w3.org/2001/XMLSchema#string'}}});
        equal(String(s2), '<http://example.com/r1> <http://example.com/p1> "Bar"^^<http://www.w3.org/2001/XMLSchema#string> .');
        
        var s3 = new Statement({
            subject: '<http://example.com/r1>', 
            predicate: '<http://example.com/p1>', 
            object: {value: 'ttt', options: {lang: 'de'}}});
        equal(String(s3), '<http://example.com/r1> <http://example.com/p1> "ttt"@de .');
    });
    
    test('asRdfQueryTriple', function() {
        expect(2);
        ok(this.fixture.asRdfQueryTriple() instanceof $.rdf.triple);
        equal(String(this.fixture.asRdfQueryTriple()), '<http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .');
    });
    
    test('toString', function() {
        expect(1);
        equal(this.fixture.toString(), '<http://example.com/r1> <http://ns.aksw.org/update/p1> "Foo" .');
    });
    
    test('isHiddden', function() {
        expect(1);
        ok(this.fixture.isHidden());
    });
    
    test('isRequired', function() {
        expect(1);
        ok(this.fixture.isRequired());
    });
    
    test('isProtected', function() {
        expect(1);
        equals(this.fixture.isProtected(), true);
    });
    
    test('isUpdateVocab', function() {
       expect(1);
       equals(this.fixture.isUpdateVocab(), true);
    });
    
    test('hasObject', function() {
        expect(2);
        ok(this.fixture.hasObject(), 'Test w/ object defined');
        
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: null});
        equal(s.hasObject(), false, 'Test w/o object defined');
    });
    
    test('predicateLabel', function() {
        expect(2);
        equal(this.fixture.predicateLabel(), 'Property One');
        
        // if no label given, URI should be used
        var s = new Statement({subject: '<http://example.com/r1>', predicate: '<http://example.com/p1>', object: '<http://example.com/o1>'});
        equal(s.predicateLabel(), 'http://example.com/p1');
    });
    
    test('isDatatypeValid', function() {
        expect(2);
        
        // xsd:string should be valid
        ok(this.fixture.isDatatypeValid('http://www.w3.org/2001/XMLSchema#string')  );
        
        // this should fail
        equal(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), false);
    });
    
    test('registerDatatype', function() {
        expect(2);
        
        // datatype should be invalid
        equal(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'), false);
        
        // register it
        this.fixture.registerDatatype('http://example.com/myUnregisteredDatatype');
        
        // should be ok now
        ok(this.fixture.isDatatypeValid('http://example.com/myUnregisteredDatatype'));
    });
});

