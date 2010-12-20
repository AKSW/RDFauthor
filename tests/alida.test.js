$(document).ready(function() {
    var search = 'Datenbank';
    var endpoint = 'http://localhost/ontowiki/sparql';
    var resultTemp;
    var subjectArray = [];
    
    QUnit.testStart = function (name) {
        if (name == 'send query') {
            $.ajax = function (options) {
                options.success(null, null, {
                    getResponseHeader: function () {
                        return 'application/sparql-results+json';
                    }, 
                    responseText: '{"head":{"vars":["s","search"]},"results":{"bindings":[{"s":{"type":"uri","value":"http:\/\/od.fmi.uni-leipzig.de\/s10\/ASV.TextDatenbanken"},"search":{"type":"literal","value":"Kernmodul Textdatenbanken"}}]}}'
                });
            };
        } else if (name == 'get facets') {
            $.ajax = function (options) {
                options.success(null, "success", {
                    getResponseHeader: function () {
                        return 'application/sparql-results+json';
                    }, 
                    responseText: '{"head":{"vars":["facet"]},"results":{"bindings":[{"facet":{"type":"uri","value":"http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type"}}]}}'
                });
                options.complete(null, "success");
            };
        } else if (name == 'testsubject') {
            $.ajax = function (options) {
                options.success(null, "success", {
                    getResponseHeader: function () {
                        return 'application/sparql-results+json';
                    }, 
                    responseText: '{"head":{"vars":["value"]},"results":{"bindings":[{"value":{"type":"uri","value":"http:\/\/od.fmi.uni-leipzig.de\/model\/Block"}}]},"bindings":[{"value":{"type":"uri","value":"http:\/\/od.fmi.uni-leipzig.de\/model\/Block"}}]}'
                });
            };
        }
    }
    
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
                    test('testsubject', resultTemp.subjects[subjectURI].sizeOfFacets(), function() {
                        for (var f in resultTemp.subjects[subjectArray[numS]].facets) {
                            ok(typeof resultTemp.subjects[subjectArray[numS]].facets[f] == 'object','[ ' + f + ' ] should be of type \'object\'.');
                            resultTemp.subjects[subjectArray[numS]].getValues(resultTemp.subjects[subjectArray[numS]].facets[f],function(fvalue,type,value,label,subject,facet) {
                                module('facet values and callback test');
                                test('facet value test', 6, function() {
                                    ok(fvalue[type] == 'literal' || 'uri', 'fvalue[type]is literal or uri. Result: ' + fvalue[type]);
                                    ok(fvalue[value].length != 0,'fvalue[value] != null. Result: ' + fvalue[value]);
                                    ok(fvalue[label].length != 0,'fvalue[label] != null. Result: ' + fvalue[label]);
                                    ok(type == 'literal' || 'uri', 'Facet value type is literal or uri. Result: ' + type);
                                    ok(value.length != 0,'value != null. Result: ' + value);
                                    ok(label.length != 0,'label != null. Result: ' + label);
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