function InlineController(options) {
    // unique subjects
    this._subjects     = {};
    this._subjectCount = 0;
    
    this._idPrefix          = 'property-row-'   // CSS id prefix
    this._id                = RDFauthor.nextID();   // id for this row
    this._widgetIDPrefix    = 'widget-';        // CSS id prefix for widgets
    this._widgetCount       = 0;                // nbumber of widgets
    this._widgets           = {};               // widget hash map
    this._widgetIndicesByID = {};               // widgets indexed by id
    
    var self = this;
    
    function getOverride() {
        var override = '';
        var overrideID = RDFauthor.nextID();
        
        if (this._allowOverride) {
            override += '<div class="container actions right">\
                <div class="widget-override" id="widget-override-' + overrideID + '" style="display:block">\
                    <select name="widget-override-' + overrideID + '" title="Override widget selection">\
                        <option selected="selected">Literal</option>\
                        <option>Resource</option>\
                        <option>Date</option>\
                    </select>\
                </div>\
            </div>';
        }
        
        return override;
    }
    
    // returns the widget HTML + widget chrome
    function getWidgetChrome(rowID, widgetID, widgetHTML) {
        var html = '\
            <div class="property-row" id="' + rowID + '">\
                <div class="widget" id="' + self._widgetIDPrefix + widgetID + '">\
                    <div class="container actions right">\
                        <a class="delete-button" title="Remove widget and data."></a>\
                        <a class="add-button" title="Add another widget of the same type."></a>\
                    </div>' + getOverride() + '<div class="rdfauthor-widget-container" style="width:80%">' + widgetHTML + '</div>\
                    <hr style="clear:both;height:0;border:none" />\
                </div>\
            </div>';
        
        return html;
    };
    
    // Returns the next widget's index
    function nextWidgetIndex() {
        return self._widgetCount++;
    }
    
    this.addWidget = function (statement, constructor, activate) {
        var widgetInstance = null;
        
        // instantiate widget
        if ((undefined !== constructor) && (typeof constructor == 'function')) {
            widgetInstance = new constructor(statement);
            widgetInstance.constructor = constructor;
        } else {
            widgetInstance = RDFauthor.getWidgetForStatement(statement);
        }
        
        // no widget found
        if (!widgetInstance) {
            throw 'No suitable widget found.';
        }
        
        // initialize widget
        widgetInstance.init();
        
        var widgetID   = RDFauthor.nextID();
        var rowID      = this.idPrefix + RDFauthor.nextID();
        var widgetHTML = getWidgetChrome(rowID, widgetID, widgetInstance.markup());
        var widgetIdx  = nextWidgetIndex();
        
        // store widget-id widgetIdx mapping
        this._widgets[widgetIdx] = widgetInstance;
        this._widgetIndicesByID[widgetID] = widgetIdx;
        
        // append
        $(this.getContentElement(statement)).parent().html(widgetHTML);
        
        // widget markup ready
        widgetInstance.ready();
        
        // focus widget
        if ((undefined !== activate) && activate) {
            widgetInstance.focus();
        }
        
        return this._widgetIDPrefix + widgetID;
    }
}

InlineController.prototype = {
    getSubjectGroup: function (graphURI, statement) {
        var subjectGroup;
        var subjectURI   = statement.subjectURI();
        var predicateURI = statement.predicateURI();
        var index        = subjectURI + predicateURI;
        
        if (undefined !== this._subjects[index]) {
            subjectGroup = this._subjects[index];
        } else {
            subjectGroup = new SubjectGroup(
                graphURI, 
                subjectURI, 
                subjectURI, 
                this.getContentContainer(statement), 
                RDFauthor.nextID(), 
                {showLabels: false});
            
            this._subjects[index] = subjectGroup;
            this._subjectCount++;
            
            // save the first group as the initially active group
            if (null === this.activeSubject) {
                this.activeSubject = subjectURI;
            }
        }
        
        return subjectGroup;
    }, 
    
    activeSubjectGroup: function () {
        if (null === this.activeSubject) {
            this.activeSubject = RDFauthor.defaultSubjectURI();
            var activeGraph = RDFauthor.defaultGraphURI();
            var subjectGroup = this.getSubjectGroup(activeGraph, this.activeSubject);
        }
        
        return this.subjectGroup(this.activeSubject);
    }, 
    
    getContentElement: function (statement) {
        var element = RDFauthor.elementForStatement(statement);
        return element;
    }, 
    
    getElement: function () {
        return null;
    }, 
    
    subjectGroup: function (subjectURI) {
        return this._subjects[subjectURI];
    }, 
    
    cssID: function () {
        return this._idPrefix + this._id;
    },
    
    numberOfSubjects: function () {
        return this._subjectCount;
    }, 
    
    position: function () {
        
    }, 
    
    reset: function () {
        
    }, 
    
    submit: function () {
        var submitOk = true;
        for (var index in this._subjects) {
            submitOk &= this._subjects[index].submit();
        }
        
        return submitOk;
    }, 
    
    cancel: function () {
        for (var index in this._subjects) {
            submitOk &= this._subjects[index].cancel();
        }
    }, 
    
    show: function (animated) {
        for (var index in this._subjects) {
            var group = this._subjects[index];
            $(group.getElement()).parent().children().hide();
            group.show();
        }
    }, 
    
    hide: function (animated, callback) {
        for (var index in this._subjects) {
            var group = this._subjects[index];
            $(group.getElement()).parent().children().show();
            group.hide();
        }
    }
}