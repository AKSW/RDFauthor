Alida = (function ($) {

    /** Default options */
    var _defaultOptions = {
        timeout: 10000,
        limit: 5
    };

    /** Endpoints array */
    var _endpoints = new Array();

    /**
     * Creates the query string
     * @private
     * @param {String} searchString Users search string
     * @return {String} mainquery
     */
    function _createQuery (searchString) {
        var mainquery = "SELECT DISTINCT ?s ?search\
                         WHERE {\
                             ?s ?p ?o.\
                             FILTER regex(?o, \"" + searchString + "\", \"i\" ).\
                             FILTER isLiteral(?o).\
                             ?s <http://www.w3.org/2000/01/rdf-schema#label> ?search.\
                         } LIMIT " + _defaultOptions.limit;
        //Output mainquery
        window.console.info(mainquery);
        return mainquery;
    }

    /**
     * Parses the first ajax request including subject and object.
     * @private
     * @param {XML} data XML document contains the first result
     */
    function _parseFirstRequestData (data) {
        $(data).find('result').each(function()
        {
            $(this).find("binding").each(function()
            {
                if(this.attributes[0].value=="s")
                {
                    subject = $(this).text().trim();
                    //TODO add subject to array
                }
                if(this.attributes[0].value=="search")
                {
                    object = $(this).text().trim();
                    //TODO add object to array
                }
            });
        });
    }
    
    return {
        /**
         * Modify the defaultoptions.
         * @param {Array} options Modified default options
         */
        setOptions: function (options) {
            _defaultOptions = $.extend(_defaultOptions, options);
        }, 

        /**
         * Adds an new endpoint.
         * @param {String} endpointURI EndpointURI
         */
        addEndpoint: function (endpointURI) {
            _endpoints.push(endpointURI);
        },

        /**
         * Returns all specified endpoints.
         * @return {Array} _endpoints Specified endpoints
         */
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

        /**
         * Inits a query.
         * @param {String] searchString Search string
         * @param {function} resultCallback Resultcallback will be called, when all results are available
         * @param {function} errorCallback Errorcallback will be called, when an error occurred
         */
        query: function (searchString, resultCallback, errorCallback) {
            $(_endpoints).each( function (i) {
                //TODO headerabfrage

                //do an ajax request
                $.ajax({
                    type: "GET",

                    timeout: _defaultOptions.timeout,

                    url: '../libraries/alidaProxy.php',

                    data: "contentType=xml&endpoint="+_endpoints[i]+"&query="+escape(_createQuery(searchString)),

                    success: function (data, textStatus, XMLHttpRequest) {
                        //Success output
                        alert('success\n'+data + textStatus, XMLHttpRequest);

                        //Parsing the data
                        _parseFirstRequestData(data);

                        //Resultcallback
                        if( jQuery.isFunction(resultCallback) ) {
                            resultCallback();
                        }
                    },

                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        //Error output
                        alert('Error:' + XMLHttpRequest + ' ' + textStatus + ' ' + errorThrown);

                        //Errorcallback
                        if( jQuery.isFunction(errorCallback) ) {
                            errorCallback();
                        }
                    }

                }); // End of ajax request part

            }); // End of _endpoints array

        }, 

        /**
         * Gets the value for special subjectURI and facetURI.
         */
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