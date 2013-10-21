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
