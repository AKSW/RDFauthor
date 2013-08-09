/**
 * RDFauthor 2
 * @author Clemens Hoffmann <cannelony@gmail.com>
 */
var RDFauthor = (function() {
  
  // global variables
  
  // instance stores a reference to the Singleton
  var instance;
    
  /** handle asynchrony when getInstance is called */
  var RDFAUTHOR_RDY = false;
  /** Callbacks to be executed when RDFauthor is ready */
  var _rdyCallbacks = [];
    
  function init() {
    
    // private
    
    var self = this;
    
    var _options = {
      setup: {
        queryEndpoint: '',
        saveEndpoint: '',
        resourceFile: '',
        openInstantly: true
      },
      strings: {
        title: 'RDFauthor 2.0',
        // edit-mode
        btnCloseChoreography: 'Close choreography',
        btnEeditChoreography: 'Edit choreography',
        btnSave: 'Save',
        // choreography-mode
        btnCancel: 'Cancel',
        btnSaveAllResources: 'Save all resources',
        btnSaveResource: 'Save resource',
        btnSaveChoreography: 'Save choreography'
      },
      view: {
        type: 'desktop',
        fullscreen: false,
        domId: 'rdfauthor-view-' + Math.round(Math.random()*10000)
      },
      choreographies: {
        fallback: 'default',
        literal: 'literal',
        resource: 'resource'
      }
    }
    
    /** Script is in unknown state */
    var SCRIPT_STATE_UNKNOWN = undefined;
    
    /** Script is currently loading */
    var SCRIPT_STATE_LOADING = 1;
    
    /** Script is ready */
    var SCRIPT_STATE_READY = 2;
    
    /** Root directory of RDFauthor */
    var RDFAUTHOR_BASE = null;
    
    /** Widget directory path */
    var RDFAUTHOR_WIDGETS = 'src/widgets/';
    
    /** Choreography directory path */
    var RDFAUTHOR_CHOREOGRAPHIES = 'src/choreographies';
    
    /** Visibility of rdfauthor view */
    var RDFAUTHOR_VISIBLE = false;
    
    /** Number of pending scripts */
    var _requirePending = 0;
    
    /** Callbacks to be executed when script loading finishes */
    var _scriptCallbacks = {};
        
    /** Loaded JavaScript URIs */
    var _loadedScripts = {};
    
    /** Loaded stylesheet URIs */
    var _loadedStylesheets = {};
    
    /** Current view */
    var _viewHolder = null;
    
    /** Widget store */
    var _widgetStore = {
      __datatype__: {},
      __property__: {},
      // fallback widgets if no specific was matched
      __literal__: {},
      __resource__: {},
      widgetInstances: {}
    }
    
    /**
     * Add widget to widget store.
     */
    function _addWidget(uri, hook) {
      
    }
    
    /**
     * Calls its parameter if it is of type funtion.
     * @private
     */
    function _callIfIsFunction(functionSpec, params) {
       if (_isFunction(functionSpec)) {
           var result
               = typeof params === 'undefined'
               ? functionSpec.apply(functionSpec)
               : functionSpec.apply(functionSpec, params);
               ;
           
           return result;
        }
    }
    
    function _calcRDFauthorBase() {
      var scripts = document.getElementsByTagName('script');
      for (var i in scripts) {
        if (typeof scripts[i] !== 'undefined' && scripts[i].getAttribute) {
          var src = scripts[i].getAttribute('src');
          if (src !== null && src.search('rdfauthor-2.js') != -1) {
            var length = src.lastIndexOf('/src/') + 1;
            RDFAUTHOR_BASE = src.substr(0,length);
          }
        }
      }
    }
    
    function _createWidgetStore() {
      // load fallback widgets for literals and resources
      _require(RDFAUTHOR_BASE + RDFAUTHOR_WIDGETS + 'rdfauthor.widget.literal.js', function() {
        // register to widget store
        // TODO: push widget instance here not string
        _widgetStore.widgetInstances['http://aksw.org/Projects/RDFauthor/local#literal'] = 'add instance here';
      });
      _require(RDFAUTHOR_BASE + RDFAUTHOR_WIDGETS + 'rdfauthor.widget.resource.js', function() {
        // register to widget store
        // TODO: push widget instance here not string
        _widgetStore.widgetInstances['http://aksw.org/Projects/RDFauthor/local#resource'] = 'add instance here';
      });
      
      // load widgets who are declared as enabled in RDFAUTHOR_CONFIG (refer: rdfauthor.config.js)
      for (var widget in RDFAUTHOR_CONFIG.widgets) {
        if (RDFAUTHOR_CONFIG.widgets[widget].enabled) {
          var widgetConfig = RDFAUTHOR_CONFIG.widgets[widget];
          var widgetUri = 'http://aksw.org/Projects/RDFauthor‎/local#' + widget;
          _require(RDFAUTHOR_BASE + RDFAUTHOR_WIDGETS + RDFAUTHOR_CONFIG.widgets[widget].src);
          for (var hookType in widgetConfig.hook) {
            console.log(hookType);
            switch (hookType) {
              case 'property':
                console.log('property hook');
                for (var property in widgetConfig.hook[hookType]) {
                  var propertyUri = widgetConfig.hook[hookType][property];
                  if (_widgetStore.__property__[propertyUri]) {
                    _widgetStore.__property__[propertyUri].push(widgetUri);
                  } else {
                    _widgetStore.__property__[propertyUri] = [widgetUri];
                    // TODO: push widget instance here not string
                    _widgetStore.widgetInstances[widgetUri] = 'add instance here';
                  }
                  console.log(_widgetStore);
                }
                break;
              case 'datatype':
                console.log('datatype hook');
                for (var datatype in widgetConfig.hook[hookType]) {
                  var datatypeUri = widgetConfig.hook[hookType][datatype];
                  if (_widgetStore.__datatype__[propertyUri]) {
                    _widgetStore.__datatype__[datatypeUri].push(widgetUri);
                  } else {
                    _widgetStore.__datatype__[datatypeUri] = [widgetUri];
                    // TODO: push widget instance to widgetInstances
                    _widgetStore.widgetInstances[widgetUri] = 'add instance here';
                  }
                  console.log(_widgetStore);
                }
                break;
            }
          }
        }
      }
    }
    
    function _execStoredReadyCallbacks() {
      // execute ready callbacks to return RDFauthor instance
      var storedReadyCallbacks = _rdyCallbacks;
      for (var i in storedReadyCallbacks) {
        // if (typeof storedReadyCallbacks[i] === 'function') {
        if ($.isFunction(storedReadyCallbacks[i])) {
          storedReadyCallbacks[i](instance);
          delete _rdyCallbacks[_rdyCallbacks.indexOf(storedReadyCallbacks[i])];
        }       
      }
    }
    
    function _getRdfStore(callback) {
      // init rdfstore-js
      rdfstore.create({ 
        name: 'rdfauthor', 
        overwrite: false, 
        persistent: true
      }, function(store) {
         store.registerDefaultProfileNamespaces();
        _callIfIsFunction(callback(store));
      });
    }
    
    function _getSubjects(callback) {
      var storedSubjects = {};
      
      _getRdfStore(function(store) {
        var query = 'SELECT ?s ?label WHERE { ?s <' + store.rdf.resolve('foaf:name') + '> ?label }';
        store.execute(query, function(success, result) {
          
          for (var subject in result) {
            storedSubjects[result[subject].s.value] = result[subject].label.value;
          }
          
          _callIfIsFunction(callback(storedSubjects));
        });
      });
    }
        
    function _isArray(arg) {
      if( Object.prototype.toString.call(arg) === '[object Array]' ) {
        return true;
      } else {
        return false;
      }
    }
    
    function _isFunction(arg) {
      if( Object.prototype.toString.call(arg) === '[object Function]' ) {
        return true;
      } else {
        return false;
      }
    }
    
    function _loadResourceIntoStore(resource, callback) {
      _getRdfStore(function(store) {
        store.load('text/turtle', resource.src, function(success, results) {
          store.execute("SELECT *  WHERE { ?s ?p ?o }", function(success, results) {
            console.log(success);
            console.log(results);
            _callIfIsFunction(callback);
          });
        });
      });
    }
    
    function _ready() {
      // set RDFAUTHOR_RDY flag
      RDFAUTHOR_RDY = true;
      // execute stored callbacks of getInstance()
      _execStoredReadyCallbacks();
    }
    
    /**
     * Used internally for script requirements. For each pending script, 
     * a counter is increased and decreased when the script has finished 
     * loading. Readyness is announced when all pending scripts are loaded.
     */
    function _require(scriptURI, callback) {
      _requirePending++;
      _requireJS(scriptURI, function () {
        _callIfIsFunction(callback);
        _requirePending--;
        if (_requirePending == 0) {
          _ready();
        }
      });
    }
    
    /**
     * Loads a JavaScript file by including a <code>&lt;script&gt;</code> tag in the page header.
     * @private
     * @param {string} scriptURI
     * @param {function} function that will be called when the script finished loading (optional)
     */
    function _requireJS(scriptURI, callback) {
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
          if (_isArray(_scriptCallbacks[scriptURI])) {
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
    }
    
    /**
     * Loads a Stylesheet file by including a <code>&lt;script&gt;</code> tag in the page header.
     * @private
     * @param {string} stylesheetURI
     */
    function _requireCSS(stylesheetURI) {
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
    }
      
    function _setup() {
      // set RDFAUTHOR_BASE
      _calcRDFauthorBase();
      
      // load enabled widgets and choreographies
      _require(RDFAUTHOR_BASE + 'src/rdfauthor.config.js', function() {
        console.log(RDFAUTHOR_CONFIG);
        _createWidgetStore();
      });
      
      
      
      // jQuery
      if ('undefined' === typeof $) {
        _require(RDFAUTHOR_BASE + 'libs/jquery-1.10.1.js', function() {
          // load Bootstrap if jquery is loaded
          if ('undefined' === typeof $.fn.modal) {
            _require(RDFAUTHOR_BASE + 'libs/bootstrap/js/bootstrap.js');
            _requireCSS(RDFAUTHOR_BASE + 'libs/bootstrap/css/bootstrap.css', function() {
            // load rdfauthor stylesheet after bootstrap due to overwriting some classes
            _requireCSS(RDFAUTHOR_BASE + 'src/rdfauthor.stylesheet.css');
          });
          }
          // jQuery UI
          // the view will be created when jquery ui is loaded, because it uses parts of jQuery UI
          if (undefined === $.ui) {
              _requireCSS(RDFAUTHOR_BASE + 'libs/jquery-ui/css/ui-lightness/jquery-ui-1.10.3.custom.css');
              _require(RDFAUTHOR_BASE + 'libs/jquery-ui/js/jquery-ui-1.10.3.custom.min.js', function() {
                // create view, set view to _view variable which holds the current view
                _view({
                  domId: _options.view.domId,
                  fullscreen: _options.view.fullscreen
                });
              });
          } else {
            _view({
              domId: _options.view.domId,
              fullscreen: _options.view.fullscreen
            });
          }
          // load rdfstore-js
          _require(RDFAUTHOR_BASE + 'libs/rdfstore-js/rdf_store.js');
          
        });
      } else {
        // load Bootstrap if jquery is loaded
        if ('undefined' === typeof $.fn.modal) {
          _require(RDFAUTHOR_BASE + 'libs/bootstrap/js/bootstrap.js');
          _requireCSS(RDFAUTHOR_BASE + 'libs/bootstrap/css/bootstrap.css', function() {
            // load rdfauthor stylesheet after bootstrap due to overwriting some classes
            _requireCSS(RDFAUTHOR_BASE + 'src/rdfauthor.stylesheet.css');
          });
        }
        // jQuery UI
        // the view will be created when jquery ui is loaded, because it uses parts of jQuery UI
        if (undefined === $.ui) {
            _requireCSS(RDFAUTHOR_BASE + 'libs/jquery-ui/css/ui-lightness/jquery-ui-1.10.3.custom.css');
            _require(RDFAUTHOR_BASE + 'libs/jquery-ui/js/jquery-ui-1.10.3.custom.min.js', function() {
              // create view, set view to _view variable which holds the current view
              _view({
                domId: _options.view.domId,
                fullscreen: _options.view.fullscreen
              });
            });
        } else {
          _view({
            domId: _options.view.domId,
            fullscreen: _options.view.fullscreen
          });
        }
        // load rdfstore-js
        _require(RDFAUTHOR_BASE + 'libs/rdfstore-js/rdf_store.js');
      }
      
      // load stylesheets
      // load rdfauthor stylesheet after bootstrap due to overwriting some classes
      _requireCSS(RDFAUTHOR_BASE + 'src/rdfauthor.stylesheet.css');
      _requireCSS(RDFAUTHOR_BASE + 'libs/font-awesome/css/font-awesome.min.css');
      
    }
    
    function _view(options) {
      switch (_options.view.type) {
        case 'desktop':
          _require(RDFAUTHOR_BASE + 'src/rdfauthor.view.desktop.js', function() {
            _viewHolder = new DesktopView(options);
          });
          break;
      } 
    }
    
    // run setup code
    _setup();
    
    return {
      
      // public
      
      // public property
      version: 0.1,
      
      // public methods 
      
      addResource: function(resource) {
        _loadResourceIntoStore(resource, function() {
          _getSubjects(function(storedSubjects) {
            console.log(storedSubjects);
            _viewHolder.addTabs(storedSubjects);
          });
        });
      },
      
      getOptions: function() {
        return _options;
      },
      
      ready: function() {
        _execStoredReadyCallbacks();
      },
      
      setOptions: function(options) {
        _options = $.extend({}, _options, options);
      },
      
      show: function() {
        if (RDFAUTHOR_RDY) {
          if (!RDFAUTHOR_VISIBLE) {
            RDFAUTHOR_VISIBLE = true;
            _viewHolder.show();
          } else {
            console.log('RDFauthor is already visible.');
          }
        } else {
          console.error('RDFauthor is not ready.');
        }
      },
      
      view: function() {
        return _viewHolder;
      }
      
    }

  } // end init
  
  return {
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function(callback) {
      
      _rdyCallbacks.push(callback);
      
      if (!instance) {
        instance = init();
      }
      
      if (RDFAUTHOR_RDY) {
        instance.ready();
      }
    }
  }
  
})();
