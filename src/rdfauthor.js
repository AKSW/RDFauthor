/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * RDFauthor base object.
 * Serves as a namespace, widget registry and simplified façade.
 *
 * @class
 */
RDFauthor = (function () {
    /** @private object databanks indexed by graph URI */
    var _databanksByGraph = {};
    /** @private int number of errors that occured while parsing RDFa */
    var _parserErrors = 0;
    /** @private object information about named graphs in the page (indexed by graph URI) */
    var _graphInfo = {};
    /** @private int initial ID */
    var _idSeed = Math.round(Math.random() * 1000);
    /** @private object loaded JavaScript URIs */
    var _loadedScripts = {};
    /** @private object loaded stylesheet URIs */
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
    
    // return uninstantiable singleton
    /** @lends RDFauthor */
    return {
        addStatement: function (graphURI, statement, element) {
            
        }, 
        
        cancel: function () {
            
        }, 
        
        commit: function () {
            
        }, 
        
        defaultGraphURI: function () {
            
        }, 
        
        defaultSubjectURI: function () {
            
        }, 
        
        databankForGraph: function (graphURI) {
            
        }, 
        
        literalDatatypes: function () {
            
        }, 
        
        literalLanguages: function () {
            
        }, 
        
        serviceURIForGraph: function (graphURI) {
            
        }, 
        
        getWidgetForHook: function (hookName, hookValue) {
            
        }, 
        
        getWidgetForStatement: function (statement) {
            
        }, 
        
        loadScript: function (scriptURI) {
            
        }, 
        
        loadStylesheet: function (stylesheetURI) {
            
        }, 
        
        /**
         * With every call, returns a unique ID that can be used to build id attributes
         * for CSS selector access.
         * @param prefix string
         * @return string
         */
        nextID: function (prefix) {
            return (prefix ? String(prefix) : '') + this._idSeed++;
        }, 
        
        queryGraph: function (graphURI, query, callbackSuccess, callbackError, asynchronous) {
            
        }, 
        
        registerWidget: function (widgetSpec) {
            
        }, 
        
        setRootElement: function () {
            
        }, 
        
        start: function () {
            
        }, 
        
        setOptions: function() {
            
        }
    }
})();
