/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * Constructs a subject group object that manages property rows sharing same subject. 
 * @param string subjectURI
 * @param string title
 * @param Node|jQuery container
 * @param String|Number id Used for CSS id
 */
function SubjectGroup(subjectURI, title, container, id) {
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

/**
 * Prototype object for all subject group instances.
 */
SubjectGroup.prototype = {
    /**
     * Returns the CSS id for this subject group.
     * @return string
     */
    cssID: function () {
        return this._idPrefix + this._id;
    }, 
    
    /**
     * Adds a widget associated with statement.
     * @param Statement statement
     * @exception Throws an exception if the subject of the statement is not managed
     *  by this subject group instance.
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
     * @return Node
     */
    getElement: function () {
        return $('#' + this.cssID()).get(0);
    }, 
    
    /**
     * Returns the number of rows this subject group currently manages.
     * @return number
     */
    numberOfRows: function () {
       return this._rowCount; 
    }, 
    
    /**
     * Returns the property row instance identified by id.
     * @param string|number id
     * @return PropertyRow
     */
    getRowByID: function (id) {
        return this._rowsByID[id];
    }, 
    
    /**
     * Returns the property row instance identified by property URI.
     * @param string predicateURI
     * @return PropertyRow
     */
    getRowByPredicate: function (predicateURI) {
        return this._rows[predicateURI];
    }, 
    
    /**
     * Sets this instance's associated DOM element's display property to 'block'.
     * @param boolean animated Whether to appear with an animation
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
     * @param boolean animated Whether to disappear with an animation
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
