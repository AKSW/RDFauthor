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
    /** Databanks indexed by graph URI. */
    var _databanksByGraph = {};
    
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
    
    var _pageParsed = false;
    
    /** Predicate info */
    var _predicateInfo = {};
    
    /** Loaded JavaScript URIs */
    var _loadedScripts = {};
    
    /** Loaded stylesheet URIs */
    var _loadedStylesheets = {};
    
    /** Default options */
    var _options = {
        title: 'Title', 
        saveButtonTitle: 'saveButtonTitle', 
        cancelButtonTitle: 'cancelButtonTitle', 
        showButtons: true, 
        useAnimations: true, 
        autoParse: true
    };
    
    /**
     * Adds a new RDFA triple
     * @private
     */
    function _addTriple(element, triple, graph) {
        if (triple !== undefined) {
            var statement = new Statement(triple);
            if (!statement.isIgnored()) {
                if (statement.isUpdateVocab()) {
                    // handle update info
                } else {
                    RDFauthor.addStatement(graph, statement, element);
                }
            }
        }
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
        }
    };
    
    /**
     * Makes an element's triples editable
     * @private
     */
    function _makeElementEditable() {
        
    };
    
    /**
     * Parses the current page for RDFa triples
     * @private
     */
    function _parse() {
        if (_options.autoParse && !_pageParsed) {
            RDFA.parse();
        }
    };
    
    // RDFauthor setup code
    if (RDFAUTHOR_BASE.charAt(RDFAUTHOR_BASE.length - 1) !== '/') {
        RDFAUTHOR_BASE = RDFAUTHOR_BASE + '/';
    }
    // let RDFa parser load GRDDL files locally
    __RDFA_BASE = RDFAUTHOR_BASE + 'libraries/';
    
    // RDFA namespace and parser options
    RDFA = {
        NAMED_GRAPH_ATTRIBUTE: {ns: 'http://ns.aksw.org/update/', attribute: 'from'}, 
        CALLBACK_NEW_TRIPLE_WITH_URI_OBJECT: _addTriple, 
        CALLBACK_NEW_TRIPLE_WITH_LITERAL_OBJECT: _addTriple, 
        CALLBACK_DONE_PARSING: function() {_pageParsed = true;}
    };
    
    // load required scripts
    _loadScript(__RDFA_BASE + 'rdfa.js');
    _loadScript(RDFAUTHOR_BASE + 'src/rdfauthor.statement.js');
    
    /**
     * Updates all sources via SPARQL/Update
     * @private
     */
    function _updateSource() {
        
    };
    
    // return uninstantiable singleton
    /** @lends RDFauthor */
    return {
        /**
         * Adds a statement to the number of editable statements.
         * @param {string} graphURI
         * @param {Statement} statement
         * @param {HTMLElement} element
         */
        addStatement: function (graphURI, statement, element) {            
            var databank = this.databankForGraph(graphURI);
            databank.add(statement.asRdfQueryTriple());
        }, 
        
        /**
         * Cancels the editing process.
         */
        cancel: function () {
            
        }, 
        
        /**
         * Commits an ongoing editing process.
         * All pending changes will be sent to sources.
         */
        commit: function () {
            
        }, 
        
        /**
         * Returns the default graph URI.
         * @return {string}
         */
        defaultGraphURI: function () {
            
        }, 
        
        /**
         * Returns the default subject's URI.
         * @return {string}
         */
        defaultSubjectURI: function () {
            
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
         * Returns the datatypes to be supported by typed-literal widgets.
         * @return {array}
         */
        literalDatatypes: function () {
            var types = [];
            for (var t in jQuery.typedValue.types) {
                types.push(t);
            }

            return types;
        }, 
        
        /**
         * Returns the language tags to be supported by plain-literal widgets.
         * @return {array}
         */
        literalLanguages: function () {
            return ['de', 'en', 'fr', 'nl', 'es', 'it', 'cn'];
        }, 
        
        /**
         * Returns the SPARQL query service URI for graph denoted by graphURI.
         * @param {string} graphURI
         * @return {string}
         */
        serviceURIForGraph: function (graphURI) {
            
        }, 
        
        /**
         * Returns an instance of the widget that has been registered for <code>hookName</code> and <code>hookValue</code>.
         * @param {string} hookName
         * @param {mixed} hookValue
         * @return {Widget}
         */
        getWidgetForHook: function (hookName, hookValue) {
            
        }, 
        
        /**
         * Returns an instance of the widget most suitable for editing statement.
         * @param {Statement} statement
         */
        getWidgetForStatement: function (statement) {
            
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
            var styleSheetLoaded = false;
            var links = document.getElementsByTagName('link');
            
            for (var i = 0, max = links.length; i < max; i++) {
                var uri = links[i].getAttribute('href');
                if ((uri && uri == styleSheetURI)) {
                    styleSheetLoaded = true;
                    break;
                }
            }
            
            if (!styleSheetLoaded) {
                var l   = document.createElement('link');
                l.rel   = 'stylesheet';
                l.type  = 'text/css';
                l.media = 'screen';
                l.href  = styleSheetURI;
                
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
            
        }, 
        
        /**
         * Registers a new widget type
         * @param {object} widgetSpec
         */
        registerWidget: function (widgetSpec) {
            
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
                
                _infoShortcuts[infoSpec] = predicateURI;
            }
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
         * If only an XHTML fragment should be edited, this sets the 
         * fragment's root DOM element.
         * @param {HTMLElement} root
         */
        setRootElement: function (root) {
            
        }, 
        
        /**
         * Starts editing the current page
         */
        start: function () {
            _parse();
        }, 
        
        /**
         * Sets RDFauthor options
         * @param {object} optionSpec
         */
        setOptions: function(optionSpec) {
            
        }
    }
})();
