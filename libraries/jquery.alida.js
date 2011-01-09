(function($) 
{
    var $widget, alidaDOM, endpointTitle, endpointDOM, facetTitle,
        facetDOM, resultTitle, resultDOM, numEndpoints, numFacets, numResults;
    //keycodes
    var KEY = {
        BACKSPACE   : 8,
        RETURN      : 13,
        DEL         : 46,
        COMMA       : 188,
        TAB         : 9,
        UP          : 38,
        DOWN        : 40,
        LEFT        : 37,
        RIGHT       : 39,
        ESC         : 27,
        PAGEUP      : 33,
        PAGEDOWN    : 34,
        ALT         : 18,
        CTRL        : 17
    };

    /**
     * Private methods
     */

    _init = function (input, settings, alidaID) {
        input.after(
            alidaDOM = $('<div class="alida" id="' + input.data('alidaID') + '"></div>')
        );

        alidaDOM.append(
            endpointTitle = $('<h3>' + settings.strings.endpointString + '</h3>'),
            endpointDOM = $('<div></div>').append('<ul class="endpoints"></ul>'),
            facetTitle = $('<h3>' + settings.strings.facetString + '</h3>'),
            facetDOM = $('<div></div>').append('<ul class="facets"></ul>')
                                       .append('<ul class="facetContent"></ul>'),
            resultTitle = $('<h3>' + settings.strings.resultString + '</h3>'),
            resultDOM = $('<div></div>').append('<ul class="results"></ul>')
        );

        endpointTitle.append(
            numEndpoints = $('<span class="numberOfEndpoints"></span>')
        );

        facetTitle.append(
            numFacets = $('<span class="numberOfFacets"></span>')
        );

        resultTitle.append(
            numResults = $('<span class="numberOfResults"></span>')
        );
        _showHideMonitoring(input, alidaID);
        _endpoints(settings);
        $('#' + alidaID).accordion({active: 2, autoHeight: false});
    },

    _id = function () {
        return Math.floor(Math.random()*11111);
    },

    _endpoints = function (settings) {
        $(settings.endpoints).each(function (i) {
            endpointDOM.find('.endpoints').append('<li>' + settings.endpoints[i] + '</li>');
        });
        numEndpoints.html(' [' + settings.endpoints.length + ']');
    },

    _insertResult = function (alidaID, label) {
        $('#'+alidaID).find('.results').append('<li>' + label + '</li>');
    },
    
    _insertFacet = function (alidaID, facet) {
        var exist = false;
        $('#'+alidaID).find('.facets').find('li').each(function() {
            if($(this).html()==facet) {
                exist = true;
            }
        });
        if (exist == false) {
            $('#'+alidaID).find('.facets').append('<li>' + facet + '</li>');
        }
    },

    _showHideMonitoring = function (input, alidaID) {
        var alidaFocus;
        input.focus(function(){
            $('#' + alidaID).show();
        });
        $("html").click(function(){
            if ($('#' + alidaID).css("display") != "none" && alidaFocus == false) {
                $('#' + alidaID).hide();
            }else if (alidaFocus == true){
                $('#' + alidaID).show();
            }
        });
        $('#' + alidaID).parent().mouseover(function(){
            alidaFocus = true;
        });
        $('#' + alidaID).parent().mouseout(function(){
            alidaFocus = false;
        });
    }

    /**
     * Public methods
     */
    $.fn.alida = function(options) {
        // default settings, may substitute by user
        var settings = $.extend({
            limit: 10, //limit for SPARQL queries / max. number of result elements
            endpoints: [], //array of endpoints
            shownFacets: 6, //max displayed facets
            inputChars: 3, //number of inputted characters after search begins
            delay: 750, //delay after typing to start the search (ms)
            strings: { //displayed texts
                facetString : 'Facets',
                endpointString: 'Endpoints',
                resultString: 'Results',
                endpointErrorString: 'Error: You have to select at least one endpoint.',
                facetCountString: 'result elements have this property.',
                noElementsString: 'no elements to display'
            }
        },options);

        var callbacks = jQuery.extend({
            onStart: function() {}, //would be called, if a query was send
            onStop: function() {}, //would be called, after displaying the results
            onQuery: function() {}, //modifies the query string
            onResultClick: function() {}, //modifies the action on clicking a result entry
            onPopupGui: function() {}, //changes the look and feel for the whole widget
            onResultsSort: function() {}, //modifies the sorting of results
            onResultsOutput: function() {} //changes the look and feel for displaying the results
        },options);

        return this.each(function(){
            var input = $(this);
            var alidaID = 'alida-' + _id();
            var alidaResult;
            input.data('alidaID',alidaID);
            _init(input, settings, alidaID);
            Alida.query('Datenbank', settings.endpoints, function(result){
                alidaResult = result;
                alidaResult.facets(function(){
                    for (var subjectURI in alidaResult.subjects) {
                        _insertResult(alidaID, alidaResult.subjects[subjectURI].label);
                        for (var f in alidaResult.subjects[subjectURI].facets) {
                            _insertFacet(alidaID, f);
                        }
                    }
                });
            });
        });
    };

})(jQuery);