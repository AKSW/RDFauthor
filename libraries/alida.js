Alida = (function ($) {

    var _options = {
        // TODO: defaults
    };

    var _endpoints = new Array();
    
    function _private() {
        
    };
    
    return {
        setOptions: function (options) {
            _options = $.extend(_options, options);
        }, 
        
        addEndpoint: function (endpointURI) {
            _endpoints.push(endpointURI);
        },

        getEndpoints: function () {
            return _endpoints;
        },
        
        /**
         * var result = {
         *     subjectURI: {
         *         facets: [{uri: facetURI, label: facetLabel, count: 5}, ...], 
         *         endpoints: []
         *     }, 
         *     subjectURI2: ...
         * }
         *
         *
         */
        query: function (searchString, resultCallback, errorCallback) {
            // TODO: get query result
            // var result = _query();

            mainquery = "SELECT DISTINCT ?s ?search\
                                 WHERE {\
                                  ?s ?p ?o.\
                                  FILTER regex(?o, \"" + searchString + "\", \"i\" ).\
                                  FILTER isLiteral(?o).\
                                  ?s <http://www.w3.org/2000/01/rdf-schema#label> ?search. } LIMIT 10";

            window.console.info(mainQuery);

            $(endpoints).each( function (i) {
                //TODO headerabfrage
                $.ajax( {
                    type: "GET",
                    url: 'proxy.php',
                    data: "contentType=xml&endpoint="+endpoints[i]+"&query="+escape(mainquery),
                    success: function (data) {
                        //TODO success
                        alert('success');
                    },
                    error: function (err,txt,errt) {
                        alert("Error:" + err + " " + txt + " " + errt);
                    }
                });
            });

            if( jQuery.isFunction(resultCallback) ) {
                resultCallback();
            }

            if( jQuery.isFunction(errorCallback) ) {
                errorCallback();
            }
        }, 
        
        values: function (subjectURI, facetURI) {
            
        }
    };
    
})(jQuery);

/*
 Beispiel:
 
 funtion alidaResult() {
     
 }
 
 Alida.query('ttt', 'alidaResult')




*/