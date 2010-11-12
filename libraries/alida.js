/**
 * This file is part of the aLiDa project.
 * http://code.google.com/p/alida/
 * Author: Clemens Hoffmann <cannelony@gmail.com>
 */

Alida = (function ($) {

    /** Default options */
    var _defaultOptions = {
        timeout: 10000,
        limit: 5
    };

    /** Endpoints array */
    var _endpoints = new Array();

    /** MIME Type for XML */
    var XML = 'application/sparql-results+xml';

    /** MIME Type for JSON */
    var JSON = 'application/sparql-results+json';

    /** result object */
    var result = {
        subjectURI : SubjectClass
    }

    /**
     * Instantiates an subjectClass object, which contains the label,
     * all of them properties (facets, including values),
     * and the source of the subject (endpoint).
     * @constructor
     * @param {String} label label of subject
     * @param {Array} facets properties of subject
     * @param {Array} endpoints source of subject
     */
    function SubjectClass (label, facets, endpoints) {
        this.label = label;
        this.facets = facets;
        this.endpoints = endpoints;
        return this;
    }

    SubjectClass.prototype.addFacet = function (uri, label) {
        var newFacet = {
            facetURI : uri,
            label    : label
        }
        this.facets.push(newFacet);
    }

    /**
     * Receives all facets and their values of a subject
     * @private
     * @param {String} subjectURI path to subject
     */
    function _getFacetsOfSubject (subjectURI) {
        var queryFacet = "SELECT DISTINCT ?facet ?value WHERE { <" + subjectURI + "> ?facet  ?value}";
        window.console.info(queryFacet);
        $(_endpoints).each( function (i) {
            $.ajax({
                beforeSend: function (req) {
                    req.setRequestHeader("Accept", JSON + "," + XML + ";q=0.2");
                },
                type: "GET",
                timeout: _defaultOptions.timeout,
                url: _endpoints[i],
                data: "query="+escape(queryFacet),
                success: function (data, textStatus, XMLHttpRequest) {
                    //Success output
                    //alert('success\n'+data + textStatus, XMLHttpRequest);
                    switch (XMLHttpRequest.getResponseHeader("Content-Type")){
                        case XML:
                            alert('XML - getFacet');
                            //TODO parse facets and values
                            break;
                        case JSON:
                            alert('JSON - getFacet');
                            alert(XMLHttpRequest.responseText);
                            //TODO parse facets and values
                            break;
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //Error output
                    alert('Error:' + XMLHttpRequest + ' ' + textStatus + ' ' + errorThrown);
                }
            }); // End of ajax request part
        });
    }

    function _createResultObject () {

    }

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
     * Parses the XML object from the first ajax request including subject and object.
     * @private
     * @param {XML} data XML document contains the first result
     */
    function _parseFirstRequestXML (data) {
        $(data).find('result').each(function () {
            $(this).find("binding").each(function () {
                if (this.attributes[0].value=="s") {
                    subject = $(this).text().trim();
                    //TODO add subject to array
                }
                if (this.attributes[0].value=="search") {
                    object = $(this).text().trim();
                    //TODO add object to array
                }
            });
        });
    }

    /**
     * Parses the JSON object from the first ajax request including subject and object.
     * @private
     * @param {String} data JSON String contains the first result
     */
    function _parseFirstRequestJSON (data) {
        var result = $.parseJSON(data);
        $(result.bindings).each(function (i) {
            alert(result.bindings[i].s.value+' - '+result.bindings[i].search.value);
            _getFacetsOfSubject (result.bindings[i].s.value);
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
                    beforeSend: function (req) {
                        req.setRequestHeader("Accept", JSON + "," + XML + ";q=0.2");
                    },

                    type: "GET",

                    timeout: _defaultOptions.timeout,

                    url: _endpoints[i],

                    data: "query="+escape(_createQuery(searchString)),

                    success: function (data, textStatus, XMLHttpRequest) {
                        //Success output
                        //alert('success\n'+data + textStatus, XMLHttpRequest);
                        switch (XMLHttpRequest.getResponseHeader("Content-Type")){
                            case XML:
                                //alert('XML');
                                //Parsing the XML object
                                _parseFirstRequestXML(XMLHttpRequest.responseXML);
                                break;
                            case JSON:
                                //alert('JSON');
                                //Parsing the JSON object
                                _parseFirstRequestJSON(XMLHttpRequest.responseText);
                                break;
                        }
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