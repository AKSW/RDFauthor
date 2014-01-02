function InlineController(options) {
    // default options
    var defaultOptions = {
        useAnimations: true,
        animationTime: 250, // ms
        container: function (statement) {
            // return RDFauthor.elementForStatement(statement);
        }
    };

    // overwrite defaults if supplied
    this._options = jQuery.extend(defaultOptions, options);

    // rows by (s,p,o) key
    this._rows     = {};
    this._rowsByID = {};

    this.addWidget = function (statement, constructor, options) {
        var element  = this._options.container(statement);
        var _options = $.extend({
            container: element,
            activate: false
        }, options);

        var predicateURI = statement.predicateURI();
        var rowID        = RDFauthor.nextID();
        var rowKey       = String(statement);

        var row = new PredicateRow(statement.subjectURI(),
                                   statement.predicateURI(),
                                   null,
                                   _options.container,
                                   rowID);

        this._rows[rowKey] = row;
        this._rowsByID[rowID] = row;
        this._rowCount++;

        return row.addWidget(statement, constructor, _options.activate);
    }
}

InlineController.prototype = {
    reset: function () {

    },

    submit: function () {
        var submitOk = true;
        for (var index in this._rows) {
            submitOk &= this._rows[index].submit();
        }

        return submitOk;
    },

    resetToUnedit: function(values) {
        var updateValues = values;
        var subjectURI;
        var predicateURI;
        var predicateCount = 0;
        var liCount = 0;

        for (var index in this._rows) {
            var element = jQuery('#' + this._rows[index].cssID()).parent();
            // test if there is a value for a new predicate
            // roughly speaking, the predicateCount will
            if ((predicateURI == this._rows[index]._predicateURI) && (subjectURI == this._rows[index]._subjectURI)) {
                predicateCount += 1;
            }
            else {
                element.find('ul li').attr('rdfauthor-remove', true);
                predicateURI = this._rows[index]._predicateURI;
                subjectURI = this._rows[index]._subjectURI;
                predicateCount = 1;
                liCount = 0;
            }

            // make visible again and disable edit mode only necessary
            // for the first of (possibly) many equal predicates
            if (predicateCount == 1) {
                element.removeAttr('class');
                element.attr('class', 'has-contextmenu-area');
                element.children('.contextmenu').removeAttr('style');
                element.children('.bullets-none').removeAttr('style');
            }

            var widgetCount = 0;
            for (var wid in this._rows[index]._widgets) {
                widgetCount += 1;
                if (widgetCount > 1) {
                    var li = element.find('ul li:eq(' + (liCount - 1) + ')');
                    var newLi = $(li.clone([true, true]));
                    newLi.removeAttr('id');
                    li.after(newLi);
                }
                var li = element.find('ul li:eq(' + liCount + ')');
                var widget = this._rows[index]._widgets[wid];
                if (widget.removeOnSubmit) {
                    continue;
                }
                liCount += 1;
                li.removeAttr('rdfauthor-remove');
                var newVal = updateValues.shift();
                var widgetType;
                try {
                    widgetType = this._rows[index]._widgets[wid].getWidgetType();
                }
                catch (exception) {
                    widgetType = null;
                }
                switch(widgetType) {
                    case 'literal':
                        li.text(newVal);
                        li.attr('content', newVal);
                        var oldStatement = li.data('rdfauthor.statement');
                        var newStatement = oldStatement.copyWithObject(newVal);
                        li.removeData();
                        // TODO: update hash?!
                        li.removeAttr('data-object-hash');
                        li.data('rdfauthor.statement', newStatement);
                        break;
                    case 'resource':
                        /* TODO: for 'rdfs:seeAlso' and possibly other predicates,
                         * there is another li-element here
                         */
                        li.children('a:eq(0)').text(newVal);
                        // update *all* children (there are two for rdfs:seeAlso)
                        li.children('a').attr('resource', newVal);
                        var href = li.children('a:eq(0)').attr('href');
                        // TODO: use 'correct' way instead of kludge
                        href = RDFAUTHOR_BASE.split('/').slice(0, -3).join('/') + '/view/?r=' + newVal;
                        li.children('a:eq(0)').attr('href', href);
                        var oldStatement = li.children('a:eq(0)').data('rdfauthor.statement');
                        var newStatement = oldStatement.copyWithObject(newVal);
                        li.children('a:eq(0)').removeData();
                        li.children('a:eq(0)').data('rdfauthor.statement', newStatement);
                        // remove autocomplete box (_always_ on page but hidden)
                        $('.ui-autocomplete').remove();
                        break;
                    case 'datetime':
                        li.text(newVal);
                        var newStatement = li.data('rdfauthor.statement');
                        newStatement['_object']['value'] = newVal;
                        newStatement['_object']['representation'] = newVal;
                        // TODO: update hash?!
                        li.removeAttr('data-object-hash');
                        li.removeData();
                        li.data('rdfauthor.statement', newStatement);
                        // is this needed?
                        widget.element().datepicker("destroy");
                        widget.element().removeClass("hasDatepicker");
                        widget.element().unbind();
                        li.unbind();
                        break;
                    default:
                        console.log('Falling back to reload!');
                        window.setTimeout(function () {
                            window.location.href = window.location.href;
                        }, 1000);
                }
            }
        }
        // remove data RDFauthor added
        $('.rdfauthor-statement-provider').removeAttr('id');
        $('.rdfauthor-statement-provider').removeClass('rdfauthor-statement-provider');
        // remove all widgets that RDFauthor has opened
        $('div.rdfauthor-predicate-row').remove();
        $('li[rdfauthor-remove=true]').remove();
    },

    cancel: function () {
        for (var index in this._rows) {
            result &= this._rows[index].cancel();
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
