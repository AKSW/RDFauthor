/**
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * RDFauthor base object.
 * Serves as a namespace, widget registry and simplified façade.
 *
 * @namespace
 * @requires Statement
 */
RDFauthor = (function () {
    /** Namespace for update predicates */
    const UPDATE_NS = 'http://ns.aksw.org/update/';
    
    /** RDF namespace */
    const RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    
    /** RDFS namespace */
    const RDFS_NS = 'http://www.w3.org/2000/01/rdf-schema#';
    
    /** OWL namespace */
    const OWL_NS = 'http://www.w3.org/2002/07/owl#';
    
    /** Default generic hook name */
    const DEFAULT_HOOK = '__DEFAULT__';
    
    /** Default hook name for objects */
    const OBJECT_HOOK  = '__OBJECT__';
    
    /** Default hook name for literals */
    const LITERAL_HOOK = '__LITERAL__';
    
    /** Prefix for ad-hoc IDs */
    const ELEMENT_ID_PREFIX = 'el-';
    
    /** Databanks indexed by graph URI. */
    var _databanksByGraph = {};
    
    /** Original databanks as extracted by graph URI. */
    var _extractedByGraph = {};
    
    /** Default graph URI */
    var _defaultGraphURI = null;
    
    /** Default subject URI */
    var _defaultSubjectURI = null;
    
    /** General target for events */
    var _eventTarget = 'body';
    
    /** The number of errors that occured while parsing RDFa. */
    var _parserErrors = 0;
    
    /** Information about named graphs in the page (indexed by graph URI). */
    var _graphInfo = {};
    
    /** Initial ID */
    var _idSeed = Math.round(Math.random() * 1000);
    
    /** Info predicates */
    var _infoPredicates = {};
    
    /** Mapping of info shortcuts to predicate URIs. */
    var _infoShortcuts = {};
    
    /** Denotes whether the page has been parsed */
    var _pageParsed = false;
    
    /** Predicate info */
    var _predicateInfo = {};
    
    /** Loaded JavaScript URIs */
    var _loadedScripts = {};
    
    /** Loaded stylesheet URIs */
    var _loadedStylesheets = {};
    
    /** Statements index by element id */
    var _statementsByElemendID = {};
    
    /** Default options */
    var _options = {
        title: 'Title', 
        saveButtonTitle: 'saveButtonTitle', 
        cancelButtonTitle: 'cancelButtonTitle', 
        showButtons: true, 
        useAnimations: true, 
        autoParse: true
    };
    
    /** Hash registered widgets */
    var _registeredWidgets = {
        OBJECT_HOOK:  {},
        LITERAL_HOOK: {}, 
        DEFAULT_HOOK: {}, 
        'resource':   {}, 
        'property':   {}, 
        'range':      {}, 
        'datatype':   {}
    };
    
    /**
     * Adds a new RDFA triple
     * @private
     */
    function _addTriple(element, triple, graph) {
        if (undefined !== triple) {
            var statement;
            try {
                statement = new Statement(triple, {'graph': graph});
            } catch (e) {
                /* count illegal RDFa triples */
                _parserErrors++;
            }
            
            /* add statement if it is not ignored */
            if (undefined !== statement && !statement.isIgnored()) {
                if (statement.isUpdateVocab()) {
                    _handleUpdateStatement(statement);
                } else {
                    RDFauthor.addStatement(statement, element);
                }
            }
        }
    };
    
    /**
     * Checks whether object implementes interface if
     * @private
     */
    function _checkInterface(object, interf) {
        for (member in interf) {
            if (typeof member !== 'function') {
                continue;
            }
            
            if (!object[member] || (typeof object[member] !== 'function')) {
                return false;
            }
        }
        
        return true;
    };
    
    /**
     * Clones databank for each graph before calling 
     * for widgets to write their data.
     * @private
     */
    function _cloneDatabanks() {
        for (g in _graphInfo) {
            if (undefined !== _databanksByGraph[g] &&
                _databanksByGraph[g] instanceof jQuery.rdf.databank) {
                
                var databank  = _databanksByGraph[g];
                var extracted = jQuery.rdf.databank();
                
                databank.each.triples().each(function() {
                    if (this instanceof jQuery.rdf.triple) {
                        /* HACK: reverse HTML escaping in literals */
                        this.object.value = this.object.value.replace(/&lt;/, '<').replace(/&gt;/, '>');
                    }
                    extracted.add(this);
                });
                
                /* store original as extracted */
                _extractedByGraph[g] = extracted;
            } else {
                /* create new empty databank */
                _extractedByGraph[g] = jQuery.rdf.databank();
            }
            
            /* TODO: what about hidden/protected triples hack */
        }
    };
    
    /**
     * Adds an update vocabulary statement to the internal store
     * @private
     */
    function _handleUpdateStatement(statement) {
        var subject = statement.subjectURI();
        var key     = statement.predicateURI().substr(UPDATE_NS.length);
        
        /* empty graph is expanded w/ document's namespace */
        if ('' === subject) {
            subject = _pageGraph();
        }
        
        if (typeof _graphInfo[subject] == 'undefined') {
            _graphInfo[subject] = {};
        }
        
        _graphInfo[subject][key] = statement.objectValue();
    };
    
    /**
     * Instantiates and returns a widget object
     * @param {Function} constructor
     * @param {Statement} statement
     * @return {Widget}
     */
    function _instantiateWidget(constructor, statement) {
        if (typeof constructor === 'function') {
            return new constructor(statement);
        }
        
        return null;
    };
    
    /**
     * Loads a JavaScript file by including a <code>&lt;script&gt;</code> tag in the page header.
     * @private
     * @param {string} scriptURI
     * @param {function} function that will be called when the script finished loading (optional)
     */
    function _loadScript(scriptURI, callback) {
        if (undefined === _loadedScripts[scriptURI]) {
            var s  = document.createElement('script');
            s.type = 'text/javascript';
            s.src  = scriptURI;
            
            if (typeof callback == 'function') {
                s.onload = callback;
            }
            
            document.getElementsByTagName('head')[0].appendChild(s);
            _loadedScripts[scriptURI] = true;
        } else {
            // script was already loaded, so execute callback immediately
            if (typeof callback == 'function') {
                callback();
            }
        }
    };
    
    /**
     * Makes an element's triples (from children and self) editable
     * @private
     */
    function _makeElementEditable(element, statement) {
        /*
         * add hash id
         * store id => statement
         */
         var id = $(element).attr('id');
         if (undefined === id) {
             id = RDFauthor.nextID(ELEMENT_ID_PREFIX);
             $(element).attr('id', id);
         }
         
         _statementsByElemendID[id] = statement;
    };
    
    /**
     * Returns the name (URI) of the current document's graph.
     * @return {String}
     */
    function _pageGraph() {
        return document.location.href;
    };
    
    /**
     * Parses the current page for RDFa triples
     * @private
     */
    function _parse() {
        if (!_pageParsed) {
            RDFA.parse();
        }
    };
    
    /**
     * Updates all sources via SPARQL/Update
     * @private
     */
    function _updateSources() {
        /*
         * 1. calculate diffs
         * 2. serialize changes
         * 3. send updates
         */
         for (g in _graphInfo) {
             
         }
    };
    
    // RDFauthor setup code ///////////////////////////////////////////////////
    
    if (RDFAUTHOR_BASE.charAt(RDFAUTHOR_BASE.length - 1) !== '/') {
        RDFAUTHOR_BASE = RDFAUTHOR_BASE + '/';
    }
    // let RDFa parser load GRDDL files locally
    __RDFA_BASE = RDFAUTHOR_BASE + 'libraries/';
    
    // RDFA namespace and parser options
    RDFA = {
        NAMED_GRAPH_ATTRIBUTE: {ns: UPDATE_NS, attribute: 'from'}, 
        CALLBACK_NEW_TRIPLE_WITH_URI_OBJECT: _addTriple, 
        CALLBACK_NEW_TRIPLE_WITH_LITERAL_OBJECT: _addTriple, 
        CALLBACK_DONE_PARSING: function() {_pageParsed = true;}
    };
    
    // load required scripts
    _loadScript(__RDFA_BASE + 'rdfa.js');                       /* RDFA */
    _loadScript(RDFAUTHOR_BASE + 'src/rdfauthor.statement.js'); /* Statement */
    _loadScript(RDFAUTHOR_BASE + 'src/rdfauthor.widget.js');    /* Widget */
    
    // return uninstantiable singleton
    /** @lends RDFauthor */
    return {
        /**
         * Adds a statement to the number of editable statements.
         * @param {string} graphURI
         * @param {Statement} statement
         * @param {HTMLElement} element
         */
        addStatement: function (statement, element) {
            var graphURI = statement.graphURI() || this.defaultGraphURI();
            var databank = this.databankForGraph(graphURI);
            /* TODO: error counting */
            databank.add(statement.asRdfQueryTriple());
            _makeElementEditable(element, statement);
        }, 
        
        /**
         * Cancels the editing process.
         */
        cancel: function () {
            /*
             * - inform/dismiss view
             * - restore state (parsed or unparsed?)
             */
             this.eventTarget().trigger('rdfauthor.cancel');
        }, 
        
        /**
         * Commits changes from an ongoing editing process.
         * All pending changes will be sent to sources.
         * @todo inform on error
         */
        commit: function () {
            _cloneDatabanks();
            this.eventTarget().trigger('rdfauthor.commit');
            _updateSources();
        },
        
        /**
         * Creates a new widget base object ensuring it uses the abstract 
         * Widget as its prototype object.
         * @return {Object}
         */
        createWidget: function() {
            var F = function () {
                this.ID = RDFauthor.nextID();
                Widget.construct.apply(this, arguments);
            };
            F.prototype = Widget;
            return F;
        }, 
        
        /**
         * Returns the jQuery.rdf.databank that stores statements for graph denoted by <code>graphURI</code>.
         * @param {string} graphURI
         * @return {jQuery.rdf.databank}
         */
        databankForGraph: function (graphURI) {
            if (undefined === _databanksByGraph[graphURI]) {
                _databanksByGraph[graphURI] = jQuery.rdf.databank();
            }
            
            return _databanksByGraph[graphURI];
        },
        
        /**
         * Returns the default graph URI.
         * The default graph is the graph, to which newly created statements 
         * are added. That is, statements that also add a new property.
         * @return {string}
         */
        defaultGraphURI: function () {
            /* TODO: if there is only one graph, this should be the default graph */
             if (null === _defaultGraphURI) {
                 if (typeof RDFAUTHOR_DEFAULT_GRAPH === 'string') {
                     /* 1. RDFAUTHOR_DEFAULT_GRAPH JavaScript variable */
                     _defaultGraphURI = RDFAUTHOR_DEFAULT_GRAPH;
                 } else if (undefined !== _options.defaultGraph) {
                     /* 2. options.defaultGraph */
                     _defaultGraphURI = _options.defaultGraph;
                 } else if (undefined !== _graphInfo[_pageGraph()] && undefined !== _graphInfo[_pageGraph()]['defaultGraph']) {
                     /* 3. link w/ rel="update:defaultGraph" */
                     _defaultGraphURI = _graphInfo[_pageGraph()]['defaultGraph'];
                 } else {
                     /* 4. document.location.href (i.e. page graph) */
                     _defaultGraphURI = _pageGraph();
                 }
             }
             
             return _defaultGraphURI;
        }, 
        
        /**
         * Returns the default subject's URI.
         * @return {string}
         */
        defaultSubjectURI: function () {
            /* TODO: if there is only one resource, this should be the default resource */
             if (null === _defaultSubjectURI) {
                 if (typeof RDFAUTHOR_DEFAULT_SUBJECT === 'string') {
                     /* 1. RDFAUTHOR_DEFAULT_SUBJECT JavaScript variable */
                     _defaultSubjectURI = RDFAUTHOR_DEFAULT_SUBJECT;
                 } else if (undefined !== _options.defaultSubject) {
                     /* 2. options.defaultSubject */
                     _defaultSubjectURI = _options.defaultSubject;
                 } else if (undefined !== _graphInfo[_pageGraph()] && undefined !== _graphInfo[_pageGraph()]['defaultSubject']) {
                     /* 3. link w/ rel="update:defaultSubject" */
                     _defaultSubjectURI = _graphInfo[_pageGraph()]['defaultSubject'];
                 }
             }
             
             return _defaultSubjectURI;
        },
        
        /**
         * Returns the DOM element to which events are bound
         * @return {jQuery}
         */
        eventTarget: function () {
            return jQuery(_eventTarget);
        },
        
        /**
         * Returns an instance of the widget that has been registered for <code>hookName</code> and <code>hookValue</code>.
         * @param {string} hookName
         * @param {mixed} hookValue
         * @param {Statement} statement The statement with which to initialize the widget
         * @return {Widget} An object conforming to the Widget interface
         */
        getWidgetForHook: function (hookName, hookValue, statement) {
            if (!hookValue) {
                hookValue = '';
            }
            var widgetConstructor = _registeredWidgets[hookName][hookValue];
            
            /* initialize widget */
            return _instantiateWidget(widgetConstructor, statement);
        }, 
        
        /**
         * Returns an instance of the widget most suitable for editing statement.
         * @param {Statement} statement
         */
        getWidgetForStatement: function (statement) {
            
        },
        
        /**
         * Returns an info predicate value for the predicate given by predicateURI.
         * @param {string} predicateURI
         * @param {string} infoSpec
         * @return {Array}
         */
        infoForPredicate: function (predicateURI, infoSpec) {
            if (undefined !== _infoShortcuts[infoSpec]) {
                infoSpec = _infoShortcuts[infoSpec];
            }
            
            return _predicateInfo[predicateURI][infoSpec];
        },
        
        /**
         * Returns the datatypes to be supported by typed-literal widgets.
         * @return {array}
         */
        literalDatatypes: function () {
            var types = [];
            for (var t in jQuery.typedValue.types) {
                types.push(t);
            }
            
            /* let others modify datatypes */
            this.eventTarget().trigger('rdfauthor.datatypes', types);

            return types;
        }, 
        
        /**
         * Returns the language tags to be supported by plain-literal widgets.
         * @return {array}
         */
        literalLanguages: function () {
            var langs = ['de', 'en', 'fr', 'nl', 'es', 'it', 'cn'];
            
            /* let others modify languages */
            this.eventTarget().trigger('rdfauthor.languages', langs);
            
            return langs;
        },
        
        /**
         * Loads a JavaScript file from URI <code>scriptURI</code>.
         * If callback is supplied, it will be called after the script has been loaded.
         * @param {string} scriptURI
         * @param {function} function that will be called when the script finished loading (optional)
         */
        loadScript: function (scriptURI, callback) {
            _loadScript(scriptURI, callback);
        }, 
        
        /**
         * Loads a bunch of JavaScript files at once. If callback is supplied, it will
         * be called after the last script has been loaded.
         * @param {Array} scriptURIs
         * @param {function} callback
         */
        loadScripts: function (scriptURIs, callback) {
            for (var i = 0, max = scriptURIs.length; i < max; i++) {
                var scriptURI = scriptURIs[i];
                var cbParam   = (i === (max - 1)) ? callback : undefined;
                this.loadScript(scriptURI, cbParam);
            }
        }, 
        
        /**
         * Loads a Stylesheet file by including a <code>&lt;script&gt;</code> tag in the page header.
         * @param {string} stylesheetURI
         */
        loadStylesheet: function (stylesheetURI) {
            var stylesheetLoaded = false;
            var links = document.getElementsByTagName('link');
            
            for (var i = 0, max = links.length; i < max; i++) {
                var uri = links[i].getAttribute('href');
                if ((uri && uri == stylesheetURI)) {
                    stylesheetLoaded = true;
                    break;
                }
            }
            
            if (!stylesheetLoaded) {
                var l   = document.createElement('link');
                l.rel   = 'stylesheet';
                l.type  = 'text/css';
                l.media = 'screen';
                l.href  = stylesheetURI;
                
                document.getElementsByTagName('head')[0].appendChild(l);
            }
        },
        
        /**
         * With every call, returns a unique ID that can be used to build id attributes
         * for CSS selector access.
         * @param prefix string
         * @return string
         */
        nextID: function (prefix) {
            return (prefix ? String(prefix) : '') + _idSeed++;
        },
        
        /**
         * Sends a SPARQL query to the endpoint for graph denoted by graphURI.
         * @param {string} graphURI The graph to be queried
         * @param {string} query the SPARQL query
         * @param {function} callbackSuccess Function to be called when the query 
         * was executed sucessfully (implies asynchronous = true). 
         * The function should accept one parameter which is a 
         * <a href="http://www.w3.org/TR/rdf-sparql-json-res/">SPARQL Results JSON</a> object.
         * @param {function} callbackError Function to be called if an error occurs.
         * @param {boolean} asynchronous If false, the query result will be returned. Otherwise, 
         * callbackSuccess must be supplied.
         * @throws An exception if the graph queried has no associated SPARQL endpoint.
         */
        queryGraph: function (graphURI, query, callbackSuccess, callbackError, asynchronous) {
            var seviceURI = this.serviceURIForGraph(graphURI);
            if (undefined === serviceURI) {
                throw 'Graph has no SPARQL endpoint defined.';
            }
            
            /* Request parameters */
            var parameters = {
                query: query, 
                'default-graph-uri': graphURI
            }
            
            /* Default ajax options (JSON) */
            var ajaxOptions = {
                timeout: 2000, 
                dataType: 'json', 
                url: serviceURI, 
                data: parameters, 
                async: asynchronous, 
                /* request application/sparql-results+json */
                beforeSend: function (XMLHTTPRequest) {XMLHTTPRequest.setRequestHeader('Accept', 'application/sparql-results+json');}
            };
            
            /* Success callback */
            if (typeof callbackSuccess == 'function') {
                ajaxOptions.success = function (data, status) {callbackSuccess(data);}
            }
            
            /* Error callback */
            if (typeof callbackError == 'function') {
                ajaxOptions.error = function (request, status, error) {callbackError(status, error);}
            }
            
            var uriLocation     = new Location(serviceURI);
            var currentLocation = window.location;
            
            /* 
             * Check whether JSONp is necessary 
             * http://en.wikipedia.org/wiki/Same_origin_policy#Origin_determination_rules
             */
            if (!(currentLocation.protocol === uriLocation.protocol && 
                  currentLocation.hostname === uriLocation.hostname &&
                  currentLocation.port     === uriLocation.port)) {
                
                /* not same origin, use JSONp and modify ajax options accordingly */
                var JSONpOptions = {
                    dataType: 'jsonp', 
                    callbackParameter: 'callback'
                }
                jQuery.extend(ajaxOptions, JSONpOptions);
            }
        },
        
        /**
         * Registers a predicate to automatically be queried for all predicates.
         * Widgets will be provided with values of these predicates on request.
         * @param {string} infoPredicateURI The URI of the info predicate.
         * @param {string} infoSpec Short name for the info predicate (optional).
         * @throws An exception if shortcut has already been registered .
         */
        registerInfoPredicate: function (infoPredicateURI, shortcut) {
            if (undefined === _infoPredicates[infoPredicateURI]) {
                _infoPredicates[infoPredicateURI] = true;
            }
            
            if (arguments.length > 1) {
                if (undefined !== _infoShortcuts[shortcut]) {
                    throw 'Shortcut has already been registered.';
                }
                
                _infoShortcuts[shortcut] = infoPredicateURI;
            }
        },
        
        /**
         * Registers a new widget type.
         * @param {object} widgetSpec An object with the following keys:
         *  <ul>
         *  <li><code>constructorFunction</code> A reference to or the name of the constructor function 
         *                            for instances of that widget</li>
         *  <li><code>hookName</code> One of <code>resource</code>, <code>property</code>, <code>range</code>, 
         *                            <code>datatype</code></li>
         *  <li><code>hookValues</code> An array of possible values for hookName that trigger the widget</li>
         *  </ul>
         */
        registerWidget: function (widgetSpec) {
            // Check interface conformance
            if (!_checkInterface(widgetSpec, Widget)) {
                throw "Registered object does not conform to 'Widget' interface.";
            }
            
            if (_registeredWidgets[widgetSpec.hookName]) {
                // Register for all hook values
                for (var i = 0; i < widgetSpec.hookValues.length; i++) {
                    var value = widgetSpec.hookValues[i];
                    if (!_registeredWidgets[widgetSpec.hookName][value]) {
                        _registeredWidgets[widgetSpec.hookName][value] = widgetSpec.constructorFunction;
                    }
                }
            }
        },
        
        /**
         * Resets private variables (mainly used for testing).
         */
        reset: function () {
            _databanksByGraph  = {};
            _defaultGraphURI   = null;
            _defaultSubjectURI = null;
            _loadedScripts     = {};
            _loadedStylesheets = {};
            _options = {
                title: 'Title', 
                saveButtonTitle: 'saveButtonTitle', 
                cancelButtonTitle: 'cancelButtonTitle', 
                showButtons: true, 
                useAnimations: true, 
                autoParse: true
            }
        }, 
        
        /**
         * Returns the SPARQL query service URI for graph denoted by graphURI.
         * @param {string} graphURI
         * @return {string}
         */
        serviceURIForGraph: function (graphURI) {
            return _graphInfo[graphURI].queryEndpoint;
        }, 
        
        /**
         * Sets RDFauthor options
         * @param {object} optionSpec
         */
        setOptions: function(optionSpec) {
            _options = $.extend(_options, optionSpec);
        }, 
        
        /**
         * Starts editing the current page. If root defines a valid DOM element, only
         * those triples that where extracted from root or its children are beeing edited.
         * @param {HTMLElement} root
         */
        start: function (root) {
            this.eventTarget().trigger('rdfauthor.start');
            if (_options.autoParse) {
                _parse();
            }
        }
    }
})();
