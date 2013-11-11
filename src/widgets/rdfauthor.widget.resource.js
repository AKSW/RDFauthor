/**
 * RDFauthor Resource Widget
 */

RDFauthor.getInstance(function(RDFauthorInstance) {
  RDFauthorInstance.registerWidget({
    element: function () {
        return jQuery('#input-' + this.id);
    },
    
    init: function () {
      
    },
    
    isURI: function (term) {
      // TODO: more advanced URI check
      return (/(https?:\/\/|mailto:|tel:)/.exec(term) !== null);
    },
    
    markup: function () {
      console.log(this.statement);
      var markup = '<div style="margin-bottom: 10px;" class="input-group widget resource">\
              <input id="input-' + this.id + '" type="text" class="form-control" value="' + this.statement.objectValue() + '">\
              <div class="input-group-btn">\
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>\
                <ul class="dropdown-menu pull-right">\
                  <li><a href="#">Action</a></li>\
                  <li><a href="#">Another action</a></li>\
                  <li><a href="#">Something else here</a></li>\
                  <li class="divider"></li>\
                  <li><a href="#">Separated link</a></li>\
                </ul>\
              </div>\
            </div>';
      return markup;
    },
    
    ready: function () {
      
    },
    
    shouldProcessSubmit: function () {
        var t1 = !this.statement.hasObject();
        var t2 = null === this.value();
        var t3 = this.removeOnSubmit;

        return (!(t1 && t2) || t3);
    },

    
    submit: function () {
      if (this.shouldProcessSubmit()) {
        console.log('submit resource widget', this.value());
        var somethingChanged = (
          this.statement.hasObject()
          && this.statement.objectValue() !== this.value()
          && null !== this.value()
        );

        if (somethingChanged || this.removeOnSubmit) {
          console.log('remove resource', this.statement.deleteStatementQuery());
        }

        // new statement must not be empty
        var isNew = !this.statement.hasObject() && (null !== this.value());

        if (somethingChanged || this.removeOnSubmit) {
            //remove
            console.log('remove resource');
            RDFauthorInstance.setUpdateSource('delete', this.statement.asTriple());
            console.log('remove literal triple', this.statement.asTriple());
        }
        if ((null !== this.value()) && !this.removeOnSubmit && (somethingChanged || isNew)) {
        //if (!this.removeOnSubmit && this.value()) {
          
          var self = this;
          try {
            var objectOptions = {};
            var newStatement = this.statement.copyWithObject({
              value: ( self.statement._object.type == 'uri' ) ? '' + this.value() + '' 
                                                              : '_:' + this.value(),
              type: ( self.statement._object.type == 'bnode' ) ? 'bnode' : 'uri',
              options: objectOptions
            });
            // TODO add new statement
            console.log('add new statement resource', newStatement.insertStatementQuery());
            RDFauthorInstance.setUpdateSource('insert', newStatement.asTriple());
            console.log('new resource triple', newStatement.asTriple());
          } catch (e) {
            var msg = e.message ? e.message : e;
            alert('Could not save resource for the following reason: \n' + msg);
            return false;
          }
        }
    }

    return true;

    },
    
    value: function () {
      var self = this;
        var value = self.element().val();
        if ( self.isURI(value) || (String(value).indexOf(':') > -1) ) {
            return value;
        }

        return null;
    },
    
    widgetUri: function () {
      return 'http://aksw.org/Projects/RDFauthor/local#resource';
    }
  }, 
  {'hook': {
      'resource': 'default'
      }
  },
  function () {
    // callback
  });
});
