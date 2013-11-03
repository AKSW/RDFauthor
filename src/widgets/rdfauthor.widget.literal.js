/**
 * RDFauthor Literal Widget
 */

RDFauthor.getInstance(function(RDFauthorInstance) {
  RDFauthorInstance.registerWidget({
    datatype: function () {
      return '';
    },
    
    element: function () {
        return jQuery('#input-' + this.ID);
    },

    
    init: function () {
      
    },
    
    lang: function () {
      return '';
    },
    
    markup: function () {
      console.log(this.statement);
      var markup = '<div style="margin-bottom: 10px;" class="input-group widget literal">\
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
        console.log('submit literal widget');
        /*
        var v = this.value();
        // */

        var somethingChanged = (
          this.statement.hasObject() && (
            // existing statement should have been edited
            this.statement.objectValue() !== this.value() ||
            this.statement.objectLang() !== this.lang() ||
            this.statement.objectDatatype() !== this.datatype()
          )
        );

        // new statement must not be empty
        var isNew = !this.statement.hasObject() && (null !== this.value());

        if (somethingChanged || this.removeOnSubmit) {
            //remove
        }
        if ((null !== this.value()) && !this.removeOnSubmit && (somethingChanged || isNew)) {
          try {
            var objectOptions = {};
            if (null !== this.lang()) {
                objectOptions.lang = this.lang();
            } else if (null !== this.datatype()) {
                objectOptions.datatype = this.datatype();
            }
            var newStatement = this.statement.copyWithObject({
                value: this.value(),
                options: objectOptions,
                type: 'literal'
            });
            // TODO add new statement
            console.log('add new statement literal', newStatement);
          } catch (e) {
              var msg = e.message ? e.message : e;
              alert('Could not save literal for the following reason: \n' + msg);
              return false;
          }
        }
      }

      return true;
    },
    
    type: function () {
      return '';
    },
    
    value: function () {
      var value = this.element().val();
      if (String(value).length > 0) {
        return value;
      }

      return null;

    },
    
    widgetUri: function () {
      return 'http://aksw.org/Projects/RDFauthor/local#literal';
    }
  }, 
  {'hook': {
      'literal': 'default'
      }
  },
  function () {
    // callback
  });
});
