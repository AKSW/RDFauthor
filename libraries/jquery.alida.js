/**
 * @fileoverview jQuery Alida Plugin
 * @author Clemens Hoffmann <cannelony@gmail.com>
 * @version 0.1
 * @required alida.js, jquery.alida.css, jQuery 1.4 or higher
 */

(function($) 
{
    /** attributes */
    var alidaDOM, endpointTitle, endpointDOM, facetTitle, typingDelay,optQueryTemp,
        facetDOM, resultTitle, resultDOM, numEndpoints, numFacets, numResults;
    /** keycodes */
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
     * Trim the uri to a human readable format
     * @return Human readable label for an uri
     */
    String.prototype.trimURI = function () {
        // Splitting the label part from the uri
        if ( (sharpIndex = this.lastIndexOf("#")) != -1 ) {
            label = this.slice(sharpIndex+1,this.length);
        }else{
            slashIndex = this.lastIndexOf("/");
            label = this.slice(slashIndex+1,this.length);
        }
        //looking for concatenated words and seperate them by whitespace
        while ( (pos = label.search(/[a-z][A-Z]/)) != -1 ) {
            label = label.substr(0,pos+1) + " "  + label.substr(pos+1,label.length);
        }
        label = label.replace(/_/," / ");
        // doesn't work yet
        //label[0] = label[0].toUpperCase();
        return label;
    };

    /**
     * This prototype function returns the last element in an array
     * @return The last element in an array
     */
    Array.prototype.last = function () {
        return this[this.length-1];
    };

    /**
     * Private methods
     */

     /**
      * Init will be run at the beginning
      * @param {Object} input Input object of jQuery
      * @param {Array} settings Settings of jquery.alida
      * @param {String} alidaID Identify each input field, where alida is running
      */
    _init = function (input, settings, alidaID) {
        input.after(
            alidaDOM = $('<div class="alida" id="' + input.data('alidaID') + '"></div>')
        );
        
        if(input.data('settings').showEndpoints == true){
            alidaDOM.append(
                endpointTitle = $('<h3>' + settings.strings.endpointString + '</h3>'),
                endpointDOM = $('<div></div>').append('<ul class="endpoints"></ul>')
            );
            endpointTitle.append(
                numEndpoints = $('<span class="numberOfEndpoints"></span>')
            );
        }
        
        alidaDOM.append(
            facetTitle = $('<h3>' + settings.strings.facetString + '</h3>'),
            facetDOM = $('<div></div>').addClass('facet-slide')
                                       .append('<div class="facet-run-div">\
                                               <button class="button-back">Back</button>\
                                               <span class="facet-run"></span></div>')
                                       .append('<ul class="facets"></ul>')
                                       .append('<ul class="facetContent"></ul>'),
            resultTitle = $('<h3>' + settings.strings.resultString + '</h3>').addClass('resultTitle'),
            resultDOM = $('<div></div>').append('<ul class="results"></ul>')
        );

        facetTitle.append(
            numFacets = $('<span class="numberOfFacets"></span>')
        );

        resultTitle.append(
            numResults = $('<span class="numberOfResults"></span>')
        );
        _showHideMonitoring(input, alidaID);
        _endpoints(settings);
        if(input.data('settings').showEndpoints == true){
            $('#' + alidaID).accordion({active: 2, autoHeight: false});
        } else {
            $('#' + alidaID).accordion({active: 1, autoHeight: false});
        }
        
        $('#'+alidaID).data('input',input);
    },

    /**
     * Create a random Number
     * @return Random Number
     */
    _id = function () {
        return Math.floor(Math.random()*11111);
    },

    /**
     * Adds the given endpoints to the endpoint box
     * @param {Array} settings Settings of jquery.alida
     */
    _endpoints = function (settings) {
        $(settings.endpoints).each(function (i) {
            endpointDOM.find('.endpoints').append('<li>' + settings.endpoints[i] + '</li>');
        });
        numEndpoints.html(' [' + settings.endpoints.length + ']');
    },

    /**
     * Paste the navigation through the properties
     * @param {String} alidaID Identify each input field, where alida is running
     * @param {Array} filter Former facets
     */
    _addFacetRun = function (alidaID, filter) {
        var run = 'filter: ';
        $(filter).each(function(i){
            run+='»'+filter[i].facet;
        });
        $('#'+alidaID).find('.facet-run').html(run)
    },

    /**
     * Marks former chosen facets by the user
     * @param {String} alidaID Identify each input field, where alida is running.
     * @param {Array} filter Former facets
     */
    _markFacets = function (alidaID, filter) {
        var numF = 0;
        $('#'+alidaID+' .facets li').each(function(i){
            numF++;
            var curFacet = $(this);
            $(filter).each(function(i){
                if (curFacet.html() == filter[i].facet){
                    curFacet.css('font-weight','bold');
                    curFacet.html(curFacet.html()+' ('+filter[i].value+')');
                }
            });
        });
        $('#'+alidaID+' .numberOfFacets').html(' [' + numF + ']');
        if ( filter.length != 0) {
            var oldNumber = $('#'+alidaID+' .numberOfFacets').html();
            $('#'+alidaID+' .numberOfFacets').html(oldNumber + ' - ' +filter.length + ' filtered');
        }
        
    },

    /**
     * Insert the result
     * @param {String} alidaID Identify each input field, where alida is running
     * @param {Object} result The alida result
     */
    _insertResult = function (alidaID, result) {
        var label = result.label;
        var uri = result.URI;
        $('#'+alidaID).find('.results').append('<li>' + label + '</li>');
        $('#'+alidaID).find('.results li:last').data('uri',uri);
    },

    /**
     * Insert the facets
     * @param {String} alidaID Identify each input field, where alida is running
     * @param {String} facet Uri of facet
     * @param {String} subjectURI Uri of subject
     */
    _insertFacet = function (alidaID, facet, subjectURI) {
        var exist = false;
        $('#'+alidaID).find('.facets').find('li').each(function(i) {
            if($(this).html()==facet.trimURI()) {
                exist = true;
                $(this).data('subjects').push(subjectURI);
            }
        });
        if (exist == false) {
            $('#'+alidaID).find('.facets').append('<li>' + facet.trimURI() + '</li>');
            $('#'+alidaID).find('.facets li:last').data('uri',facet);
            $('#'+alidaID).find('.facets li:last').data('subjects',[subjectURI]);
        }
    },

    /**
     * Insert facet values
     * @param {String} alidaID Identify each input field, where alida is running
     * @param {String} faceturi Uri of the facet
     * @param {Array} fvalue Array with value object, which were created by alida
     */
    _insertFacetValue = function (alidaID, faceturi, fvalue) {
        var exist = false;
        var facetValueLabel = fvalue.label;
        var facetValue = fvalue.value;
        var facetValueType = fvalue.type;
        $('#'+alidaID).find('.facetContent').find('li').each(function(i) {
            if($(this).html()==facetValueLabel && facetValueLabel != undefined) {
                exist = true;
            }
        });
        if(exist == false && facetValueLabel != undefined) {
            $('#'+alidaID).find('.facetContent').append('<li>' + facetValueLabel + '</li>');
            $('#'+alidaID).find('.facetContent li:last').data('faceturi',faceturi);
            $('#'+alidaID).find('.facetContent li:last').data('value',facetValue);
            $('#'+alidaID).find('.facetContent li:last').data('type',facetValueType);
            $('#'+alidaID).find('.facetContent li:last').data('label',facetValue);
        }
    },

    /**
     * This function will be run, when an user click on the back button in the
     * facet value menu
     * @param {String} alidaID Identify each input field, where alida is running
     * @param {Object} result The alida result
     */
    _rebuiltContent = function (alidaID,result) {
        _reset(alidaID);
        for (var subjectURI in result.subjects) {
            _insertResult(alidaID, result.subjects[subjectURI]);
            for (var f in result.subjects[subjectURI].facets) {
                _insertFacet(alidaID, f,subjectURI);
            }
        }
    },

    /**
     * Adds even odd
     * @param {String} alidaID Identify each input field, where alida is running
     * @param {Object} result The alida result
     */
    _rdy = function (alidaID,result) {
        $('#'+alidaID+' .numberOfResults').html(' [' + result.sizeOfSubjects() + ']');
        // even odd to results
        $('#'+alidaID+' .results li').each(function(i){
            if( i % 2 == 0 ){
                $(this).addClass('even');
            }else{
                $(this).addClass('odd');
            }
        });
        // even odd to facets
        $('#'+alidaID+' .facets li').each(function(i){
            if( i % 2 == 0 ){
                $(this).addClass('even');
            }else{
                $(this).addClass('odd');
            }
        });
    },

    /**
     * Clear all entries in the gui
     * @param {String} alidaID Identify each input field, where alida is running
     */
    _reset = function (alidaID) {
        $('#'+alidaID).find('.results').empty();
        $('#'+alidaID).find('.facets').empty().slideDown();
        $('#'+alidaID).find('.facetContent').empty();
        $('#'+alidaID).find('.facet-run-div').hide();
        $('#'+alidaID).find('.facet-run').empty();
        $('#'+alidaID).find('.numberOfFacets').empty();
        $('#'+alidaID).find('.numberOfResults').empty();

    },

    /**
     * This function is in charge of displaying and closing the widget
     * @param {Object} input Input object of jQuery
     * @param {String} alidaID Identify each input field, where alida is running
     */
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
        return this.each(function(){
            
            /** default settings, may substitute by user */
            var settings = $.extend({
                limit: 10, //limit for SPARQL queries / max. number of result elements
                endpoints: [], //array of endpoints
                shownFacets: 6, //max displayed facets
                inputChars: 3, //number of inputted characters after search begins
                delay: 750, //delay after typing to start the search (ms)
                showEndpoints: true, //show endpoints in the accordion
                strings: { //displayed texts
                    facetString : 'Facets',
                    endpointString: 'Endpoints',
                    resultString: 'Results',
                    endpointErrorString: 'Error: You have to select at least one endpoint.',
                    facetCountString: 'result elements have this property.',
                    noElementsString: 'no elements to display'
                }
            },options);
            /** callbacks */
            var callbacks = jQuery.extend({
                onStart: function() {}, //would be called, if a query was send
                onStop: function() {}, //would be called, after displaying the results
                onQuery: function() {}, //modifies the query string
                onResultClick: function() {}, //modifies the action on clicking a result entry
                onPopupGui: function() {}, //changes the look and feel for the whole widget
                onResultsSort: function() {}, //modifies the sorting of results
                onResultsOutput: function() {} //changes the look and feel for displaying the results
            },options);
            
            var alidaID = 'alida-' + _id(); //indentify the unique alida widget for each input
            var resultContainer = []; //collect the results of alida
            var filter = []; //chosen facets by user
            $(this).attr('autocomplete','off'); //turn off autocomplete of each input (cache)
            $(this).data('alidaID',alidaID); //attach alidaID to input
            $(this).data('settings',settings); //attach settings to input
            $(this).data('callbacks',callbacks); //attach callbacks to input
            $(this).data('resultContainer', resultContainer); //attach resultContainer to input
            $(this).data('filter',filter); //attach filter to input
            _init($(this), settings, alidaID);

            /** clicking event on facets */
            $('#'+alidaID+' .facets li').live('click', function() {
                var clicked = {
                    facet : $(this).html(),
                    value : null
                }
                var faceturi = $(this).data('uri');
                var subjects = $(this).data('subjects');
                var result = $('#'+alidaID).data('input').data('resultContainer').last();
                var filter = $('#'+alidaID).data('input').data('filter');
                filter.push(clicked);
                $('#'+alidaID+' .facets').slideUp();
                $('#'+alidaID+' .facet-run-div').fadeIn('slow');
                _addFacetRun(alidaID,filter);
                $(subjects).each(function(i){
                    result.subjects[subjects[i]].getValues(faceturi, function(fvalues) {
                        $(fvalues).each(function(j){
                            _insertFacetValue(alidaID,faceturi,fvalues[j]);
                        });
                    });
                });
                $('.facetContent').fadeIn('slow');
            });

            /** clicking event on facet content */
            $('#'+alidaID+' .facetContent li').live('click', function() {
                var input = $('#'+alidaID).data('input');
                var facetUri = $(this).data('faceturi');
                var facetValue = $(this).data('value');
                var facetValueType = $(this).data('type');
                var optQuery = optQueryTemp;
                input.data('filter').last().value = $(this).html();
                switch(facetValueType){
                    case 'uri':
                        optQuery.push("?s <" + facetUri + "> <" + facetValue + ">. ");
                        break;
                    case 'literal':
                        optQuery.push("?s <" + facetUri + "> \"" + facetValue + "\". ");
                        break;
                    default:
                        window.console.error('error while creating optQuery');
                        break;
                }
                query(input,optQuery);
                $('#'+alidaID+' .resultTitle').click();
            });

            /** clicking event on result */
            $('#'+alidaID+' .results li').live('click', function() {
                var uri = $(this).data('uri')
                var result = $(this).html();
                $('#'+alidaID).data('input').val(result);
                $('#'+alidaID).hide();
            });

            /** clicking event on "back" button */
            $('#'+alidaID+' .button-back').live('click',function() {
                var id = $('#'+alidaID).data('input').data('alidaID');
                var result = $('#'+alidaID).data('input').data('resultContainer').last();
                var filter = $('#'+alidaID).data('input').data('filter');
                $('#'+alidaID).data('input').data('filter').pop();
                _rebuiltContent(alidaID,result);
                _rdy(alidaID,result);
                _markFacets(alidaID,filter);
                return false;
            });

            /** key events */
            $("input").keydown(function(event) {
                if( typeof( $(this).data('alidaID') ) == 'string') {
                    switch(event.which){
                        case KEY.ESC : 
                            $('#'+alidaID).hide();
                            Alida.abortRequests();
                            break;
                        default:
                            if (typeof(typingDelay)!= "undefined") {
                                window.clearInterval(typingDelay);
                            }
                           var typedInput = $(this);
                           typingDelay = setInterval(function() { 
                               Alida.abortRequests();
                               optQueryTemp = [];
                               _reset($(this).data('alidaID'));
                               query(typedInput,[]); },
                           typedInput.data('settings').delay);
                           $(this).data('filter',[]);
                           break;
                    }
                }
            });

            /**
             * Search function
             * @param {Object} input Input object of jQuery
             * @param {Array} optQuery Is used for filtering the results
             */
            query = function (input,optQuery) {
                Alida.abortRequests();
                var alidaIDTemp = input.data('alidaID');
                var resultContainerTemp = input.data('resultContainer');
                var settingsTemp = input.data('settings');
                var filter = input.data('filter');
                var searchString = input.val();
                
                _reset(alidaIDTemp);
                
                window.clearInterval(typingDelay);
                
                if (searchString.length >= settingsTemp.inputChars) {
                    Alida.query(searchString, settingsTemp.endpoints, {
                        optQuery: optQuery,
                        onStart:  function () {
                            input.addClass('spinner');
                        },
                        onResult: function (result) {
                            resultContainerTemp.push(result);
                            resultContainerTemp.last().facets(function() {
                                for (var subjectURI in resultContainerTemp.last().subjects) {
                                    _insertResult(alidaIDTemp, resultContainerTemp.last().subjects[subjectURI]);
                                    for (var f in resultContainerTemp.last().subjects[subjectURI].facets) {
                                        _insertFacet(alidaIDTemp, f,subjectURI);
                                    }
                                }
                            });
                        },
                        onStop:   function () {
                            input.removeClass('spinner');
                            // add number of results
                            $('#'+alidaIDTemp+' .numberOfResults').html(' [' + resultContainerTemp.last().sizeOfSubjects() + ']');
                            // even odd to results
                            $('#'+alidaIDTemp+' .results li').each(function(i){
                                if( i % 2 == 0 ){
                                    $(this).addClass('even');
                                }else{
                                    $(this).addClass('odd');
                                }
                            });
                            // even odd to facets
                            $('#'+alidaIDTemp+' .facets li').each(function(i){
                                if( i % 2 == 0 ){
                                    $(this).addClass('even');
                                }else{
                                    $(this).addClass('odd');
                                }
                            });
                            _markFacets(alidaIDTemp,filter);
                        }
                    });
                }
            };
            
        });
    };

})(jQuery);