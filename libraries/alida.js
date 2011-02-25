/**
 * @fileoverview This file is part of the aLiDa project.
 * http://code.google.com/p/alida/
 * @author Clemens Hoffmann <cannelony@gmail.com>
 * @version 0.1
 * @required jQuery 1.4 or higher
 */

Alida = (function ($) {

    /** Default options */
    var _defaultOptions = {
        timeout: 20000,
        limit: 5
    };

    /** MIME Type for XML */
    var XML = 'application/sparql-results+xml';

    /** MIME Type for JSON */
    var JSON = 'application/sparql-results+json';
    /** bind ajax request to queryResult and query Facets*/
    var _queryResult = $.ajax({}), _queryFacets = $.ajax({});

    /**
     * Instantiates one facet object, which contains to
     * one specific subject.
     * @constructor
     * @param {String} uri Uri of facet
     * @param {String} type Type could be for instance uri, literal
     * @param {String} label Label is a human readable format of the facet
     */
    function Facet (uri, type, label) {
        this.URI = uri;
        this.type = type;
        this.label = label;
        this.values = [];
        return this;
    }
    
    /**
     * ToString for facets
     * @return A facet uri
     */
    Facet.prototype.toString = function () {
        return this.URI;
    }
    
    /**
     * Instantiates an subject object, which contains the label,
     * all of them properties (facets, including values),
     * and the source of the subject (endpoint).
     * @constructor
     * @param {String} subjectURI The subject uri
     * @param {String} label The subject label
     * @param {Array} endpoints source of subject
     */
    function Subject (subjectURI, label, endpoints) {
        this.URI = subjectURI;
        this.label = label;
        this.facets = {};
        this.endpoints = endpoints;
        return this;
    }

    /**
     * Add an instance of a facet to a subject
     * @param {String} uri Facet uri
     * @param {String} type Type of facet
     */
    Subject.prototype.addFacet = function (uri, type) {
        var label = this.URI.trimURI();
        this.facets[uri] = new Facet(uri, type, label);
    }

    /**
     * This function return the number of facets of a subject
     * @return Number of facets concerning the subject
     */
    Subject.prototype.sizeOfFacets = function () {
        var len = 0;
        for (var f in this.facets) {
            if (this.facets.hasOwnProperty(f)) len++;
        }
        return len;
    }


    /**
     * Request the values of a specify subject class
     * @param {Object} facet Could be a facet object
     * @param {String} facet Could be a facet uri
     * @param {function} callback This callback will be run, if the request is done.
     */
    Subject.prototype.getValues = function (facet, callback) {
        var addValueToFacet = this.facets[String(facet)].values;
        var subjectURI = this.URI;
        var facetURI = String(facet);
        var valueQuery = "SELECT DISTINCT ?value WHERE { <" 
                       + this.URI
                       + "> <"
                       + String(facet)
                       + "> ?value}";
        //window.console.info(valueQuery);
        $.ajax({
            beforeSend: function (req) {
                req.setRequestHeader("Accept", JSON + "," + XML + ";q=0.2");
            },
            type: "GET",
            timeout: _defaultOptions.timeout,
            url: this.endpoints,
            data: "query="+escape(valueQuery),
            success: function (data, textStatus, XMLHttpRequest) {
                var value = null;
                var type = null;
                var label = null;
                fvalues = [];
                //Success output
                //alert('success\n'+data + textStatus, XMLHttpRequest);
                switch (XMLHttpRequest.getResponseHeader("Content-Type")){
                    case XML:
                        //alert('XML - getFacet');
                        //TODO parse facets and values and adds it to the right subject
                        break;
                    case JSON:
                        //alert('JSON - getFacet');
                        //alert(XMLHttpRequest.responseText);
                        var JSONvalue = $.parseJSON(XMLHttpRequest.responseText);
                        $(JSONvalue.results.bindings).each(function(i) {
                            value = JSONvalue.results.bindings[i].value.value;
                            type = JSONvalue.results.bindings[i].value.type;
                            label = value.trimURI();
                            var fvalue = {
                                type: type,
                                value: value,
                                label: label
                            };
                            fvalues.push(fvalue);
                            addValueToFacet.push({
                                type: type,
                                value: value,
                                label: label
                            });
                        });
                        break;
                    default:
                       alert('Should not happen: ' + XMLHttpRequest.getResponseHeader("Content-Type"));
                }
                if (jQuery.isFunction(callback)) {
                    callback(fvalues,type, value, label, subjectURI, facetURI);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //Error output
                alert('Error:' + XMLHttpRequest + ' ' + textStatus + ' ' + errorThrown);
            }
        });
    }

    /**
     * Trim the uri to a human readable format
     * @return Human readable label for an uri
     */
    String.prototype.trimURI = function () {
        // Splitting the label part from the uri
        if ( (sharpIndex = this.lastIndexOf("#")) != -1 ) {
            label = this.slice(sharpIndex+1,this.length);
        } else {
            slashIndex = this.lastIndexOf("/");
            label = this.slice(slashIndex+1,this.length);
        }
        //looking for concatenated words and seperate them by whitespace
        while ( (pos = label.search(/[a-z][A-Z]/)) != -1 ) {
            label = label.substr(0,pos+1) + " "  + label.substr(pos+1,label.length);
        }
        label = label.replace(/_/," / ");
        // doesn't work yet
        label[0] = label[0].toUpperCase();
        return label;
    }

    /**
     * Creates the query string
     * @private
     * @param {String} searchString Users search string
     * @param {Array} optQuery Additional querystring if filtering
     * @return A specify query
     */
    function _createQuery (searchString, optQuery) {
        var mainquery = "SELECT DISTINCT ?s ?search "
                      + "WHERE { "
                      +      "?s ?p ?o. "
                      +      "FILTER regex(?o, \"" + searchString + "\", \"i\" ). "
                      +      "FILTER isLiteral(?o). "
                      +      "?s <http://www.w3.org/2000/01/rdf-schema#label> ?search. ";
        $(optQuery).each(function(i){
            mainquery += optQuery[i];
        });
        mainquery += "} LIMIT " + _defaultOptions.limit;
        //Output mainquery
        window.console.info(mainquery);
        return mainquery;
    }

    /**
     * Parses the XML object from the first ajax request including subject and object.
     * @private
     * @param {XML} data XML document contains the first result
     * @param {String} endpoint endpoint url
     * @param {Object} result The result object of one query
     */
    function _parseFirstRequestXML (data, endpoint, result) {
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
     * @param {String} endpoint endpoint url
     * @param {Object} result The result object of one query
     */
    function _parseFirstRequestJSON (data, endpoint, result) {
        var JSONresult = $.parseJSON(data);
        $(JSONresult.results.bindings).each(function (i) {
            // alert(JSONresult.results.bindings[i].s.value + JSONresult.results.bindings[i].search.value);
            result.subjects[JSONresult.results.bindings[i].s.value] =
                new Subject (JSONresult.results.bindings[i].s.value,
                             JSONresult.results.bindings[i].search.value,
                             endpoint);
        });

    }
    
    return {
        /**
         * Abort all ajax requests of alida.
         */
        abortRequests: function () {
            _queryResult.abort();
            _queryFacets.abort();
        },

        /**
         * Modify the defaultoptions.
         * @param {Array} options Modified default options
         */
        setOptions: function (options) {
            _defaultOptions = $.extend(_defaultOptions, options);
        }, 
        
        /**
         * Inits a query.
         * @param {String} searchString Search string
         * @param {Array} optQuery, can be used to modify the sparql query (e.g. filter)
         * @param {function} onstartCallback This callback will be called, before the first request will send
         * @param {function} resultCallback This callback will be called, when all results are available
         * @param {function} onStopCallback This callback will be called, when the result is received
         * @param {function} errorCallback This callback will be called, when an error occurred
         */
        query: function (searchString, optQuery, endpoints, onStartCallback, resultCallback, onStopCallback, errorCallback) {
            if( jQuery.isFunction(onStartCallback) ) {
                onStartCallback();
            }
            //each query get a new result object
            $(endpoints).each( function (i) {
                /** result object */
                var _result = {
                    //query : String,
                    subjects: {/*subjectURI : Subject*/},
                    endpoints: [],
                    facets: function (resultCallback) {
                        var length = this.sizeOfSubjects();
                        var curLen = 0;
                        var tempSubject = [];
                        var thisResult = this;
                        for (var subjectURI in this.subjects) {
                            var loopSubject = this.subjects[subjectURI];
                            tempSubject.push(this.subjects[subjectURI].URI);
                            if (loopSubject instanceof Subject) {
                                var queryFacet = "SELECT DISTINCT ?facet WHERE { <"
                                               + loopSubject.URI
                                               + "> ?facet  ?value}";
                                window.console.info(queryFacet);
                                $(thisResult.endpoints).each( function (i) {
                                    _queryFacets = $.ajax({
                                        beforeSend: function (req) {
                                            req.setRequestHeader("Accept", JSON + "," + XML + ";q=0.2");
                                        },
                                        type: "GET",
                                        timeout: _defaultOptions.timeout,
                                        url: thisResult.endpoints[i],
                                        data: "query="+escape(queryFacet),
                                        success: function (data, textStatus, XMLHttpRequest) {
                                            //Success output
                                            //alert('success\n'+data + textStatus, XMLHttpRequest);
                                            switch (XMLHttpRequest.getResponseHeader("Content-Type")){
                                                case XML:
                                                    //alert('XML - getFacet');
                                                    //TODO parse facets and values and adds it to the right subject
                                                    break;
                                                case JSON:
                                                    //alert('JSON - getFacet');
                                                    //alert(XMLHttpRequest.responseText);
                                                    var JSONfacets = $.parseJSON(XMLHttpRequest.responseText);
                                                    $(JSONfacets.results.bindings).each(function(i) {
                                                        var facetUri = JSONfacets.results.bindings[i].facet.value;
                                                        var type = JSONfacets.results.bindings[i].facet.type;
                                                        thisResult.subjects[tempSubject[curLen]].addFacet(facetUri,type);
                                                    });
                                                    break;
                                            }
                                        },
                                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                                            //Error output
                                            alert('Error:' + XMLHttpRequest + ' ' + textStatus + ' ' + errorThrown);
                                        },
                                        complete: function (XMLHttpRequest, textStatus) {
                                            switch (textStatus) {
                                                case "success":
                                                    curLen++;
                                                    if (length == curLen) {
                                                        if (jQuery.isFunction(resultCallback)) {
                                                            resultCallback();
                                                        }
                                                        if (jQuery.isFunction(onStopCallback)) {
                                                            onStopCallback();
                                                        }
                                                    }
                                                    break;
                                                default:
                                                    window.console.info('Error while getting facets');
                                            }
                                        }
                                    }); // End of ajax request part
                                });
                            }
                        }
                    },
                    optQuery: [],
                    sizeOfSubjects: function () {
                        var len = 0;
                        for (var subject in this.subjects) {
                            if (this.subjects.hasOwnProperty(subject)) len++;
                        }
                        return len;
                    },
                    filter: function (facet, value) {
                        // new query and return new result object
                        return this;
                    }
                };

                _result.endpoints.push(endpoints[i]);

                //TODO headerabfrage
                //do an ajax request
                _queryResult = $.ajax({
                    beforeSend: function (req) {
                        req.setRequestHeader("Accept", JSON + "," + XML + ";q=0.2");
                    },

                    type: "GET",

                    timeout: _defaultOptions.timeout,

                    url: endpoints[i],

                    data: "query="+escape(_createQuery(searchString, optQuery)),

                    success: function (data, textStatus, XMLHttpRequest) {
                        
                        //Success output
                        //alert('success\n'+data + textStatus, XMLHttpRequest);
                        //_result['query'] = _createQuery(searchString);
                        _result['query'] = _createQuery(searchString, optQuery);
                        switch (XMLHttpRequest.getResponseHeader("Content-Type")){
                            case XML:
                                //alert('XML');
                                //Parsing the XML object
                                _parseFirstRequestXML(XMLHttpRequest.responseXML,_result);
                                break;
                            case JSON:
                                //alert('JSON');
                                //Parsing the JSON object
                                _parseFirstRequestJSON(XMLHttpRequest.responseText, endpoints[i],_result);
                                break;
                        }
                        //Resultcallback
                        if( jQuery.isFunction(resultCallback) ) {
                            resultCallback(_result);
                        }
                        if (jQuery.isFunction(onStopCallback) && _result.sizeOfSubjects() == 0) {
                            onStopCallback();
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