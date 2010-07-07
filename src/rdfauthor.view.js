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
    
    this.activeSubject = null;
    
    // overwrite defaults if supplied
    this._options   = jQuery.extend(defaultOptions, options);
    this._container = this._options.container instanceof jQuery 
                    ? this._options.container 
                    : $(this._options.container);
    
    // unique subjects
    this._subjects     = {};
    this._subjectCount = 0;
    
    var self = this;
    
    function getChrome() {
        html = '\
            <div class="window" id="' + self.cssID() + '" style="display:none">\
                <h2 class="title">' + self._options.title + '</h2>\
                <div class="' + self._options.contentContainerClass + '">\
                </div>' + getButtons() + '<div style="clear:both"></div>\
            </div>';
        
        return html;
    };
    
    function getButtons() {
        var buttonHTML = '';
        if (self._options.showButtons) {
            buttonHTML = '\
                <div id="rdfAuthorButtons">\
                    <button type="button" id="rdfauthor-button-cancel">' + self._options.cancelButtonTitle + '</button>\
                    <button type="button" id="rdfauthor-button-submit">' + self._options.saveButtonTitle + '</button>\
                </div>';
        }
        
        return buttonHTML;
    }
    
    // view initialization
    if (jQuery('#' + this.cssID()).length < 1) {
        // append chrome        
        this._container.append(getChrome());
        
        // make draggable if jQuery UI loaded
        if (typeof jQuery.ui != 'undefined' && !jQuery('#' + this.cssID()).hasClass('ui-draggable')) {
            jQuery('#' + this.cssID()).draggable({handle: 'h2', zIndex: 10000});
            // jQuery('#' + this.cssID()).resizable();
        }
        
        jQuery('#rdfauthor-button-cancel').live('click', function () {
            jQuery('body').trigger('rdfauthor.view.cancel');
            
            if (typeof self._options.onAfterCancel == 'function') {
                self._options.onAfterCancel();
            }
        });

        jQuery('#rdfauthor-button-submit').live('click', function () {            
            if (typeof self._options.onBeforeSubmit == 'function') {
                self._options.onBeforeSubmit();
            }
            
            jQuery('body').trigger('rdfauthor.view.submit');
            
            if (typeof self._options.onAfterSubmit == 'function') {
                self._options.onAfterSubmit();
            }
        });
    }
}

View.prototype = {
    /**
     * Adds a new widget to the view self.
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
            
            // save the first group as the initially active group
            if (null === this.activeSubject) {
                this.activeSubject = subjectURI;
            }
        }
        
        subjectGroup.addWidget(statement, constructor);
    }, 
    
    /** 
     * Returns the currently active subject group.
     * @return SubjectGroup
     */
    activeSubjectGroup: function () {
        return this.getSubjectGroup(this.activeSubject);
    }, 
    
    /**
     * Returns the DOM element that is used as a container for view content 
     * (i.e. PredicateRows).
     * @return {jQuery}
     */
    getContentContainer: function () {
        return jQuery(this.getElement()).children('.' + this._options.contentContainerClass).eq(0);
    }, 
    
    /**
     * Returns the DOM element associated with this view self.
     * @return {jQuery}
     */
    getElement: function () {
        return jQuery('#' + this.cssID()).get(0);
    }, 
    
    /**
     * Returns the subject group self identified by URI.
     * @param subjectURI The subject URI for which to return the {@link SubjectGroup} (string)
     * @return {SubjectGroup}
     */
    getSubjectGroup: function (subjectURI) {
        return this._subjects[subjectURI];
    }, 
    
    /**
     * Returns the CSS id of this view self's associated DOM element.
     * @return {string}
     */
    cssID: function () {
        return this._options.id;
    }, 
    
    /**
     * Returns the number of dsitinguished subjects currently managed by the
     * view self.
     * @return {number}
     */
    numberOfSubjects: function () {
        return this._subjectCount;
    }, 
    
    position: function () {
        var cw = this._container.width();
        var w  = jQuery(this.getElement()).width();
        
        jQuery(this.getElement()).css('left', 0.5 * (cw - w) + 'px');
    }, 
    
    /**
     * Resets this view self
     */
    reset: function () {
        // unique subjects
        this._subjects     = {};
        this._subjectCount = 0;
    }, 
    
    /**
     * Shows this view self if currently hidden.
     * @param {boolean} animated Whether to appear animatedly
     */
    show: function (animated) {
        if (arguments.length === 0 || !animated) {
            jQuery(this.getElement()).show();
            this.activeSubjectGroup().show();
            this._container.show();
            // TODO: trigger event
        } else {
            jQuery(this.getElement()).css('opacity', 0.0).show();
            this._container.show();
            jQuery(this.getElement()).fadeIn(function() {
                // TODO: trigger event
            });
        }
        
        this.position();
    }, 
    
    /**
     * Hides this view self if currently visible.
     * @member
     * @param {boolean} animated Whether to disappear animatedly
     */
    hide: function (animated) {
        if (!animated) {
            jQuery(this.getElement()).hide();
            this._container.hide();
        } else {
            var self = this;
            jQuery(this.getElement()).fadeOut(function() {
                jQuery(self.getElement()).hide();
                self._container.hide();
            });
        }
    }
};
