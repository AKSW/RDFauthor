/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * Constructs a subject group object that manages property rows sharing same subject. 
 *
 * @param {string} subjectURI the subject URI
 * @param {string} title A human-readable representation of the subject 
 * @param {jQuery|string} container a jQuery object (or selector string) containing the DOM element 
 *  whose child the SubjectGroup instance should be
 * @param {string|number} id an ID used to make the DOM element's CSS ID
 *
 * @constructor
 * @requires RDFauthor
 * @requires PredicateRow
 */
function SubjectGroup(graphURI, subjectURI, title, container, id) {
    this._graphURI   = graphURI;
    this._subjectURI = subjectURI;
    this._title      = title;
    this._container  = container instanceof jQuery   // jQuery-wrapped container DOM element
                     ? container 
                     : $(container);
    
    this._idPrefix = 'subject-group-'   // CSS id prefix
    this._id       = id;                // id for this group
    this._rows     = {};                // Hash map for property rows
    this._rowsByID = {};
    this._rowCount = 0;
    this._propertySelector = null;
    
    var instance = this;
    
    // local method that returns the basic HTML code for the subject group
    function getChrome() {
        var html = '\
            <div class="subject-group" id="' + instance.cssID() + '">\
            </div>\
        ';
        
        return html;
    }
    
    // append chrome
    this._container.append(getChrome());
}

SubjectGroup.prototype = {
    /**
     * Returns the CSS id for the associated DOM element.
     * @return string
     */
    cssID: function () {
        return this._idPrefix + this._id;
    }, 
    
    /**
     * Adds a widget associated with statement.
     * @param {Statement} statement a {@link Statement} object for which to add a widget
     * @param {function} constructor
     * @throws An exception if the subject of the statement is not managed by the subject group instance.
     */
    addWidget: function (statement, constructor) {
        if (statement.subjectURI() !== this._subjectURI) {
            throw 'Statement not associated with this row (invalid subject).';
        }
        
        var row;
        var predicateURI = statement.predicateURI();
        if (this._rows.hasOwnProperty(predicateURI)) {
            row = this.getRowByPredicate(predicateURI);
        } else {
            var rowID = RDFauthor.nextID();
            row = new PredicateRow(this._subjectURI, predicateURI, statement.predicateLabel(), this.getElement(), rowID);
            this._rows[predicateURI] = row;
            this._rowsByID[rowID] = row;
            this._rowCount++;
        }
        
        return row.addWidget(statement, constructor);
    }, 
    
    /**
     * Returns the DOM element associated with this subject group instance.
     * @return {HTMLElement}
     */
    getElement: function () {
        return $('#' + this.cssID()).get(0);
    }, 
    
    /**
     * Returns the number of rows this subject group currently manages.
     * @return {number}
     */
    numberOfRows: function () {
       return this._rowCount; 
    }, 
    
    /**
     * Returns the property selector instance for this subject group.
     */
    getPropertySelector: function (callback) {
        if (null === this._propertySelector) {
            var self = this;
            var selectorOptions = {
                container: jQuery(this.getElement()), 
                selectionCallback: function (uri, label) {
                    var statement = new Statement({
                        subject: '<' + self._subjectURI + '>', 
                        predicate: '<' + uri + '>'}, {
                            type: 'uri', 
                            title: label, 
                            graph: self._graphURI
                        });
                    self._propertySelector.dismiss(false);
                    
                    var ID = self.addWidget(statement);
                    
                    if (typeof callback == 'function') {
                        callback(ID);
                    }
                    
                    var row    = self.getRowByPredicate(uri);
                    var widget = row.getWidgetForID(ID);
                    widget.focus();
                }
            };
            
            this._propertySelector = new Selector(this._graphURI, this._subjectURI, selectorOptions);
        }
        
        return this._propertySelector;
    }, 
    
    /**
     * Returns the property row instance identified by id.
     * @param id string|number
     * @return {PredicateRow}
     */
    getRowByID: function (id) {
        return this._rowsByID[id];
    }, 
    
    /**
     * Returns the property row instance identified by property URI.
     * @param predicateURI string
     * @return {PredicateRow}
     */
    getRowByPredicate: function (predicateURI) {
        return this._rows[predicateURI];
    }, 
    
    /**
     * Sets this instance's associated DOM element's display property to 'block'.
     * @param {boolean} animated Whether to appear with an animation
     */
    show: function (animated) {
        var element = this.getElement();
        if (!animated) {
            $(element).show();
        } else {
            $(element).css('opacity', 0.0).show().fadeIn();
        }
    }, 
    
    /**
     * Sets this instance's assiciated DOM element's display property to 'none'.
     * @param {boolean} animated Whether to disappear with an animation
     */
    hide: function (animated) {
        var element = this.getElement();
        if (!animated) {
            $(element).hide();
        } else {
            $(element).fadeOut(function() {
                $(element).hide();
            });
        }
    }
}
