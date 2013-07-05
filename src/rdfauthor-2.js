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
        domId: 'rdfauthor-view-' + Math.random()
      },
      choreographies: {
        fallback: 'default',
        literal: 'literal',
        resource: 'resource'
      }
    }
    
    /** script is in unknown state */
    var SCRIPT_STATE_UNKNOWN = undefined;
    
    /** script is currently loading */
    var SCRIPT_STATE_LOADING = 1;
    
    /** script is ready */
    var SCRIPT_STATE_READY = 2;
    
    /** root directory of RDFauthor */
    var RDFAUTHOR_BASE = null;
    
    /** visibility of rdfauthor view */
    var RDFAUTHOR_VISIBLE = false;
    
    /** Number of pending scripts */
    var _requirePending = 0;
    
    /** Callbacks to be executed when script loading finishes */
    var _scriptCallbacks = {};
        
    /** Loaded JavaScript URIs */
    var _loadedScripts = {};
    
    /** Loaded stylesheet URIs */
    var _loadedStylesheets = {};
    
    /** current view */
    var _viewHolder = null;
    
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
      
      // jQuery
      if ('undefined' === typeof $) {
        _require(RDFAUTHOR_BASE + 'libs/jquery-1.10.1.js', function() {
          // load Bootstrap if jquery is loaded
          if ('undefined' === typeof $.fn.modal) {
            _require(RDFAUTHOR_BASE + 'libs/bootstrap/js/bootstrap.js');
          }
        });
      }
      
      // create view, set view to _view variable which holds the current view
      _view();
      
    }
    
    function _view(options) {
      switch (_options.view.type) {
        case 'desktop':
          _require(RDFAUTHOR_BASE + 'src/rdfauthor.view.desktop.js', function() {
            _viewHolder = new DesktopView(); 
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
