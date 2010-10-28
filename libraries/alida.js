Alida = (function ($) {    
    var _options = {
        // TODO: defaults
    };
    
    function _private() {
        
    };
    
    return {
        setOptions: function (options) {
            _options = $.extend(_options, options);
        }, 
        
        addEndpoint: function (endpointURI) {
            
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
            
            callback(result);
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