/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * Constructs a view object.
 *
 * @param options An object with view options. The following keys are recognized
 * (default values in parantheses):
 * <ul>
 *   <li><code>title</code> The view's main title ('Edit Properties'), </li>
 *   <li><code>saveButtonTitle</code> the title for the save button ('Save'), </li>
 *   <li><code>cancelButtonTitle</code> the caption for the cancel button ('Cancel'), </li>
 *   <li><code>container</code> a jQuery selector for the container DOM element ('body'), </li>
 *   <li><code>showButtons</code> whether to display buttons (true), </li>
 *   <li><code>animationTime</code> animation time in milliseconds (250), </li>
 *   <li><code>id</code> the ad attribute for the view's DOM element ('rdfAuthorView'), </li>
 *   <li><code>contentContainerClass</code> the CSS class for the content container ('rdfAuthorViewContent').</li>
 * </ul>
 *
 * @constructor
 * @requires RDFauthor
 * @requires SubjectGroup
 */
function View(options) {
    // default options
    var defaultOptions = {
        title: 'Edit Properties', 
        saveButtonTitle: 'Save', 
        cancelButtonTitle: 'Cancel', 
        container: 'body', 
        showButtons: true, 
        animationTime: 250, // ms
        id: 'rdfAuthorView', 
        contentContainerClass: 'rdfAuthorViewContent'/*, 
        replaceContainerContent: false*/
    };
    
    // overwrite defaults if supplied
    this._options   = $.extend(defaultOptions, options);
    this._container = this._options.container instanceof jQuery 
                    ? this._options.container 
                    : $(this._options.container);
    
    // unique subjects
    this._subjects     = {};
    this._subjectCount = 0;
    
    var instance = this;
    
    function getChrome() {
        html = '\
            <div class="window" id="' + instance.cssID() + '" style="display:none">\
                <h2 class="title">' + instance._options.title + '</h2>\
                <div class="' + instance._options.contentContainerClass + '">\
                </div>' + getButtons() + '<div style="clear:both"></div>\
            </div>';
        
        return html;
    };
    
    if ($('#' + this.cssID()).length < 1) {
        // append chrome        
        this._container.append(getChrome());
    }
    
    function getButtons() {
        var buttonHTML = '';
        if (instance._options.showButtons) {
            buttonHTML = '\
                <div id="rdfAuthorButtons">\
                    <button type="button" class="rdfAuthorButtonCancel">' + instance._options.cancelButtonTitle + '</button>\
                    <button type="button" class="rdfAuthorButtonSave">' + instance._options.saveButtonTitle + '</button>\
                </div>';
        }
        
        return buttonHTML;
    }
}

View.prototype = {
    /**
     * Adds a new widget to the view instance.
     * @param {Statement} statement object
     * @param {function} Constructor function to be used for widget instantiation
     */
    addWidget: function (statement, constructor) {
        var subjectURI = statement.subjectURI();
        var subjectGroup;
        if (this._subjects.hasOwnProperty(subjectURI)) {
            subjectGroup = this._subjects[subjectURI];
        } else {
            subjectGroup = new SubjectGroup(subjectURI, subjectURI, this.getContentContainer(), RDFauthor.nextID());
            this._subjects[subjectURI] = subjectGroup;
            this._subjectCount++;
        }
        
        subjectGroup.addWidget(statement, constructor);
    }, 
    
    /**
     * Returns the DOM element that is used as a container for view content 
     * (i.e. PredicateRows).
     * @return {jQuery}
     */
    getContentContainer: function () {
        return $(this.getElement()).children('.' + this._options.contentContainerClass).eq(0);
    }, 
    
    /**
     * Returns the DOM element associated with this view instance.
     * @return {jQuery}
     */
    getElement: function () {
        return $('#' + this.cssID()).get(0);
    }, 
    
    /**
     * Returns the subject group instance identified by URI.
     * @param subjectURI The subject URI for which to return the {@link SubjectGroup} (string)
     * @return {SubjectGroup}
     */
    getSubjectGroup: function (subjectURI) {
        return this._subjects[subjectURI];
    }, 
    
    /**
     * Returns the CSS id of this view instance's associated DOM element.
     * @return {string}
     */
    cssID: function () {
        return this._options.id;
    }, 
    
    /**
     * Returns the number of dsitinguished subjects currently managed by the
     * view instance.
     * @return {number}
     */
    numberOfSubjects: function () {
        return this._subjectCount;
    }, 
    
    /**
     * Shows this view instance if currently hidden.
     * @param {boolean} animated Whether to appear animatedly
     */
    show: function (animated) {
        if (!animated) {
            $(this.getElement()).show();
            // TODO: trigger event
        } else {
            $(this.getElement()).css('opacity', 0.0).show();
            this._container.show();
            $(this.getElement()).fadeIn(function() {
                // TODO: trigger event
            });
        }
    }, 
    
    /**
     * Hides this view instance if currently visible.
     * @member
     * @param {boolean} animated Whether to disappear animatedly
     */
    hide: function (animated) {
        if (!animated) {
            $(this.getElement()).hide();
            this._container.hide();
        } else {
            var instance = this;
            $(this.getElement()).fadeOut(function() {
                $(instance.getElement()).hide();
                instance._container.hide();
            });
        }
    }
};
