/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

RDFauthor.registerWidget({
    init: function () {
        this.maxResults            = 3;
        this.selectedResource      = null;
        this.selectedResourceLabel = null;
        this.searchTerm            = '';
        this.ongoingSearches       = 0;
        this.searchResults         = [];
        
        // search sources appearence config
        this.sources = {
            sparql:     {label: 'Local Search',         color: '#efe', border: '#e3ffe3', rank:  1}, 
            sindice:    {label: 'Sindice Search',       color: '#eef', border: '#e3e3ff', rank:  2}, 
        /*  watson:     {label: 'Watson Search',        color: '#ffe', border: '#ffffe3', rank: -1}, */
            uri:        {label: 'Auto-generated URI',   color: '#eee', border: '#e3e3e3', rank:  3}
        }
        
        // loac stylesheets
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'libraries/jquery.ui.autocomplete.css');
        RDFauthor.loadStylesheet(RDFAUTHOR_BASE + 'src/widget.resource.css');
    }, 
    
    ready: function () {
        // must be URI
        if (this.statement.hasObject()) {
            this.element().addClass('resource-autocomplete-uri');
        }
        
        var self = this;
        this.element().autocomplete({
            minChars: 3,
            delay: 1000,
            max: 20, 
            search: function (event, ui) {
                var value = self.element().val();
                // cancel search if URI entered
                if (self.isURI(value)) {
                    self.element().addClass('resource-autocomplete-uri');
                    self.element().data('autocomplete').close();
                    
                    self.selectedResource      = value;
                    self.selectedResourceLabel = undefined;
                    
                    return false;
                }
                
                self.element().removeClass('resource-autocomplete-uri');
                return true;
            }, 
            source: function (request, response) {
                // keep for later
                self.searchTerm = request.term;
                
                // search
                self.performSearch(request.term, response);
            }, 
            select: function (event, ui) {
                self.selectedResource      = ui.item.value;
                self.selectedResourceLabel = ui.item.label;
                
                self.element().val(this.selectedResourceLabel);
                
                // prevent jQuery UI default
                return false;
            }, 
            focus: function (event, ui) {
                self.element().val(ui.item.label)
                
                // prevent jQuery UI default
                return false;
            }
        })
        .data('autocomplete')._renderItem = function(ul, item) {
            return $('<li></li>')
                .data('item.autocomplete', item)
                .append('<a class="resource-edit-item" style="background-color: ' + self.sources[item.source]['color'] + ';\
                        border:1px solid ' + self.sources[item.source]['border'] + ';">\
                    <span class="resource-edit-source">' + self.sources[item.source]['label'] + '</span>\
                    <span class="resource-edit-label">' + self.highlight(item.label, self.searchTerm) + '</span>\
                    <span class="resource-edit-uri">' + self.highlight(item.value, self.searchTerm) + '</span>\
                </a>')
                .css('width', self.element().innerWidth() - 4)
                .appendTo(ul);
        };
    },
    
    element: function () {
        return jQuery('#resource-input-' + this.ID);
    }, 
    
    markup: function () {    
        var markup = '\
            <div class="container resource-value">\
                <input type="text" id="resource-input-' + this.ID + '" class="text resource-edit-input" \
                       value="' + (this.statement.hasObject() ? this.statement.objectValue() : '') + '"/>\
            </div>';

        return markup;
    }, 
    
    remove: function () {
        this.removeOnSubmit = true;
    }, 
    
    submit: function () {
        alert('Resource: Submit');
    }, 
    
    performSearch: function (searchTerm, responseCallback) {
        this.searchResults = [];
        var self = this;
        
        var range = RDFauthor.infoForPredicate(self.statement.predicateURI(), 'range');
        var rangePattern = '';
        if (range.length > 0) {
            // TODO: use all ranges
            rangePattern = '?s a <' + range[0] + '> .';
        }
        
        // SPARQL endpoint
        var query = 'SELECT DISTINCT ?s ?o WHERE {\
            ?s ?p ?o .\
            ' + rangePattern + '\
            FILTER (ISLITERAL(?o) && REGEX(?o, "' + searchTerm + '", "i"))\
        }\
        LIMIT ' + this.maxResults;
        
        RDFauthor.queryGraph(this.statement.graphURI(), query, {
            callbackSuccess: function (data) {                
                var sparqlResults = [];
                if (data['results'] && data['results']['bindings']) {
                    var bindings  = data['results']['bindings'];
                    var resources = {};
                    
                    for (var i = 0, max = bindings.length; i < max; i++) {
                        var binding = bindings[i];
                        if (binding['s']) {
                            var current = binding['s'];
                            if (current.type == 'uri') {
                                var uri = current.value;
                                var label;
                                
                                if (binding['o']) {
                                    label = binding['o']['value'];
                                }
                                
                                if (undefined == resources[uri]) {
                                    resources[uri] = true;
                                    sparqlResults.push({
                                        source: 'sparql', 
                                        value:  uri, 
                                        label:  label
                                    })
                                }
                            }
                        }
                    }
                }
                
                self.results(sparqlResults, responseCallback, 'sparql');
            }
        });
        this.ongoingSearches++;
        
        // Sindice search
        $.ajax({
            timeout: 10, 
            dataType: 'json', 
            url: 'http://api.sindice.com/v2/search?callback=?', 
            data: {
                qt: 'term', 
                page: 1, 
                format: 'json', 
                q: encodeURIComponent(searchTerm)
            }, 
            error: function (request, status, error) {
                self.results([], responseCallback);
            }, 
            success: function (data, status) {
                var sindiceResults = [];
                for (var i = 0; i < Math.min(data.entries.length, self.maxResults); ++i) {
                    var current = data.entries[i];
                    sindiceResults.push({
                        source: 'sindice', 
                        value: String(current.link), 
                        label: String(current.title)
                    });
                }

                self.results(sindiceResults, responseCallback, 'sindice');
            }
        })
        this.ongoingSearches++;
        
        // static URI
        this.ongoingSearches++;
        this.results([{
            source: 'uri', 
            value: this.generateURI(searchTerm, this.statement.graphURI()), 
            label: searchTerm
        }], responseCallback, 'uri');
    }, 
    
    results: function (partialResult, responseCallback, sourceKey) {
        var rank = this.sources[sourceKey].rank;
        this.searchResults[rank] = partialResult;
        this.ongoingSearches--;
        
        if (this.ongoingSearches <= 0) {
            var combinedResults = [];
            
            for (var i = 1, max = this.searchResults.length; i < max; i++) {
                combinedResults = combinedResults.concat(this.searchResults[i]);
            }
            
            responseCallback(combinedResults);
        };
    }, 
    
    generateURI: function (item, prefix) {
        var lastChar = prefix.charAt(prefix.length - 1);
        if (!(lastChar == '/' || lastChar == '#')) {
            prefix += '/';
        }
        
        return prefix + item;
    }, 
    
    isURI: function (term) {
        return (/(https?:\/\/|mailto:|tel:)/.exec(term) !== null);
    }, 
    
    highlight: function (text, term) {
        var ttt = text.replace(RegExp(term, 'i'), '<em>$&</em>');
        return ttt;
    }
}, [{
        name: '__OBJECT__'
    }]
);
