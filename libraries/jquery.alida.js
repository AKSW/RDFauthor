(function($) 
{
    var alidaDOM, endpointTitle, endpointDOM, facetTitle, typingDelay,optQueryTemp,
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

    Array.prototype.last = function () {
        return this[this.length-1];
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
            facetDOM = $('<div></div>').addClass('facet-slide')
                                       .append('<div class="facet-run-div">\
                                               <button class="button-back">Back</button>\
                                               <span class="facet-run"></span></div>')
                                       .append('<ul class="facets"></ul>')
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
        $('#'+alidaID).data('input',input);
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
    
    _addFacetRun = function (alidaID, facetrun) {
        var run = $('#'+alidaID).find('.facet-run').html() + '»' + facetrun;
        $('#'+alidaID).find('.facet-run').html(run)
    },

    _insertResult = function (alidaID, result) {
        var label = result.label;
        var uri = result.URI;
        $('#'+alidaID).find('.results').append('<li>' + label + '</li>');
        $('#'+alidaID).find('.results li:last').data('uri',uri);
    },
    
    _insertFacet = function (alidaID, facet, subjectURI) {
        var exist = false;
        $('#'+alidaID).find('.facets').find('li').each(function(i) {
            if($(this).html()==facet.trimURI()) {
                exist = true;
                $(this).data('subjects').push(subjectURI);
            }
            var numF = i+1;
            $('#'+alidaID+' .numberOfFacets').html(' [' + numF + ']');
        });
        if (exist == false) {
            $('#'+alidaID).find('.facets').append('<li>' + facet.trimURI() + '</li>');
            $('#'+alidaID).find('.facets li:last').data('uri',facet);
            $('#'+alidaID).find('.facets li:last').data('subjects',[subjectURI]);
        }
    },
    
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

    _rebuiltContent = function (alidaID,result) {
        _reset(alidaID);
        for (var subjectURI in result.subjects) {
            _insertResult(alidaID, result.subjects[subjectURI].label);
            for (var f in result.subjects[subjectURI].facets) {
                _insertFacet(alidaID, f,subjectURI);
            }
        }
    },

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
    
    _reset = function (alidaID) {
        $('#'+alidaID).find('.results').empty();
        $('#'+alidaID).find('.facets').empty().slideDown();
        $('#'+alidaID).find('.facetContent').empty();
        $('#'+alidaID).find('.facet-run-div').hide();
        $('#'+alidaID).find('.facet-run').empty();
        $('#'+alidaID).find('.numberOfFacets').empty();
        $('#'+alidaID).find('.numberOfResults').empty();

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
        return this.each(function(){
            
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
            
            var alidaID = 'alida-' + _id();
            var resultContainer = []
            $(this).data('alidaID',alidaID);
            $(this).data('settings',settings);
            $(this).data('callbacks',callbacks);
            $(this).data('resultContainer', resultContainer);
            $(this).before("<input id='"+alidaID+"-hiddenURI' type='hidden' value=''></input>");
            _init($(this), settings, alidaID);

            $('#'+alidaID+' .facets li').live('click', function() {
                var faceturi = $(this).data('uri');
                var subjects = $(this).data('subjects');
                var result = $('#'+alidaID).data('input').data('resultContainer').last();
//                var left = $('.facets');
//                var right = $('.facetContent');
//                left.animate({
//                    left: parseInt(left.css('left'),10) == 0 ? -left.outerWidth() : 0
//                });
//                right.animate({
//                   marginLeft: parseInt(right.css('marginLeft'),10) == 0 ? right.outerWidth() : 0
//                });
                $('#'+alidaID+' .facets').slideUp();
                $('#'+alidaID+' .facet-run-div').fadeIn('slow');
                _addFacetRun(alidaID,$(this).html());
                $(subjects).each(function(i){
                    result.subjects[subjects[i]].getValues(faceturi, function(fvalues) {
                        $(fvalues).each(function(j){
                            _insertFacetValue(alidaID,faceturi,fvalues[j]);
                        });
                    });
                });
                $('.facetContent').fadeIn('slow');
            });

            $('#'+alidaID+' .facetContent li').live('click', function() {
                var input = $('#'+alidaID).data('input');
                var facetUri = $(this).data('faceturi');
                var facetValue = $(this).data('value');
                var facetValueType = $(this).data('type');
                var optQuery = optQueryTemp;
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
            });

            $('#'+alidaID+' .results li').live('click', function() {
                var hiddenUri = alidaID + '-hiddenURI';
                var uri = $(this).data('uri')
                var result = $(this).html();
                $('#'+hiddenUri).val(uri);
                $('#'+alidaID).data('input').val(result);
                $('#'+alidaID).hide();
            });

            $('#'+alidaID+' .button-back').live('click',function() {
                var id = $('#'+alidaID).data('input').data('alidaID');
                var result = $('#'+alidaID).data('input').data('resultContainer').last();
                _rebuiltContent(alidaID,result);
                _rdy(alidaID,result);
                return false;
            });

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
                           break;
                    }
                }
            });
            
            query = function (input,optQuery) {
                Alida.abortRequests();
                var alidaIDTemp = input.data('alidaID');
                var resultContainerTemp = input.data('resultContainer');
                var settingsTemp = input.data('settings');
                var searchString = input.val();
                
                _reset(alidaIDTemp);
                
                window.clearInterval(typingDelay);
                
                if (searchString.length >= settingsTemp.inputChars) {
                    Alida.query(searchString, optQuery, settingsTemp.endpoints,
                    /** startCallback */
                    function(){
                        input.addClass('spinner');
                    },
                    /** resultCallback */
                    function(result){
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
                    /** stopCallback */
                    function(){
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
                    });
                }
            };
            
        });
    };

})(jQuery);