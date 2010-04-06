/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * Constructs a PredicateRow object that manages a number of widgets sharing 
 * same subject and predicate.
 *
 * @param {string} subjectURI
 * @param {string} predicateURI
 * @param {string} title
 * @param {HTMLElement|jQuery} container
 * @param {string|number} id Used for creating the CSS id
 *
 * @constructor
 * @requires RDFauthor
 */
function PredicateRow(subjectURI, predicateURI, title, container, id) {
    this._subjectURI        = subjectURI;                   // subject for this row
    this._predicateURI      = predicateURI;                 // the property this row operates on
    this._title             = title;                        // the human-readable string representing the property
    this._container         = container instanceof jQuery   // jQuery-wrapped container DOM element
                            ? container 
                            : $(container);
                            
    this._idPrefix          = 'property-row-'   // CSS id prefix
    this._id                = id;               // id for this row
    this._widgetIDPrefix    = 'widget-';        // CSS id prefix for widgets
    this._widgetCount       = 0;                // nbumber of widgets
    this._widgets           = {};               // widget hash map
    this._widgetIndicesByID = {};               // widgets indexed by id
    
    var instance = this;
    
    // local method that returns the basic HTML code for the row
    function getChrome() {
        var html = '\
            <div class="property-row" id="' + instance.cssID() + '">\
                <fieldset>\
                    <legend>' + instance._title + '</legend>\
                </fieldset>\
            </div>';
        
        return html;
    }
    
    // append chrome
    this._container.append(getChrome());
    
    // returns the widget HTML + widget chrome
    function getWidgetChrome(widgetID, widgetHTML) {
        var overrideID = RDFauthor.nextID();
        var html = '\
            <div class="widget" id="' + instance._widgetIDPrefix + widgetID + '">\
                <div class="container actions right">\
                    <a class="delete-button" title="Remove widget and data."></a>\
                    <a class="add-button" title="Add another widget of the same type."></a>\
                </div>\
                <div class="container actions right">\
                    <div class="widget-override" id="widget-override-' + overrideID + '" style="display:block">\
                        <select name="widget-override-' + overrideID + '" title="Override widget selection">\
                            <option selected="selected">Literal</option>\
                            <option>Resource</option>\
                            <option>Date</option>\
                        </select>\
                    </div>\
                </div>\
                ' + widgetHTML + '\
                <hr style="clear:both;height:0;border:none" />\
            </div>';
        
        return html;
    };
    
    // Returns the next widget's index
    function nextWidgetIndex() {
        return instance._widgetCount++;
    }
    
    /**
     * Adds a new widget to this property row object.
     * @param {Statement} statement
     * @param {function} constructor The widget's constructor function (optional)
     */
    this.addWidget = function (statement, constructor) {
        var widgetInstance = null;
        
        // instantiate widget
        if ((constructor != undefined) && (typeof constructor == 'function')) {
            widgetInstance = new constructor(statement);
        } else {
            widgetInstance = RDFauthor.getWidgetByStatement(statement);
        }
        
        // no widget found
        if (null === widgetInstance) {
            throw 'No suitable widget found.';
        }
        
        var widgetID   = RDFauthor.nextID();
        var widgetHTML = getWidgetChrome(widgetID, widgetInstance.getHTML());
        var widgetIdx  = nextWidgetIndex();
        
        // store widget-id widgetIdx mapping
        this._widgets[widgetIdx] = widgetInstance;
        this._widgetIndicesByID[widgetID] = widgetIdx;
        
        // make sure, PredicateRow is visible
        if ($('#' + this.cssID()).children('fieldset').children('.widget').length > 0) {
            $('#' + this.cssID()).show();
        }
        
        // append HTML
        $('#' + this._idPrefix + this._id).children('fieldset').append(widgetHTML);
        
        // initialize widget
        widgetInstance.init();
        
        return this._widgetIDPrefix + widgetID;
    }
}

PredicateRow.prototype = {
    /**
     * Denotes whether DOM events have been attached.
     */
    eventsAttached: false, 
    
    /**
     * Attaches DOM events for this property row.
     * @todo
     */
    attachEvents: function () {
        if (!this.eventsAttached) {
            // TODO: attach events
            
            this.eventsAttached = true;
        }
    }, 
    
    /**
     * Returns the CSS id for this property row.
     * @return {string}
     */
    cssID: function () {
        return this._idPrefix + this._id;
    },
    
    /**
     * Returns the widet instance for an index
     * @param {number} index of the widget to be returned
     * @return {object}
     */
    getWidget: function (index) {
        return this._widgets[index];
    }, 
    
    /**
     * Returns the widget instance for a CSS id.
     * @param {string} cssID The widget's CSS id.
     * @return {object}
     */
    getWidgetForID: function (cssID) {
        var id = String(cssID).replace(this._widgetIDPrefix, '');
        return this.getWidget(this._widgetIndicesByID[id]);
    }, 
    
    /**
     * Returns the number of widgets managed by this property row.
     * @return {number}
     */
    numberOfWidgets: function () {
        return this._widgetCount;
    }, 
    
    /**
     * Removes the widget at index <code>index</code>.
     * @param {int} index
     */
    removeWidget: function (index) {
        var widgetInstance = this.getWidget(index);
        var widgetID = widgetInstance.cssID();
        return this.removeWidgetForID(widgetID);
    }, 
    
    /**
     * Removes the widget identified by CSS id.
     * @param {string} cssID The widget's CSS id.
     */
    removeWidgetForID: function (cssID) {
        var widgetInstance = this.getWidgetForID(cssID);
        widgetInstance.onRemove();
        $('#' + this.cssID()).children('fieldset').children('#' + cssID).remove();
        
        // if all widgets removed, hide PredicateRow
        if ($('#' + this.cssID()).children('fieldset').children('.widget').length < 1) {
            $('#' + this.cssID()).hide();
        }
    }, 
    
    /**
     * Calls onCancel on all widget instances subsequently.
     */
    onCancel: function () {
        for (var i = 0; i < this.numberOfWidgets(); i++) {
            var widgetInstance = this.getWidget(i);
            if (widgetInstance) {
                widgetInstance.onCancel();
            }
        }
    }, 
    
    /**
     * Calls onSubmit on all widget instances subsequently and returns the 
     * conjunctively combined result.
     * @return {boolean}
     */
    onSubmit: function () {
        var submitOk = true;

        for (var i = 0; i < this.numberOfWidgets(); i++) {
            var widgetInstance = this.getWidget(i);
            if (widgetInstance) {
                submitOk = widgetInstance.onSubmit() && submitOk;
            }
        }

        return submitOk;
    }
}
