function Statement (statementSpec) {
  this._subject = statementSpec.subject;
  this._predicate = statementSpec.predicate;
  this._object = statementSpec.object;
  if (this._predicate.lastIndexOf('#') > -1) {
      this._predicateLabel = this._predicate.substr(this._predicate.lastIndexOf('#') + 1);
  } else {
      this._predicateLabel = this._predicate.substr(this._predicate.lastIndexOf('/') + 1);
  }
}

Statement.prototype = {
  updateEndpoint: '',
  
  /**
   * Returns a new statement based on the current statement where the object is changed
   *
   */
  copyWithObject: function (objectSpec) {
    jQuery.extend(objectSpec, {type: this.objectType()});

    var copy = new Statement({
      subject: '<' + this.subjectUri() + '>',
      predicate: '<' + this.predicateUri() + '>',
      object: objectSpec
    }, {
      title: this.predicateLabel()
    });

    return copy;
  },
  
  /**
   * Denotes whether the statement's object has been set.
   * @return {boolean}
   */
  hasObject: function () {
    return (null !== this._object);
  },

 
  subjectUri: function () {
    return this._subject;  
  },
  
  predicateLabel: function () {
    return this._predicateLabel;
  },
  
  prediacteUri: function () {
    return this._predicate;
  },
  
  objectDatatype: function () {
    return this._object.datatype ? this._object.datatype : false;
  },
  
  objectLanguage: function() {
    return this._object.lang ? this._object.lang : false;
  },
  
  objectType: function () {
    return this._object.type ? this._object.type : false;
  },
  
  objectValue: function () {
    return this._object.value;
  }
}
