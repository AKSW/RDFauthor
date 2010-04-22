/**
 * Marks the required interface for a widget.
 * Use this object as the prototype for your custom widget by setting
 * <code>MyWidget.prototype = Widget;</code> or make sure you implement all 
 * the functions yourself.
 */
Widget = {    
    /**
     * Default widget constructor.
     */
    construct: function (statement) {
        this.statement = statement;
    }, 
    
    /**
     * This function gets called by the framework once a widget is used.
     * You can rely on the widget's markup to already be in the DOM.
     */
    init: function () {
        
    }, 
    
    /**
     * Returns the widget's markup code.
     * @return {String}
     */
    markup: function () {
        return '<span>Widget not correctly implemented.</span>';
    }, 
    
    /**
     * Gives focus to the widget's main input element.
     */
    focus: function () {
        var el = this.element();
        if (el && (el.tagName == 'input' || el.tagName == 'textarea')) {
            jQuery(el).focus();
        };
    }, 
    
    /**
     * Is called for every active widget if the user cancels the editing process.
     */
    cancel: function () {
        
    }, 
    
    /**
     * Is called if the user removes a widget indicating he aims to delete the
     * statement that this widget represents.
     */
    remove: function () {
        
    }, 
    
    /**
     * Called for every active widget when the user commits his editing by clicking 'Submit'.
     * Widgets should write their changes to the databank obtained by <code>this.databank();</code>
     * and return true on succes or false if the submitting process should be suspended.
     * Suspending a submit usually gives the user a change to revise some erroneous input.
     * @return {Boolean}
     */
    submit: function () {
        
    }, 
    
    /**
     * Returns a reference to the widgets main input element.
     * If the widget has more than one main input elements, a reference to the first
     * one in DOM order should be returned.
     */
    element: function () {
        return null;
    }
};
