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
    var o = {
      value: objectSpec.value,
      type: objectSpec.type
    }
    
    // lang tag available ? add to o
    if (objectSpec.options.lang) { o.lang = objectSpec.options.lang; }
    
    // datatype tag available ? add to o
    if (objectSpec.options.datatype) { o.datatype = objectSpec.options.datatype; }
    
    var copy = new Statement({
      subject: '' + this.subjectUri() + '',
      predicate: '' + this.predicateUri() + '',
      object: o
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

  insertStatementQuery: function () {
    if (this._object.type === 'blank') {
      var objectString = '<' + this._object.value + '>';
    }
    
    if (this._object.type === 'uri') {
      var objectString = '<' + this._object.value + '>';
    }
    
    if (this._object.type === 'literal') {
      console.log('copy literal', this._object);
      var objectString = '"' + this._object.value + '"';
      
      if (this._object.lang != null) {
        objectString += '@' + this._object.lang;
      }
      
      if (this._object.datatype != null) {
        objectString += '^^' + this._object.datatype;
      }
      
    }
    var query = 'INSERT DATA { <' + this._subject + '> <' + this._predicate + '> ' + objectString + ' }';
    return query;
  },

  deleteStatementQuery: function () {
    console.log('objectSpec', this._object);
    if (this._object.type === 'blank') {
      var objectString = '<' + this._object.value + '>';
    }
    
    if (this._object.type === 'uri') {
      var objectString = '<' + this._object.value + '>';
    }
    
    if (this._object.type === 'literal') {
      var objectString = '"' + this._object.value + '"';
      
      if (this._object.lang != null) {
        objectString += '@' + this._object.lang;
      }
      
      if (this._object.datatype != null) {
        objectString += '^^' + this._object.datatype;
      }
      
    }
    var query = 'DELETE DATA { <' + this._subject + '> <' + this._predicate + '> ' + objectString + ' }';
    return query;
  },
 
  subjectUri: function () {
    return this._subject;  
  },
  
  asTriple: function () {
    if (this._object.type === 'blank') {
      var objectString = '<' + this._object.value + '>';
    }
    
    if (this._object.type === 'uri') {
      var objectString = '<' + this._object.value + '>';
    }
    
    if (this._object.type === 'literal') {
      console.log('copy literal', this._object);
      var objectString = '"' + this._object.value + '"';
      
      if (this._object.lang != null) {
        objectString += '@' + this._object.lang;
      }
      
      if (this._object.datatype != null) {
        objectString += '^^' + this._object.datatype;
      }
      
    }
    var triple = '<' + this._subject + '> <' + this._predicate + '> ' + objectString;
    return triple;
  },
  
  predicateLabel: function () {
    return this._predicateLabel;
  },
  
  predicateUri: function () {
    return this._predicate;
  },
  
  objectDatatype: function () {
    return this._object.datatype ? this._object.datatype : null;
  },
  
  objectLanguage: function() {
    return this._object.lang ? this._object.lang : null;
  },
  
  objectType: function () {
    return this._object.type ? this._object.type : null;
  },
  
  objectValue: function () {
    return this._object.value;
  }
}
