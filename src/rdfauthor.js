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
    /** @private {object} databanks indexed by graph URI */
    var _databanksByGraph = {};
    /** @private {int} number of errors that occured while parsing RDFa */
    var _parserErrors = 0;
    /** @private {object} information about named graphs in the page (indexed by graph URI) */
    var _graphInfo = {};
    /** @private {int} initial ID */
    var _idSeed = Math.round(Math.random() * 1000);
    /** @private {object} loaded JavaScript URIs */
    var _loadedScripts = {};
    /** @private {object} loaded stylesheet URIs */
    var _loadedStylesheets = {};
    
    /**
     * Updates all sources via SPARQL/Update
     * @private
     */
    function _updateSource() {
        
    };
    
    /**
     * Makes an element's triples editable
     * @private
     */
    function _makeElementEditable() {
        
    };
    
    /**
     * Adds a new RDFA triple
     * @private
     */
    function _addTriple(element, triple, graph) {
        if (triple != undefined) {
            var statement = new Statement(triple);
            RDFauthor.addStatement(graph, statement, element);
        }
    };
    
    /**
     * Sets up RDFA namespace and parser callbacks
     * @private
     */
    function _setupParser() {
        window.RDFA = window.RDFA | {};
        window.RDFA.CALLBACK_NEW_TRIPLE_WITH_URI_OBJECT = _addTriple;
        window.RDFA.CALLBACK_NEW_TRIPLE_WITH_LITERAL_OBJECT = _addTriple;
    };
    
    // RDFauthor initialization code
    _setupParser();
    
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
            
        }, 
        
        /**
         * Cancels the editing process.
         */
        cancel: function () {
            
        }, 
        
        /**
         * Commits an ongoing editing process. All pending changes will be sent to
         * sources.
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
         * Returns the $.rdf.databank that stores statements for graph denoted by graphURI.
         * @param {string} graphURI
         * @return {$.rdf.databank}
         */
        databankForGraph: function (graphURI) {
            
        }, 
        
        /**
         * Returns the datatypes to be supported by typed-literal widgets.
         * @return {array}
         */
        literalDatatypes: function () {
            
        }, 
        
        /**
         * Returns the language tags to be supported by plain-literal widgets.
         * @return {array}
         */
        literalLanguages: function () {
            
        }, 
        
        /**
         * Returns the SPARQL query service URI for graph denoted by graphURI.
         * @param {string} graphURI
         * @return {string}
         */
        serviceURIForGraph: function (graphURI) {
            
        }, 
        
        /**
         * Returns an instance of the widget that has been registered for 
         * hookName and hookValue.
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
         * Loads a JavaScript file by including a <code>&lt;script&gt;</code> tag in the page header.
         * @param {string} scriptURI
         */
        loadScript: function (scriptURI) {
            
        }, 
        
        /**
         * Loads a Stylesheet file by including a <code>&lt;script&gt;</code> tag in the page header.
         * @param {string} stylesheetURI
         */
        loadStylesheet: function (stylesheetURI) {
            
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
            
        }, 
        
        /**
         * Sets RDFauthor options
         * @param {object} optionSpec
         */
        setOptions: function(optionSpec) {
            
        }
    }
})();
