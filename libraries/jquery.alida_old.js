    /**
     * @fileoverview
     * This plugin is an autosuggest widget for querying
     * SPARQL endpoints.
     * It is possible to filter the searches via facets and
     * choose between predefined endpoints.
     * It is designed to be expandable via callback functions.
     * Requirements: 
     * <ul>
     * <li>jQuery (http://www.jquery.com)</li>
     * <li>jQueryUI (http://www.jqueryui.com)</li>
     * </ul>
     * @author Marcus Nitzschke
     * @author Clemens Hoffmann
     * @author Konrad Baumheier
     * @author Thomas Schöne
     * @author Marina Mitjagin
     */

(function($) 
{
    jQuery.fn.alida = function(options)
    {
        // default settings, may substitute by user
        settings = jQuery.extend(
        {
            // limit for SPARQL queries / max. number of result elements
            limit : 10,
            // array of endpoints
            endpoints : [],
            // max displayed facets
            shownFacets  : 6,
            // number of inputted characters after search begins
            inputChars : 3,
            // delay after typing to start the search (ms)
            delay : 750,
            // displayed texts
            strings: 
            { 
                facetString : 'Facets',
                endpointString: 'Endpoints',
                resultString: 'Results',
                endpointErrorString: 'Error: You have to select at least one endpoint.',
                facetCountString: 'result elements have this property.',
                noElementsString: 'no elements to display'
            }
        },options);

        // available callbacks
        callbacks = jQuery.extend(
        {
            // would be called, if a query was send
            startCallback : undefined,
            // would be called, after displaying the results
            stopCallback : undefined,
            // modifies the query string
            queryCallback : undefined,
            // modifies the action on clicking a result entry
            resultClickCallback : undefined,
            // changes the look and feel for the whole widget
            popupGuiCallback : undefined,
            // modifies the sorting of results
            resultsSortCallback : undefined,
            // changes the look and feel for displaying the results
            resultsOutputCallback : undefined
        },options);
        
        //specific KeyCodes
        var KEY = 
        {
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

        // if console is not defined, e.g., Firebug console is not enabled or Non-Firefox browser
        if ( typeof(window.console) == 'undefined')
        {
            window.console = {};
            window.console.info = function(msg)
            {
                return;
            };
        }
        
        //alias input field
        $input = $(this);
        // set autocomplete off for the input field
        $input.attr('autocomplete','off');

        //init the widget
        init = new Widget(callbacks.resultClickCallback,callbacks.popupGuiCallback);

                          
        /**
         * Function for cleaning all useless whitespaces in the xml files.
         *
         * This function removes all whitespaces before and after the string.
         * @return {String} the given string without useless whitespaces
         */
        String.prototype.trim = function() 
        {
            return this.replace(/^\s+/g, '').replace(/\s+$/g, '');
        };

        /**
         * Function for making clean Labels out of an URI.
         *
         * The function checks whether the URI consists a sharp
         * and if not the last slash is used for slicing the URI.
         * @return {String} the label of the given URI
         */
        String.prototype.trimURI = function()
        {
            // Splitting the label part from the uri
            if ( (sharpIndex = this.lastIndexOf("#")) != -1 )
            {
                label = this.slice(sharpIndex+1,this.length);
            }
            else
            {
                slashIndex = this.lastIndexOf("/");
                label = this.slice(slashIndex+1,this.length);
            }

            //looking for concatenated words and seperate them by whitespace
            while ( (pos = label.search(/[a-z][A-Z]/)) != -1 )
            {
                label = label.substr(0,pos+1) + " "  + label.substr(pos+1,label.length);
            }
            
            label = label.replace(/_/," / ");
            // doesn't work yet
            label[0] = label[0].toUpperCase();
            
            return label;
        };

        /**
        * This function creates the SPARQL query that is send to the enabled endpoints.
        * @param {Array} optQuery array of optional 'AND' statements added to the main query
        * @param {function} startCallback startCallback called before every query
        * @param {function} queryCallback modified the sending query
        */
        function buildQuery(optQuery,startCallback,queryCallback)
        {
            if ($input.val().length >= settings.inputChars)
            {
                if( jQuery.isFunction(queryCallback) )
                {
                    mainQuery = queryCallback(optQuery);
                }
                else
                {
                    mainQuery = "SELECT DISTINCT ?s ?search\
                                 WHERE {\
                                  ?s ?p ?o.\
                                  FILTER regex(?o, \"" + $input.val() + "\", \"i\" ).\
                                  FILTER isLiteral(?o).\
                                  ?s <http://www.w3.org/2000/01/rdf-schema#label> ?search. ";

                    $(optQuery).each(function(i)
                    {              
                        mainQuery += optQuery[i];
                    })
                     
                    mainQuery += "} LIMIT " + settings.limit;
                }
                
                if( jQuery.isFunction(startCallback) )
                {
                    startCallback();
                }
                query = new SparqlQuery(mainQuery,settings.endpoints).send();
                window.console.info(mainQuery);
            }
        }

        /**
         * This function clears arrays and the content of
         * the facet and result box.
         */
        function reset()
        {
            init.mask.empty();
            // do the same for the facets
            $("#facets").empty();
            $("#facetContent").empty();
            $("#numberOfFacets,#numberOfResults").empty();
            init.facets = new Array();
            // ..and the optional query statements
            init.optQuery = new Array();
            $('#noElements').show();
        }
/*------------------------------------------------------------------*/
        
        /**
         * Main class for handling the alida widget.
         * 
         * This class detects all events and calls the respective methods.
         * @constructor
         */
        function Widget(resultClickCallback,popupGuiCallback)
        {
/* ---------------------------------------------------- constructor */

            /**
             * Mask instance for displaying the results
             */
            this.mask = new Mask();

            /**
             * Array of available facets
             */
            this.facets = new Array();

            /**
             * Array of optional statements added to the main query
             * This is used for specifying the query when facets are checked.
             */
            this.optQuery = new Array();

            // intervall for sending query after typing pause
            var typingDelay;
            
            // making a little stupid singleton
            var focused = false;
//            $('head').append("<script type=\"text/javascript\" src=\"http://www.thefigtrees.net/lee/sw/sparql.js\" />");
            
            // hidden input for subject uri
            $input.before("<input id=\"hiddenURI\" type=\"hidden\" name=\"URI\" value=\"\"></input>");

            if( jQuery.isFunction(popupGuiCallback) )
            {
                popupHtml = popupGuiCallback();
            }
            else
            {
                popupHtml = "<div class=\"alida\" id=\"popup\">\
                  <h3>" + settings.strings.endpointString + "<span id=\"numberOfEndpoints\"></span></h3>\
                  <div>\
                      <ul id=\"endpoints\">\
                      </ul>\
                  </div>\
                  <h3>" + settings.strings.facetString + "<span id=\"numberOfFacets\"></span></h3>\
                  <div class=\"facetContainer\">\
                      <ul id=\"facets\">\
                      </ul>\
                      <ul id=\"facetContent\">\
                      </ul>\
                  </div>\
                  <h3>" + settings.strings.resultString + "<span id=\"numberOfResults\"></span></h3>\
                  <div>\
                      <div id=\"resultlist\">\
                          <ul id=\"noElements\">\
                              <li>\
                                  " + settings.strings.noElementsString + "\
                              </li>\
                          </ul>\
                          <ul id=\"results\">\
                          </ul>\
                      </div>\
                  </div>";
                $input.after(popupHtml);
                $('#popup').accordion({active: 2, autoHeight: false});  
            }
            
            $input.focus(function(event)
            {
                if (focused == false)
                {
                    // displaying the widget
                    $("#popup").show('slow');
                    // showing the number of endpoints
                    $("#numberOfEndpoints").html(" (" + settings.endpoints.length + ")");
                    // converting the endpoint urls from strings to endpoint objects
                    $(settings.endpoints).each(function(i)
                    {
                        settings.endpoints[i] = new Endpoint(settings.endpoints[i]);
                        // checking whether endpoints are enabled and add them to the widget
                        if (settings.endpoints[i].enabled)
                        {
                            $("#endpoints").append("<li><input type=\"checkbox\" name=\"" + i + "\" checked>\
                                <a href=\"" + settings.endpoints[i].identifier + "\" target=\"_blank\">" + settings.endpoints[i].identifier + "</a>\
                                </input></li>");
                        }
                        else
                        {
                            $("#endpoints").append("<li><input type=\"checkbox\" name=\"" + i + "\">\
                                <a href=\"" + settings.endpoints[i].identifier + "\" target=\"_blank\">" + settings.endpoints[i].identifier + "</a>\
                                </input></li>");
                        }
                        if (i % 2 == 0)
                            {
                                $("#endpoints li:last").addClass("even");
                            }
                            else
                            {
                                $("#endpoints li:last").addClass("odd");
                            }
                    })

                    // Event for activating/deactivating an endpoint via Widget
                    $("#endpoints input:checkbox").click(function()
                    {
                        //clear all arrays and facets and results
                        reset();
                        if ($(this).is(":checked"))
                        {
                            settings.endpoints[parseInt($(this).attr('name'))].enable();
                            //automatically resending the query
                            buildQuery([],callbacks.startCallback,callbacks.queryCallback);
                        }
                        else
                        {
                            settings.endpoints[parseInt($(this).attr('name'))].disable();
                            // automatically resending the query
                            buildQuery([],callbacks.startCallback,callbacks.queryCallback);
                        }

                        // checking whether all endpoints are disabled
                        anyEndpointActivated = false;
                        $(settings.endpoints).each(function(j)
                        {
                            if ( settings.endpoints[j].enabled )
                            {
                                anyEndpointActivated = true;
                            }
                        })
                        // displaying an error message if all endpoints are disabled
                        if ( !anyEndpointActivated )
                        {
                            $("#endpoints").before("<span class=\"sboxError\">" + settings.strings.endpointErrorString + "</span>");
                        }
                        else
                        {
                            $(".sboxError").remove();
                        }
                    });
                    
                    focused = true;
                }
            }).keydown(function(event)
            {
                // clear facet- and resultentries if the user types less than defined inputchars
                if($input.val().length<settings.inputChars)
                {
                    //clear all arrays and facets and results
                    reset();
                }
                // different events for keyboard navigation
                switch(event.which)
                {
                    case KEY.ESC:
                        event.preventDefault();
                        $("#popup").hide();
                        break;
                    case KEY.UP:
                        event.preventDefault();
                        if($("#results li").hasClass("selectedEntry"))
                        {
                            // if "up" was typed, the .selectedEntry class will removed and the previous will select
                            $(".selectedEntry").removeClass("selectedEntry").prev().addClass("selectedEntry");
                        }
                        else
                        {
                            // add .selectedEntry class to the focused entry
                            $("#results li:last").addClass("selectedEntry");
                        }
                        var pos = $(".selectedEntry").position();
                        if(pos != null )
                        {
                            $('#resultlist').scrollTop(pos.top);
                        }
                        /* can be used, if the current selected item should be shown immediately in the input field
                        if($("#results li").hasClass(CLASSES.SELECT))
                        {
                            selectedItemSubject = $("."+CLASSES.SELECT).children(".resultelementSubject").text();
                            selectedItemObject = $("."+CLASSES.SELECT).children(".resultelementObject").text();
                            $input.val(selectedItemObject);
                            $("#hiddenURI").val(selectedItemSubject);
                        }
                        */
                        break;
                    case KEY.DOWN:
                        event.preventDefault();
                        if($("#results li").hasClass("selectedEntry"))
                        {
                            // if "down" was typed, the .selectedEntry class will removed and the next will select
                            $(".selectedEntry").removeClass("selectedEntry").next().addClass("selectedEntry");
                            //$("#resultlist").scrollTop($(".selectedEntry").position());
                        }
                        else
                        {
                            // add .selectedEntry to the focused entry
                            $("#results li:first").addClass("selectedEntry");
                        }
                        
                        var pos = $(".selectedEntry").position();
                        if(pos != null )
                        {
                            $('#resultlist').scrollTop(pos.top);
                        }
                        
                        /* can be used, if the current selected item should be shown immediately in the input field
                        if($("#results li").hasClass(CLASSES.SELECT))
                        {
                            selectedItemSubject = $("."+CLASSES.SELECT).children(".resultelementSubject").text();
                            selectedItemObject = $("."+CLASSES.SELECT).children(".resultelementObject").text();
                            $input.val(selectedItemObject);
                            $("#hiddenURI").val(selectedItemSubject);
                        }
                        */

                        break;
                    // LEFT, RIGHT, PAGEUP, PAGEDOWN, CRTL, ALT have no action
                    case KEY.LEFT:
                    case KEY.RIGHT:
                    case KEY.PAGEUP:
                    case KEY.PAGEDOWN:
                    case KEY.CTRL:
                    case KEY.ALT:
                        break;
                    case KEY.TAB:
                        event.preventDefault();
                        electedEntry();
                        break;
                    case KEY.RETURN:
                        if($("#results li").hasClass("selectedEntry"))
                        {
                            event.preventDefault();
                            electedEntry();
                        }
                        break;
                    case KEY.BACKSPACE:
                    case KEY.DEL:
                    default:
                       //clear all arrays, facets and results
                       reset();
                       if(typingDelay)
                       {
                           window.clearInterval(typingDelay);
                       }
                       typingDelay = setInterval(initBuildQuery, settings.delay);
                }
            });
            

            /**
             * This function will be called after each typing pause.
             */
            function initBuildQuery()
            {
                window.clearInterval(typingDelay);
                buildQuery(this.optQuery,callbacks.startCallback,callbacks.queryCallback);
            }

            /**
             * This function set the values of the input field and
             * hidden input. The input field gets the name of an
             * result. The hidden input saves the URI in background.
             * After user's selection the widget will be closed.
             * Will called by RETURN and TAB.
             */
            function electedEntry()
            {
                selectedItemSubject = $(".selectedEntry").children(".resultelementSubject").text();
                selectedItemObject = $(".selectedEntry").children(".resultelementObject").text();
                $input.val(selectedItemObject);
                $("#hiddenURI").val(selectedItemSubject);
                $(".selectedEntry").removeClass("selectedEntry");
                $("#popup").hide();
            }
            
            // puts the clicked result into the input field
            $('.resultelement').live('click',function()
            {
                if( jQuery.isFunction(resultClickCallback) )
                {
                    resultClickCallback();
                }
                else
                {
                    // same procedure only for mouseclick (refer to electedEntry description)
                    selectedItemSubject = $(this).find(".resultelementSubject").text();
                    selectedItemObject = $(this).find(".resultelementObject").text();
                    $input.val(selectedItemObject);
                    $("#hiddenURI").val(selectedItemSubject);
                    $("#popup").hide();
                    $input.focus();
                }
            });

            // handler for closing the widget
            $().ready(function()
            {
                  var alidaFocus;
                  $("html").click(function()
                  {
                    if ($("#popup").css("display") != "none" )
                    {
                        if (alidaFocus == false)
                        {
                            $("#popup").hide('slow');
                        }
                    }
                    else
                    {
                        if (alidaFocus == true)
                        {
                            $("#popup").show('slow');
                        }
                    }
                  });
                
                  $("#popup").parent().mouseover(function()
                  {
                    alidaFocus = true;
                  });
                  $("#popup").parent().mouseout(function()
                  {
                    alidaFocus = false;
                  });

                  $("#resultlist").mouseover(function()
                  {
                      $(".selectedEntry").removeClass("selectedEntry");
                  });
            });

            $input.ajaxStart(function(){$input.addClass("processing");}).ajaxStop(function(){$input.removeClass("processing")});

        } // END OF CLASS WIDGET

/*------------------------------------------------------------------*/
        
        /**
         * Class for managing the facets.
         * @constructor
         * @param {String} label label of the facet
         */
        function Facet(label)
        {
/* ----------------------------------------------------- attributes */
            /**
             * Label that is shown in the content pane of the widget.
             */
            this.label = label; 

            /**
             * Counter which causes the rating of the facet.
             */
            this.counter = 1;
            
        } // END OF CLASS FACET
        
/*------------------------------------------------------------------*/
        

        /**
         * Class for handling SPARQL queries.
         * @constructor
         * @param {String} query the query to send
         * @param {Array} endpoints an array of endpoints
         */
        function SparqlQuery(query, endpoints) {
/* ----------------------------------------------------- attributes */

            /**
             * The query that will send to the endpoints
             */
            this.query = query;

            /**
             * Array of endpoints to which the query will be send.
             */
            this.endpoints = endpoints;

/* ------------------------------------------------- public methods */
  
            /**
            * Method for sending a sparql query to the defined endpoints.
            * At the moment we are using the SPARQL client from 
            * http://www.thefigtrees.net/lee/sw/sparql.js
            * @member SparqlQuery
            */

            this.send = function() {
                endpoints = this.endpoints;
                query = this.query;
                $(endpoints).each(function(i)
                {
                    if (endpoints[i].enabled)
                    {
//                        var sparqler = new SPARQL.Service(endpoints[i].identifier);
//                        sparqler.setOutput("xml");
//                        sparqler.setMethod("GET");
//                        sparqler.query(query,
//                        {
//                            failure: function(fail)
//                            {
//                                //alert('fail: '+fail.responseText);
//                                $input.removeClass("processing");
//                            },
//                            success: function(data)
//                            {
//                                receive(data, callbacks.stopCallback);
//                            },
//                            error: function(err)
//                            {
//                                alert('error: '+err);
//                                $input.removeClass("processing");
//                            }
//                        });
                          $.ajax({
                              type: "GET",
                              url: 'js/proxy.php',
                              data: "contentType=xml&endpoint="+endpoints[i].identifier+"&query="+escape(query),
                              success: function(data){
                                  receive(data, callbacks.stopCallback);
                              },
                              error: function(err,txt,errt){
                                  alert("Fehler:" + err + " " + txt + " " + errt);
                              }
                          });
                    }
                })
                return this;
            };

/* ------------------------------------------------- static methods */

            /**
            * This method receives the data from the endpoints and parses them.
            *
            * This function also handles the complete facet feature, e.g. calculating the facets
            * @param {String} data the received data in xml format
            * @param {function} callback StopCallback
            * @member SparqlQuery
            */
            function receive(data, callback) {
                
                // adding the result element to the Mask.elements array
                $(data).find('result').each(function()
                {
                    $(this).find("binding").each(function()
                    {
                        if(this.attributes[0].value=="s")
                        {
                            subject = $(this).text().trim();
                        }
                        if(this.attributes[0].value=="search")
                        {
                            object = $(this).text().trim();
                        }
                    });

                    result = object.trim();
                    if(result.length > 0)
                    {
                        resEl = new ResultElement(subject, "", object);
                        init.mask.addElement(resEl, callbacks.resultsOutputCallback);
                        $('#noElements').hide();
                    }
					else
					{
						$('#noElements').show();
					}
					


                    subject = null;
                    predicate = null;
                    object = null;
                    
                });

                // if the number of results is zero, remove spinner from input
                if(init.mask.elements.length == 0)
                {
                    // remove spinner if searching done
                    //$input.removeClass("processing");
                }
                // receiving all available facets of the resultset
                $(init.mask.elements).each(function(h)
                {
                    //provides the element for following loops
                    element = init.mask.elements[h];

                    // building the query for receiving all available facets of the results
                    queryFacet = "SELECT DISTINCT ?p WHERE { <" + init.mask.elements[h].subject + "> ?p  ?o}";
                    window.console.info(queryFacet);
                    
                    $(settings.endpoints).each(function(i)
                    {
                        if (settings.endpoints[i].enabled)
                        {
                           $.ajax({
                              type: "GET",
                              url: 'js/proxy.php',
                              data: "contentType=xml&endpoint="+endpoints[i].identifier+"&query="+escape(queryFacet),
                                success: function(data) 
                                {
                                    // parsing the results and adding them to the facets array
                                    $(data).find("uri").each(function()
                                    {
                                        $uri = $(this);
                                        // checking that the facets are disjoint and rank them
                                        if (init.facets.length == 0)
                                        {
                                            init.facets.push(new Facet($uri.text()));
                                        }
                                        else
                                        {
                                            var markedForInput;
                                            $(init.facets).each(function(f)
                                            {
                                                if( $uri.text() != init.facets[f].label )
                                                {
                                                    markedForInput = true;
                                                }
                                                else
                                                {
                                                    markedForInput = false;
                                                    init.facets[f].counter++;
                                                    return false;
                                                }            
                                            });
                                            if ( markedForInput )
                                            {
                                                init.facets.push(new Facet($uri.text()));
                                            }
                                        }
                                    })
                                    
                                    // sorting the array of facets with the counter property
                                    init.facets.sort(function(a,b)
                                    {
                                        return b.counter - a.counter;
                                    });
                                    
                                    $("#facets").empty();
                                    $("#facetContent").empty();
                                    
                                    // checking whether the number of received facets is smaller than the number to show in settings
                                    settings.shownFacets < init.facets.length ? smallerNumber = settings.shownFacets : smallerNumber = init.facets.length;
                                    
                                    var numberOfFacets = 0;
                                    if(init.mask.elements.length != 0)
                                    {
                                        numberOfFacets = smallerNumber;
                                    }
                                    
                                    // showing the number of facets and results in the widget
                                    $('#numberOfFacets').html(" (" + numberOfFacets + ")");
                                    $('#numberOfResults').html(" (" + init.mask.elements.length + ")");
                                    
                                    // adding the facets to the widget
                                    for (var j = 0; j < smallerNumber; j++)
                                    {
                                        showFacet = "<li name=\"" + init.facets[j].label + "\" title=\"" + init.facets[j].counter + " ";
                                        showFacet += settings.strings.facetCountString + "\">" + init.facets[j].label.trimURI() + "</li>";
                                        $("#facets").append(showFacet);
                                        if (j % 2 == 0)
                                        {
                                            $("#facets li:last").addClass("even");
                                        }
                                        else
                                        {
                                            $("#facets li:last").addClass("odd");
                                        }
                                    }
                                    
                                    // remove spinner if searching done
                                    //$input.removeClass("processing");
                                    // StopCallback after searching
                                    if ( jQuery.isFunction(callback))
                                    {
                                        callback();
                                    }

                                    // event for clicking a facet
                                    $('#facets li').click(function(event)
                                    {
                                        contents = new Array();
                                        $facet = $(this);
                                        // start spinner
                                        //$input.addClass("processing");
                                        // receiving all object data of the clicked facet for the result elements
                                        $(init.mask.elements).each(function(l)
                                        {
                                            queryFacet = "SELECT DISTINCT ?o WHERE { <" + init.mask.elements[l].subject + "> <" + $facet.attr('name') + ">  ?o}";
                                            window.console.info(queryFacet);
                                            
                                            $(settings.endpoints).each(function(k)
                                            {
                                                if (settings.endpoints[k].enabled)
                                                {
                                                     $.ajax({
                                                        type: "GET",
                                                        url: 'js/proxy.php',
                                                        data: "contentType=xml&endpoint="+endpoints[k].identifier+"&query="+escape(queryFacet),
                                                        success: function(data) 
                                                        {
                                                            $(data).find("binding").each(function()
                                                            {
                                                                $binding = $(this);
                                                                if (contents.length == 0)
                                                                {
                                                                    contents.push($binding.text());
                                                                }
                                                                else
                                                                {
                                                                    var markedForInput;
                                                                    $(contents).each(function(c)
                                                                    {
                                                                        if($binding.text() != contents[c])
                                                                        {
                                                                            markedForInput = true;
                                                                        }
                                                                        else
                                                                        {
                                                                            markedForInput = false;
                                                                            return false;
                                                                        }            
                                                                    });
                                                                    if ( markedForInput )
                                                                    {
                                                                        contents.push($binding.text());
                                                                    }
                                                                }
                                                                facetName=$facet.attr('name');
                                                                
                                                                $("#facetContent").empty();
                                                                $(contents).each(function(c)
                                                                {
                                                                    $("#facetContent").append("<li><input type=\"checkbox\" name=\"" + contents[c].trim() + "\">" + contents[c].trimURI() + "</input></li>");
                                                                });
                                                            });
                                                               
                                                            $("#facetContent input:checkbox").one('click',function()
                                                            {
                                                                    // everytime the user changes the input, clear the results and send the new query
                                                                    init.mask.empty();

                                                                    // do the same for the facets
                                                                    $("#facets").empty();
                                                                    $("#facetContent").empty();
                                                                    init.facets = new Array()
                                                                            
                                                                    if($(this).attr('name').search('://') != -1)
                                                                    {
                                                                        addQuery = "?s <" + $facet.attr('name') + "> <" + $(this).attr('name') + ">. ";
                                                                    }
                                                                    else
                                                                    {
                                                                        addQuery = "?s <" + $facet.attr('name') + "> \"" + $(this).attr('name') + "\". ";
                                                                    }   
                                                                    init.optQuery.push(addQuery)

                                                                    //automatically resending the query
                                                                    buildQuery(init.optQuery,callbacks.startCallback,callbacks.queryCallback);
                                                            });
                                                            //$input.removeClass("processing");
                                                        },
                                                        error: function(err,txt,errt)
                                                        {
                                                            alert("Fehler:" + err + " " + txt + " " + errt);
                                                        }
                                                    });
                                                }
                                            })
                                        })
                                    });
                                    
                                },
                                error: function(err,txt,errt)
                                {
                                  alert("Fehler:" + err + " " + txt + " " + errt);
                                }
                            });
                        }
                    })
                })

                return this;
            }

            

            return this;
        } // END OF CLASS SparqlQuery

/*------------------------------------------------------------------*/

        /**
         * Class for defining an endpoint.
         * @constructor
         * @param {String} identifier the url of the sparql endpoint
         */
        function Endpoint(identifier)
        {
/* ----------------------------------------------------- attributes */
            /**
             * The url of the endpoint
             */
            this.identifier = identifier;

            /**
             * Property whether the endpoint is enabled or not
             */
            this.enabled = true;

/* -------------------------------------------------------- methods */
  
            /**
             * Enables an endpoint.
             */
            this.enable = function()
            {
                this.enabled = true;
            };

            /**
             * Disables an endpoint.
             */
            this.disable = function()
            {
                this.enabled = false;
            };

            /**
             * Function that checks the availablity of an endpoint
             * and sets the enable property.
             *
             * Not implemented yet.
             */
            this.isAvailable = function()
            {
                // Testing the endpoint
                // testQuery = new SparqlQuery("ASK { ?s ?p ?o }",[this]).send()
                return true;
            }

            return this;
        } // END OF CLASS Endpoint

/*------------------------------------------------------------------*/

        /**
         * Class for defining a Mask, where the ResultElements are shown.
         * This class also handles the grouping and sorting functionality.
         * @constructor
         */
        function Mask()
        {
/* ----------------------------------------------------- attributes */
            /**
             * Array of the result elements
             */
            this.elements = new Array();
            
/* ------------------------------------------------- public methods */
            /**
             * This functions adds the resultelements to an array and is displaying 
             * each element in the result section.
             * @param {ResultElement} resEl one ResultElement
             * @param {function} callback resultsOutputCallback
             */
            this.addElement = function(resEl, callback)
            {
                this.elements.push(resEl);
                $("#results").empty();
                init.mask.sort(callbacks.resultsSortCallback);
                if ( jQuery.isFunction(callback))
                {
                    callback();
                }
                else
                {
                    elements = this.elements;
                    $(this.elements).each(function(i)
                    {
                       
                            $("#results").append("<li class=\"resultelement\">\n\
                                <span class=\"resultelementObject\">" + elements[i].object + "</span><br />\
                                <span class=\"resultelementSubject\">" + elements[i].subject + "</span></li>");

                            //  setting the background of the result elements
                            if (i % 2 == 0)
                            {
                                $("#results li:last").addClass("even");
                            }
                            else
                            {
                                $("#results li:last").addClass("odd");
                            }
                    })
                }
            };
            
            /**
             * Function which sorts the result elements in the mask.
             * @param {function} callback resultsSortCallback
             */
            this.sort = function(callback)
            {
                function compare(a,b) {
                    if (a.object < b.object)
                        return -1;
                    if (a.object > b.object)
                        return 1;
                    return 0;
                }
                if ( jQuery.isFunction(callback) )
                {
                    return this.elements.sort(callback);
                }
                else
                {
                    return this.elements.sort(compare);
                }
            };
           
            /**
             * Function which cleares the result pane and the array of result elements.
             */
            this.empty = function()
            {
                this.elements = new Array();
                $("#results").empty();
            };           
        } // END OF CLASS MASK
        
/*------------------------------------------------------------------*/

        /**
         * Class for defining a Resultelement
         * @constructor
         * @param {String} subject defining the subject of a SPARQL triple
         * @param {String} predicate defining the predicate of a SPARQL triple
         * @param {String} object defining the object of a SPARQL triple
         */
        function ResultElement(subject, predicate, object)
        {
/* ----------------------------------------------------- attributes */
            /**
             * The subject of the result triple.
             */
            this.subject = subject;

            /**
             * The predicate of the result triple.
             */
            this.predicate = predicate;

            /**
             * The object of the result triple.
             */
            this.object = object;
        }
        
    }; // END OF PLUGIN PART
})(jQuery);