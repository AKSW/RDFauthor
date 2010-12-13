$(document).ready(function() {
    var search = 'Datenbank';
    var endpoint = 'http://localhost/ontowiki/sparql';
    var resultTemp = undefined;
    var subjectArray = [];

    module('setup');
    test('setup', 1, function() {
        ok(typeof Alida == 'object', 'Alida should be of type \'object\'.');
    });

    test('addEndpoint', 1, function(endpoint) {
        Alida.addEndpoint('http://localhost/ontowiki/sparql');
        equal(Alida.getEndpoints().length,1,'Endpoint was added.');
    });

    test('getEndpoint', 1, function() {
        equal(Alida.getEndpoints()[0],endpoint,'Got the right entered endpoint.')
    });

    module('query');
    test('send query', 1, function(){
        stop();
        Alida.query(search, function(result) {
            start();
            resultTemp = result;
            ok(true,'Query successfully sent.');
        });
    });
    
    test('get result', 3, function() {
        ok(typeof resultTemp == 'object', 'Result should be of type \'object\'.');
        ok(typeof resultTemp['query'] == 'string', 'Query should be of type \'string\'.\n Query: '+resultTemp['query']);
        ok(resultTemp.sizeOfSubjects() > 0, 'Number of subjects should be greater than zero. Number: '+resultTemp.sizeOfSubjects());
    });
    
    module('facets');
    test('get facets', function() {
        stop();
        resultTemp.facets(function() {
            start();
            ok(true,'Facets received successfully.');
            test('get number of facets of each subject', resultTemp.sizeOfSubjects(), function(){
                var numS=0;
                for (var subjectURI in resultTemp.subjects) {
                    ok(resultTemp.subjects[subjectURI].sizeOfFacets() > 0, resultTemp.subjects[subjectURI].URI + ' - ' + resultTemp.subjects[subjectURI].sizeOfFacets());
                    subjectArray.push(subjectURI);
                    test(subjectURI, resultTemp.subjects[subjectURI].sizeOfFacets(), function() {
                        for (var f in resultTemp.subjects[subjectArray[numS]].facets) {
                            ok(typeof resultTemp.subjects[subjectArray[numS]].facets[f] == 'object','[ ' + f + ' ] should be of type \'object\'.');
                            resultTemp.subjects[subjectArray[numS]].getValues(resultTemp.subjects[subjectArray[numS]].facets[f],function(value,type,subject,facet) {
                                module('facet values');
                                test(subject + ' - ' + facet, 2, function() {
                                    ok(value.length != 0,'value != null. Result: ' + value);
                                    ok(type == 'literal' || 'uri', 'Facet value type is literal or uri. Result: ' + type);
                                });
                            });
                        }
                        numS++;
                    });
                }
            });
        });
    });

});