/**
 * Marks the required interface for a Choreography.
 * Use this object as the prototype for your custom Choreography by setting
 * <code>MyChoreography.prototype = Choreography;</code> or make sure you implement all
 * the functions yourself.
 */
var Choreography = {
  options: {},
  _properties: [],
  _maxWidth: null,
  
  /**
   * Returns the available space the Choreography can use in pixels.
   */
  availableWidth: function () {
    return this._maxWidth;
  },

  /**
   * This function gets called by the framework once a Choreography is used.
   */
  init: function () {

  },

  /**
   * This function gets called by the framework once a Choreography is ready.
   * You can rely on the Choreography's markup to already be in the DOM.
   */
  ready: function () {

  },

  /**
   * Returns the Choreography's markup code.
   * @return {String}
   */
  markup: function () {
    return '<span>Choreography not correctly implemented.</span>';
  },

  /**
   * Gives focus to the Choreography's main input element.
   */
  focus: function () {
    var el = this.element();
    if (el && el.length > 0) {
        if (el.get(0).tagName.toLowerCase() == 'input' || el.get(0).tagName.toLowerCase() == 'textarea') {
            el.focus();
        }
    }
  },

  /**
   * Is called for every active Choreography if the user cancels the editing process.
   */
  cancel: function () {

  },
  
  /**
   * Is called for getting registered properties for this choreography.
   */
  getProperties: function () {
    return this._properties;
  },
  
  /**
   * Is called if the user removes a Choreography indicating the aim to delete the
   * statement this Choreography represents.
   */
  remove: function () {
    this.removeOnSubmit = true;
  },

  /**
   * Called for every active Choreography when the user commits his editing by clicking 'Submit'.
   * Choreographys should write their changes to the databank obtained by <code>this.databank();</code>
   * and return true on succes or false if the submitting process should be suspended.
   * Suspending a submit usually gives the user a change to revise some erroneous input.
   * @return {Boolean}
   */
  submit: function () {

  },

  /**
   * Returns a reference to the Choreography's jQuery-wrapped main input element.
   * If the Choreography has more than one main input elements, a reference to the first
   * one in DOM order should be returned.
   */
  element: function () {
    return null;
  }
};