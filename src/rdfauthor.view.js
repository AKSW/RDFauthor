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
        contentContainerClass: 'rdfAuthorViewContent', 
        replaceContainerContent: false
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

/**
 * Prototype for all View instances.
 */
View.prototype = {
    /**
     * Adds a new widget to this view instance.
     * @param Statement statement
     * @param function constructor
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
     * @return node
     */
    getContentContainer: function () {
        return $(this.getElement()).children('.' + this._options.contentContainerClass).eq(0);
    }, 
    
    /**
     * Returns the DOM element associated with this view instance.
     * @return node
     */
    getElement: function () {
        return $('#' + this.cssID()).get(0);
    }, 
    
    /**
     * Returns the subject group instance identified by URI.
     * @param string subjectURI
     * @return SubjectGroup
     */
    getSubjectGroup: function (subjectURI) {
        return this._subjects[subjectURI];
    }, 
    
    /**
     * Returns the CSS id of this view instance's associated DOM element.
     * @return string
     */
    cssID: function () {
        return this._options.id;
    }, 
    
    /**
     * Returns the number of dsitinguished subjects currently managed by this
     * view instance.
     * @return number
     */
    numberOfSubjects: function () {
        return this._subjectCount;
    }, 
    
    /**
     * Shows this view instance if currently hidden.
     * @param boolean animated Whether to appear animatedly
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
     * @param boolean animated Whether to disappear animatedly
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
