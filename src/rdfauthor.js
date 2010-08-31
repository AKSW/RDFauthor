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
    var UPDATE_NS = 'http://ns.aksw.org/update/';
    
    /** RDF namespace */
    var RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    
    /** RDFS namespace */
    var RDFS_NS = 'http://www.w3.org/2000/01/rdf-schema#';
    
    /** OWL namespace */
    var OWL_NS = 'http://www.w3.org/2002/07/owl#';
    
    /** Default generic hook name */
    var DEFAULT_HOOK = '__DEFAULT__';
    
    /** Default hook name for objects */
    var OBJECT_HOOK  = '__OBJECT__';
    
    /** Default hook name for literals */
    var LITERAL_HOOK = '__LITERAL__';
    
    /** Prefix for ad-hoc IDs */
    var ELEMENT_ID_PREFIX = 'el-';
    
    /** script is in unknown state */
    var SCRIPT_STATE_UNKNOWN = undefined;
    
    /** script is currently loading */
    var SCRIPT_STATE_LOADING = 1;
    
    /** script is ready */
    var SCRIPT_STATE_READY   = 2;
    
    /** Databanks indexed by graph URI. */
    var _databanksByGraph = {};
    
    /**
     * Object to hold statements treated in a special way.
     * Those are essentially protected and hidden statements.
     * Explicit statements have been added to the view manually (as opposed to 
     * by parsing) and will be sent to sources even if not changed.
     * Hidden statements are not shown in the view and can thus not be edited 
     * by the user.
     */
    var _specialStatements = {
        'explicit': [], 
        'hidden': []
    };
    
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
    
    /** Mapping of info shortcuts to predicate URIs. */
    var _infoShortcuts = {};
    
    /** Info predicates */
    var _infoPredicates = {};
    
    /** Denotes whether the page has been parsed */
    var _pageParsed = false;
    
    /** Predicate info */
    var _predicateInfo = null;
    
    /**  Callbacks to be executed when script loading finishes */
    var _scriptCallbacks = {};
    
    /** Loaded JavaScript URIs */
    var _loadedScripts = {};
    
    /** Loaded stylesheet URIs */
    var _loadedStylesheets = {};
    
    /** Statements index by element id */
    var _statementsByElemendID = {};
    
    /** View instance */
    var _view = null;
    
    /** Number of pending scripts */
    var _requirePending = 0;
    
    /** Default options */
    var _options = {
        title: 'Title', 
        saveButtonTitle: 'saveButtonTitle', 
        cancelButtonTitle: 'cancelButtonTitle', 
        showButtons: true, 
        useAnimations: true, 
        autoParse: true, 
        usePredicateInfo: true, 
        useSPARQL11: true
    };
    
    /** Hash registered widgets */
    var _registeredWidgets = {
        '__LITERAL__':  {},
        '__OBJECT__': {}, 
        '__DEFAULT__': {}, 
        '__DEBUG__': {}, 
        'resource':   {}, 
        'property':   {}, 
        'range':      {}, 
        'datatype':   {}
    };
    
    /**
     * Adds a predicate that is queried for
     * @private
     */
    function _addInfoPredicate(infoPredicateURI, shortcut) {
        _infoPredicates[infoPredicateURI] = {};
        if (arguments.length > 1) {
            _infoShortcuts[shortcut] = infoPredicateURI;
        }
    }
    
    /**
     * Adds a new RDFA triple
     * @private
     */
    function _addTriple(element, triple, graph) {
        if (undefined !== triple) {
            var statement;
            /* blank graph means page graph */
            if (graph instanceof RDFBlankNode) {
                graph = _pageGraph();
            }
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
                    if (_options.autoParse) {
                        RDFauthor.addStatement(statement, element);
                    }
                }
            }
        }
    }
    
    /**
     * Adds a special statement to the store with name given.
     * @private
     */
    function _addSpecialStatement(statement, specialSpec) {
        var graphURI = statement.graphURI() || this.defaultGraphURI();
        if (specialSpec in _specialStatements) {
            if (!(graphURI in _specialStatements[specialSpec])) {
                _specialStatements[specialSpec][graphURI] = [];
            }
            
            _specialStatements[specialSpec][graphURI].push(statement);
        } else {
            // error
        }
    }
    
    /**
     * Adds special statements for graph denoted by graphURI to the databank given.
     * @private
     */
    function _insertSpecialStatements(databank, graphURI) {
        for (var specialSpec in _specialStatements) {
            for (var i = 0; i < _specialStatements[specialSpec].length; i++) {
                var currentStatement = _specialStatements[specialSpec][i];
                // only add complete statements
                if (currentStatement.hasObject()) {
                    databank.add(currentStatement.asRdfQueryTriple());
                }
            }
        }
    }
    
    /**
     * Calls its parameter if it is of type funtion.
     * @private
     */
    function _callIfIsFunction(functionSpec) {
        if (jQuery.isFunction(functionSpec)) {
            functionSpec();
        }
    }
    
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
                
                databank.triples().each(function() {
                    if (this instanceof jQuery.rdf.triple 
                        && this.object instanceof jQuery.rdf.literal
                        && (typeof this.object.value == 'string')) {
                        /* HACK: reverse HTML escaping in literals */
                        this.object.value = this.object.value.replace(/&lt;/, '<').replace(/&gt;/, '>');
                    }
                    
                    // FIXME: rdfQuery no-object hack
                    if (this.object.value == 'undefined') {
                        databank.remove(this);
                    } else {
                        extracted.add(this);
                    }
                });
                
                /* store original as extracted */
                _extractedByGraph[g] = extracted;
            } else {
                /* create new empty databank */
                _extractedByGraph[g] = jQuery.rdf.databank();
            }
            
            /* FIXME: explicit triples hack */
            if (g in _specialStatements['explicit']) {
                for (var i = 0; i < _specialStatements['explicit'][g].length; i++) {
                    var specialStatement = _specialStatements['explicit'][g][i];
                    _extractedByGraph[g].remove(specialStatement.asRdfQueryTriple());
                }
            }
            
            /* FIXME: hidden triples hack */
            if (g in _specialStatements['hidden']) {
                for (var i = 0; i < _specialStatements['hidden'][g].length; i++) {
                    var specialStatement = _specialStatements['hidden'][g][i];
                    databank.add(specialStatement.asRdfQueryTriple());
                }
            }
        }
    };
    
    /**
     * Creates a new widget base object ensuring it uses the abstract 
     * Widget as its prototype object.
     * @return {Object}
     */
    function _createWidget(widgetSpec) {        
        var F = function () {};
        F.prototype = Widget;
        
        var W = function (statement, options) {
            this.ID = RDFauthor.nextID();
            this.statement = statement;
            
            // widget has options
            if (arguments.length >= 2) {
                this.options = jQuery.extend(this.options, options);
            }
        };
        W.prototype = jQuery.extend(new F(), widgetSpec);
        W.prototype.constructor = W;
        
        return W;
    };
    
    /**
     * Loads info predicates for all predicates
     * @private
     */ 
    function _fetchPredicateInfo(callback) {        
        if (null === _predicateInfo) {
            if (_options.usePredicateInfo) {
                var selects  = '';
                var filters  = [];
                var patterns = [];

                for (infoPredicateURI in _infoPredicates) {
                    var variableName = _shortcutForInfoPredicate(infoPredicateURI);
                    selects += (' ?' + variableName);
                    filters.push('sameTerm(?predicate, <' + infoPredicateURI + '>)');
                    patterns.push('{?predicate <' + infoPredicateURI + '> ?' + variableName + ' . }');
                }
                /* init */
                _predicateInfo = {};

                /* query */
                if (patterns.length > 0) {
                    var query = '\
                        SELECT DISTINCT ?predicate ' + selects + '\
                        WHERE {' + patterns.join(' UNION ') + ' FILTER(' + filters.join(' || ') + ')}';
                    // query = query.replace(/\s+/g, ' ');

                    // use first graph w/ update info for now
                    var graph;
                    for (var g in _graphInfo) {
                        if (undefined !== RDFauthor.serviceURIForGraph(g)) {
                            graph = g;
                            break;
                        }
                    }

                    // fallback to default graph
                    if (undefined === graph) {
                        graph = RDFauthor.defaultGraphURI();
                    }

                    /* TODO: for each graph */
                    try {
                        RDFauthor.queryGraph(graph, query, {
                            callbackSuccess: function(result) {
                                if (result['results'] && result['results']['bindings']) {
                                    for (var r in result['results']['bindings']) {
                                        /* build  */
                                        var predicate, infoPredicate, infoValue;
                                        for (var current in result['results']['bindings'][r]) {
                                            switch (current) {
                                                case 'predicate': 
                                                    predicate = result['results']['bindings'][r][current].value;
                                                    break;
                                                default:
                                                    infoPredicate = _infoShortcuts[current];
                                                    infoValue     = result['results']['bindings'][r][current].value;
                                            }
                                        }

                                        /* build info structure */
                                        if (undefined === _predicateInfo[predicate]) {
                                            _predicateInfo[predicate] = {};
                                        }
                                        if (undefined === _predicateInfo[predicate][infoPredicate]) {
                                            _predicateInfo[predicate][infoPredicate] = [];
                                        }
                                        _predicateInfo[predicate][infoPredicate].push(infoValue);
                                    }
                                }

                                _callIfIsFunction(callback);
                            }, 
                            async: false
                        })
                    } catch (e) {
                        // TODO: 
                        _callIfIsFunction(callback);
                    }
                }
            } else {
                _predicateInfo = {};
                _callIfIsFunction(callback);
            }
        } else {
            _callIfIsFunction(callback);
        }
    }
    
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
    function _instantiateWidget(constructor, statement, options) {
        if (typeof constructor === 'function') {
            if (arguments.length >= 3) {
                return new constructor(statement, options);
            } else {
                return new constructor(statement);
            }
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
        if (_loadedScripts[scriptURI] === SCRIPT_STATE_UNKNOWN) {
            // load script
            var s  = document.createElement('script');
            s.type = 'text/javascript';
            s.src  = scriptURI;
            
            // callback handler fro loaded scripts
            var _scriptReady = function () {
                // now its ready
                _loadedScripts[scriptURI] = SCRIPT_STATE_READY;

                // script is ready, call all callbacks
                if (jQuery.isArray(_scriptCallbacks[scriptURI])) {
                    var callbacks = _scriptCallbacks[scriptURI];
                    for (var i = 0, max = callbacks.length; i < max; i++) {
                        callbacks[i]();
                    }
                    _scriptCallbacks[scriptURI] = [];
                }
            }
            
            // set callback handler
            if (s.all) {
                s.onreadystatechange = function () {
                    if (this.readyState === 'loaded' || this.readyState === 'complete') {
                        _scriptReady();
                    }
                }
            } else {
                // works: Safari, Chrome, Firefox
                s.onload = _scriptReady;
            }
            
            // init callback store
            _scriptCallbacks[scriptURI] = [];
            // store callback if it is a function
            if (arguments.length >= 2 && typeof callback == 'function') {
                _scriptCallbacks[scriptURI].push(callback);
            }
            
            document.getElementsByTagName('head')[0].appendChild(s);
            
            // set script to loading
            _loadedScripts[scriptURI] = SCRIPT_STATE_LOADING;
        } else if (_loadedScripts[scriptURI] === SCRIPT_STATE_LOADING) {
            // script has been added, but still loading
            // add callback to script's ready callback list
            _scriptCallbacks[scriptURI].push(callback);
        } else if (_loadedScripts[scriptURI] === SCRIPT_STATE_READY) {
            // script is ready, execute callback immediately
            _callIfIsFunction(callback);
        }
    };
    
    /**
     * Loads a Stylesheet file by including a <code>&lt;script&gt;</code> tag in the page header.
     * @private
     * @param {string} stylesheetURI
     */
    function _loadStylesheet(stylesheetURI) {
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
         var id = jQuery(element).attr('id');
         if (undefined === id) {
             id = RDFauthor.nextID(ELEMENT_ID_PREFIX);
             jQuery(element).attr('id', id);
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
    function _parse(callback) {        
        if (!_pageParsed) {
            // set parsing callback
            RDFA.CALLBACK_DONE_PARSING = function () {
                _pageParsed = true;
                _callIfIsFunction(callback);
            };
            // parse
            RDFA.parse();
        } else {
            // already parsed, execute callback immediately
            _callIfIsFunction(callback);
        }
    };
    
    /**
     * Parses a URL string and returns an object similar to the internal Location object.
     * based on http://blog.stevenlevithan.com/archives/parseuri
     * @private
     */
    function _parseURL(str) {
        var o = {
        	strictMode: false, 
        	key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'hostname', 
        	      'port', 'relative', 'path', 'directory', 'file','query','anchor'],
        	q: {
        	    name:   'queryKey',
        	    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        	},
        	parser: {
        		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        	}
        };
        
        var	m   = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str), 
    		uri = {}, 
    		i   = 14;

    	while (i--) {
    	    uri[o.key[i]] = m[i] || '';
    	}
    	
    	uri[o.q.name] = {};
    	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    		if ($1) {
    		    uri[o.q.name][$1] = $2;
    		}
    	});
    	
    	return uri;
    };
    
    /**
     * Populates the given view with statements.
     * @private
     */
    function _populateView(view) {
        if (arguments.length == 0) {
            view = RDFauthor.getView();
        }
        view.reset();
        
        /* make sure, view has predicate info available */
        _fetchPredicateInfo(function() {
            for (var graph in _databanksByGraph) {
                var updateEndpoint = RDFauthor.updateURIForGraph(graph);
                if (undefined !== updateEndpoint) {
                    var triples = _databanksByGraph[graph].triples();
                    for (var i = 0, length = triples.length; i < length; i++) {
                        // init statement
                        var statement = new Statement(triples[i], {'graph': graph});
                        view.addWidget(statement);
                    }
                }
            }
        });
    };
    
    /**
     * Called when RDFauthor is ready loading all its dependencies
     */
    function _ready() {
        if (typeof RDFAUTHOR_READY_CALLBACK !== 'undefined') {
            RDFAUTHOR_READY_CALLBACK();
        }
    };
    
    /**
     * Used internally for script requirements. For each pending script, 
     * a counter is increased and decreased when the script has finished 
     * loading. Readyness is announced when all pending scripts are loaded.
     */
    function _require(scriptURI, callback) {
        _requirePending++;
        _loadScript(scriptURI, function () {
            _callIfIsFunction(callback);
            _requirePending--;
            if (_requirePending == 0) {
                _ready();
            }
        });
    }
    
    /**
     * Returns the shortcut registered for the info predicate or
     * creates and registers a new one if none had been registered before.
     * @private
     */
    function _shortcutForInfoPredicate(infoPredicateURI) {
        var count = 1
        for (var shortcut in _infoShortcuts) {
            if (_infoShortcuts[shortcut] === infoPredicateURI) {
                return shortcut;
            }
            count++;
        }
        
        /* not found, create new one */
        shortcut = 'info' + count;
        _infoShortcuts[shortcut] = infoPredicateURI;
        
        return shortcut;
    }
    
    /**
     * Shows the property editing view, creating it if necessary.
     * @private
     */
    function _showView() {
        /* make sure, view has predicate info available */
        _fetchPredicateInfo(function() {
            var view = RDFauthor.getView();
            view.show(true);
        });
    };
    
    /**
     * Updates all sources via SPARQL/Update
     * @private
     */
    function _updateSources() {
        for (g in _graphInfo) {
            var updateURI = RDFauthor.updateURIForGraph(g);
            var databank  = RDFauthor.databankForGraph(g);
            var original  = _extractedByGraph[g];
            
            if (undefined !== updateURI && undefined !== databank) {
                var added   = databank.except(original);
                var removed = original.except(databank);
                
                _insertSpecialStatements(added, g);
                
                if (_options.useSPARQL11) {
                    // SPARQL/Update
                    var updateQuery = '';
                    
                    var addedArray = jQuery.makeArray(added.triples());
                    if (addedArray.length > 0) {
                        updateQuery += '\nINSERT DATA INTO <' + g + '> {' + addedArray.join('\n') + '}';
                    }
                    
                    var removedArray = jQuery.makeArray(removed.triples());
                    if (removedArray.length > 0) {
                        updateQuery += '\nDELETE DATA FROM <' + g + '> {' + removedArray.join('\n') + '}';
                    }
                    
                    jQuery.get(updateURI, {
                        'query': updateQuery
                    }, function () {
                        _view.hide(true);
                        _callIfIsFunction(_options.onSubmitSuccess);
                    });
                } else {
                    // REST style
                    var addedJSON = jQuery.rdf.dump(added.triples(), {format: 'application/json'});
                    var removedJSON = jQuery.rdf.dump(removed.triples(), {format: 'application/json'});
                    
                    if (addedJSON || removedJSON) {
                        // x-domain request sending works w/ $.get only
                        jQuery.get(updateURI, {
                            'named-graph-uri': g, 
                            'insert': jQuery.toJSON(addedJSON ? addedJSON : {}), 
                            'delete': jQuery.toJSON(removedJSON ? removedJSON : {})
                        }, function () {
                            _view.hide(true);
                            _callIfIsFunction(_options.onSubmitSuccess);
                        });
                    }
                }
            }
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
    
    // rdfQuery
    if (undefined === jQuery.rdf) {
        _require(RDFAUTHOR_BASE + 'libraries/jquery.rdfquery.core.js');
    }
    
    // toJSON
    if (undefined === jQuery.toJSON) {
        _require(RDFAUTHOR_BASE + 'libraries/jquery.json.js');
    }
    
    // load required scripts
    _requirePending++;
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.statement.js');    /* Statement */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.predicaterow.js'); /* Predicate Row */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.selector.js');     /* Property selector */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.subjectgroup.js'); /* Subject Group */
    _require(RDFAUTHOR_BASE + 'src/rdfauthor.view.js');         /* View */
    _require(__RDFA_BASE + 'rdfa.js');                          /* RDFA */
    
    // load widgets; widget prototype is required before all other widgets
    _require(RDFAUTHOR_BASE + 'src/widget.prototype.js', function () {
        _require(RDFAUTHOR_BASE + 'src/widget.literal.js');
        _require(RDFAUTHOR_BASE + 'src/widget.resource.js');
        /* _require(RDFAUTHOR_BASE + 'src/widget.alida.js'); */
        _require(RDFAUTHOR_BASE + 'src/widget.meta.js');
        _require(RDFAUTHOR_BASE + 'src/widget.xmlliteral.js');
        _require(RDFAUTHOR_BASE + 'src/widget.date.js');
        _require(RDFAUTHOR_BASE + 'src/widget.mailto.js');
        _require(RDFAUTHOR_BASE + 'src/widget.tel.js');
        _requirePending--;
    });
    
    // load stylesheets
    _loadStylesheet(RDFAUTHOR_BASE + 'src/rdfauthor.css');
    
    // default info predicates
    _addInfoPredicate(RDF_NS + 'type', 'type');
    _addInfoPredicate(RDFS_NS + 'range', 'range');
    _addInfoPredicate(RDFS_NS + 'label', 'label');
    
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
            if (statement.isHidden()) {
                _addSpecialStatement(statement, 'hidden');
            } else {
                var graphURI = statement.graphURI() || this.defaultGraphURI();
                var databank = this.databankForGraph(graphURI);
                
                databank.add(statement.asRdfQueryTriple());
                
                // explicit statements are editable
                if (statement.isProtected()) {
                    _addSpecialStatement(statement, 'explicit');
                }
                
                // make editable
                if (arguments.length > 1) {
                    _makeElementEditable(element, statement);
                }
            }
        }, 
        
        /**
         * Cancels the editing process.
         */
        cancel: function () {
            /* 
             * TODO:
             * - inform/dismiss view
             * - restore state (parsed or unparsed?)
             */
             var view = RDFauthor.getView();
             view.hide(true);
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
        
        debug: function (privateFuncSpec, parameters) {
            this.call(privateFuncSpec, parameters);
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
         * Returns the current view instance
         */
        getView: function () {
            if (null === _view) {
                if (jQuery('.modal-wrapper').length < 1) {
                    jQuery('body').append('<div class="modal-wrapper" style="display:none"></div>');
                }
                                
                var self = this;
                var options = jQuery.extend(_options, {
                    onBeforeSubmit: function () {
                        // keep db before changes
                        _cloneDatabanks();
                    }, 
                    onAfterSubmit: function () {
                        _updateSources();
                    }, 
                    onAfterCancel: function () {
                        RDFauthor.cancel();
                        if (typeof _options.onCancel == 'function') {
                            _options.onCancel();
                        }
                    }, 
                    container: _options.container ? _options.container : jQuery('.modal-wrapper').eq(0)
                });
                
                // init view
                _view = new View(options);
            }
            
            return _view;
        }, 
        
        /**
         * Returns an instance of the widget that has been registered for <code>hookName</code> and <code>hookValue</code>.
         * @param {string} hookName
         * @param {mixed} hookValue
         * @param {Statement} statement The statement with which to initialize the widget
         * @return {Widget} An object conforming to the Widget interface
         */
        getWidgetForHook: function (hookName, hookValue, statement, options) {
            if (!hookValue) {
                hookValue = '';
            }
            var widgetConstructor = _registeredWidgets[hookName][hookValue];
            
            /* initialize widget */
            return _instantiateWidget(widgetConstructor, statement, options);
        }, 
        
        /**
         * Returns an instance of the widget most suitable for editing statement.
         * @param {Statement} statement
         */
        getWidgetForStatement: function (statement, options) {
            var widgetConstructor = null;
            
            var subjectURI   = statement.subjectURI();
            var predicateURI = statement.predicateURI();
            var datatypeURI  = statement.hasObject() ? statement.objectDatatype() : null;
            var ranges       = this.infoForPredicate(predicateURI, 'range');
            var types        = this.infoForPredicate(predicateURI, 'type');
            
            // local widget selection
            if (subjectURI in _registeredWidgets.resource) {
                widgetConstructor = _registeredWidgets.resource[subjectURI];
            } else if (predicateURI in _registeredWidgets.property) {
                widgetConstructor = _registeredWidgets.property[predicateURI];
            } else if (ranges[0] in _registeredWidgets.range) {
                widgetConstructor = _registeredWidgets.range[ranges[0]];
            } else if (datatypeURI in _registeredWidgets.datatype) {
                widgetConstructor = _registeredWidgets.datatype[datatypeURI];
            }
            
            // try property axioms (property type, property range)
            if (null === widgetConstructor) {
                if ((jQuery.inArray(OWL_NS + 'DatatypeProperty', types) >= 0) 
                    || (jQuery.inArray(RDFS_NS + 'Literal', ranges) >= 0)) {
                    
                    widgetConstructor = _registeredWidgets[LITERAL_HOOK][''];
                } else if ((jQuery.inArray(OWL_NS + 'ObjectProperty', types) >= 0)
                    || (jQuery.inArray(RDFS_NS + 'Resource', ranges) >= 0)) {
                    
                    widgetConstructor = _registeredWidgets[OBJECT_HOOK][''];
                }
            }
            
            // fallback to default widgets
            if (null === widgetConstructor) {
                if (statement.hasObject()) {
                    var ot = statement.objectType();
                    if (ot == 'literal') {
                        widgetConstructor = _registeredWidgets[LITERAL_HOOK][''];
                    } else {
                        widgetConstructor = _registeredWidgets[OBJECT_HOOK][''];
                    }
                } else {
                    widgetConstructor = _registeredWidgets[DEFAULT_HOOK][''];
                }
            }
            
            /* initialize widget */
            return _instantiateWidget(widgetConstructor, statement, options);
        },
        
        /**
         * Returns info predicate values for the predicate given by predicateURI.
         * An array is alsways return, even if there is only one value in it.
         * @param {string} predicateURI
         * @param {string} infoSpec
         * @return {Array}
         */
        infoForPredicate: function (predicateURI, infoSpec) {
            // predicate info not yet loaded
            if (null !== _predicateInfo) {
                if (undefined !== _infoShortcuts[infoSpec]) {
                    infoSpec = _infoShortcuts[infoSpec];
                }

                if ((undefined !== _predicateInfo[predicateURI]) && (undefined !== _predicateInfo[predicateURI][infoSpec])) {
                    return _predicateInfo[predicateURI][infoSpec];
                }
            }
            
            return [];
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
            _loadStylesheet(stylesheetURI);
        },
        
        namespaces: function () {
            return {
                'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 
                'rdfs': 'http://www.w3.org/2000/01/rdf-schema#', 
                'owl': 'http://www.w3.org/2002/07/owl#', 
                'xsd': 'http://www.w3.org/2001/XMLSchema#'
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
         * @param {object} options An object with optional parameters. The following key are recognized:
         *  <ul>
         *    <li>{function} <code>callbackSuccess</code> Function to be called when the query 
         *        was executed sucessfully (implies asynchronous = true). The function 
         *        should accept one parameter which is a 
         *        <a href="http://www.w3.org/TR/rdf-sparql-json-res/">SPARQL Results JSON</a> object.</li>
         *    <li>{function} <code>callbackError</code> Function to be called if an error occurs.</li>
         *    <li>{boolean} <code>async</code> Function to be called if an error occurs. If false, the 
         *        query result will be returned. Otherwise, callbackSuccess must be supplied and will be called.</li>
         *    <li>{string} <code>sparqlEndpoint</code> The URI for the SPARQL endpoint to be used.</li>
         *  </ul>  
         * @throws An exception if the graph queried has no associated SPARQL endpoint.
         */
        queryGraph: function (graphURI, query, options) {
            var defaults = {
                callbackSuccess: null, 
                callbackError: null, 
                async: true, 
                sparqlEndpoint: null 
            };
            var o = jQuery.extend(defaults, options);
            
            var serviceURI = o.sparqlEndpoint ? o.sparqlEndpoint : this.serviceURIForGraph(graphURI);
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
                async: o.async, 
                /* request application/sparql-results+json */
                beforeSend: function (XMLHTTPRequest) {XMLHTTPRequest.setRequestHeader('Accept', 'application/sparql-results+json');}
            };
            
            /* Success callback */
            if (typeof o.callbackSuccess == 'function') {
                ajaxOptions.success = function (data, status) {o.callbackSuccess(data);}
            }
            
            /* Error callback */
            if (typeof o.callbackError == 'function') {
                ajaxOptions.error = function (request, status, error) {o.callbackError(status, error);}
            }
            
            var serviceLocation = _parseURL(serviceURI);
            var currentLocation = window.location;
            
            /* 
             * Check whether JSONp is necessary 
             * http://en.wikipedia.org/wiki/Same_origin_policy#Origin_determination_rules
             */
            if (!(currentLocation.protocol.replace(':', '') === serviceLocation.protocol && 
                currentLocation.hostname === serviceLocation.hostname /*&&
                currentLocation.port     === serviceLocation.port*/)) {
                
                /* not same origin, use JSONp and modify ajax options accordingly */
                var JSONpOptions = {
                    dataType: 'jsonp', 
                    callbackParameter: 'callback'
                }
                jQuery.extend(ajaxOptions, JSONpOptions);
            }
            
            jQuery.ajax(ajaxOptions);
        },
        
        /**
         * Registers a predicate to automatically be queried for all predicates.
         * Widgets will be provided with values of these predicates on request.
         * @param {string} infoPredicateURI The URI of the info predicate.
         * @param {string} infoSpec Short name for the info predicate (optional).
         * @throws An exception if shortcut has already been registered .
         */
        registerInfoPredicate: function (infoPredicateURI, shortcut) {
            if ((arguments.length > 1) && (undefined !== _infoShortcuts[shortcut])) {
                throw 'Shortcut has already been registered.';
            }
            
            _addInfoPredicate(infoPredicateURI, shortcut);
        },
        
        /**
         * Registers a new widget type.
         * @param {object} widgetObject An object conforming the the widget specification.
         * @param {object} widgetSpec An object with the following keys:
         *  <ul>
         *  <li><code>widgetSpec</code> One of <code>resource</code>, <code>property</code>, <code>range</code>, 
         *                            <code>datatype</code></li>
         *  <li><code>hookSpec</code> An array of possible values for hookName that trigger the widget</li>
         *  </ul>
         */
        registerWidget: function (widgetSpec, hooks) {
            // Check interface conformance
            // if (!_checkInterface(widgetSpec, Widget)) {
            //     throw "Registered object does not conform to 'Widget' interface.";
            // }
            
            // ensure array
            if (!jQuery.isArray(hooks)) {
                hooks = [hooks];
            }
            
            for (var i = 0, max = hooks.length; i < max; i++) {
                // the default hook value is an empty string (any value)
                var hookSpec = jQuery.extend({values: ['']}, hooks[i]);
                
                // is the hook supported for which the widget attemps to register?
                if (_registeredWidgets[hookSpec.name]) {
                    // Register for all hook values
                    for (var i = 0; i < hookSpec.values.length; i++) {
                        var value = hookSpec.values[i];
                        if (!_registeredWidgets[hookSpec.name][value]) {
                            _registeredWidgets[hookSpec.name][value] = _createWidget(widgetSpec);
                        }
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
            if (graphURI && graphURI in _graphInfo) {
                return _graphInfo[graphURI].queryEndpoint;
            }
            
            return undefined;
        }, 
        
        /**
         * Sets the infor predicates for the graph denoted by graphURI.
         * Currently the info keys 'queryEndpoint' and 'updateEndpoint' 
         * (both pointing to a URI) are recodgnized.
         */
        setInfoForGraph: function (graphURI, infoSpec, infoValue) {
            if (!(graphURI in _graphInfo)) {
                _graphInfo[graphURI] = {};
            }
            
            _graphInfo[graphURI][infoSpec] = infoValue;
        }, 
        
        /**
         * Returns the SPARQL query service URI for graph denoted by graphURI.
         * @param {string} graphURI
         * @return {string}
         */
        updateURIForGraph: function (graphURI) {
            if (graphURI && graphURI in _graphInfo) {
                return _graphInfo[graphURI].updateEndpoint;
            }
            
            return undefined;
        },
        
        /**
         * Sets RDFauthor options
         * @param {object} optionSpec
         */
        setOptions: function (optionSpec) {
            _options = jQuery.extend(_options, optionSpec);
        }, 
        
        /**
         * Starts editing the current page. If root defines a valid DOM element, only
         * those triples that where extracted from root or its children are beeing edited.
         * @param {HTMLElement} root
         */
        start: function (root) {
            this.eventTarget().trigger('rdfauthor.start');
            /* parse */
            _parse(function() {
                /* display view */
                _populateView();
                _showView();
            });            
            // if (_options.autoParse) {
            //     var that = this;
            //     /* parse */
            //     _parse(function() {
            //         /* display view */
            //         _populateView();
            //         _showView();
            //     });
            // } else {
            //     /* auto-parsing off, statements were added manually */
            //     _populateView();
            //     _showView();
            // }
        }
    }
})();
