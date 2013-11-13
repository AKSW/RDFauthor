/**
 * RDFauthor Literal Widget
 */

RDFauthor.getInstance(function(RDFauthorInstance) {
  RDFauthorInstance.registerWidget({
    datatype: function () {
      return this.statement.objectDatatype();
    },
    
    element: function () {
      return jQuery('#input-' + this.id);
    },
    
    elementDropdown: function () {
      return this.element().next('div');
    },
    
    hasDatatype: function () {
      return null !== this.statement.objectDatatype();
    },

    hasLanguageTag: function () {
      return null !== this.statement.objectLanguage();
    },
    
    init: function () {
      this.datatypes = RDFauthorInstance.literalDatatypes();
      this.languageTags = RDFauthorInstance.literalLanguageTags();
      
      
    },
    
    lang: function () {
      return this.statement.objectLanguage();
    },
    
    markup: function () {
      // indicates a set language or datatype
      var langClass = this.hasLanguageTag() ? 'language' : '';
      var datatypeClass = this.hasDatatype() ? 'datatype' : '';
      
      // generate datatype submenu markup
      var datatypeSubmenuMarkup = '\
        <li class="dropdown-submenu ' + datatypeClass + '">\
          <a tabindex="-1" href="#">Datatype</a>\
          <ul class="dropdown-menu">';
      // iterate through predefined datatypes
      var matchedType = false;
      for (var type in this.datatypes) {
        if (type.indexOf(this.statement.objectDatatype()) > -1) {
          matchedType = true;
          datatypeSubmenuMarkup +='<li><a tabindex="-1" href="#" name="' + type + '" class="' + datatypeClass + '">' + this.datatypes[type] + '</a></li>';
        } else {
          datatypeSubmenuMarkup +='<li><a tabindex="-1" href="#" name="' + type + '">' + this.datatypes[type] + '</a></li>';          
        }
        console.log('type ', type);
      }
      // if type is not part of rdfauthors datatype set, put it at the end
      if (!matchedType && this.statement.objectDatatype() != null) {
        datatypeSubmenuMarkup += '<li><a tabindex="-1" href="#" name="' + this.statement.objectDatatype() + '" class="' + datatypeClass + '">' + this.statement.objectDatatype() + '</a></li>';
      }
      // close ul and li
      datatypeSubmenuMarkup += '</ul></li>';

      // generate language submenu markup
      var languageSubmenuMarkup = '\
        <li class="dropdown-submenu ' + langClass + '">\
          <a tabindex="-1" href="#">Language</a>\
          <ul class="dropdown-menu">';    
      // iterate through predefined datatypes
      var matchLang = false;
      for (var i in this.languageTags) {
        if (this.languageTags[i].indexOf(this.statement.objectLanguage()) > -1) {
          matchLang = true;
          languageSubmenuMarkup +='<li><a tabindex="-1" href="#" name="' + this.languageTags[i] + '" class="' + langClass + '">' + this.languageTags[i] + '</a></li>';
        } else {
          languageSubmenuMarkup +='<li><a tabindex="-1" href="#" name="' + this.languageTags[i] + '">' + this.languageTags[i] + '</a></li>';        
        }
      }
      // if language is not part of rdfauthors rdfauthor set, put it at the end
      if (!matchLang && this.statement.objectLanguage() != null) {
        languageSubmenuMarkup +='<li><a tabindex="-1" href="#" name="' + this.statement.objectLanguage() + '" class="' + langClass + '">' + this.statement.objectLanguage() + '</a></li>';
      } 
      // close ul and li
      languageSubmenuMarkup += '</ul></li>';


      
      // widget markup
      var markup = '<div style="margin-bottom: 10px;" class="input-group widget literal">\
              <input id="input-' + this.id + '" type="text" class="form-control" value="' + this.statement.objectValue() + '">\
              <div class="input-group-btn">\
                <button type="button" class="btn btn-default dropdown-toggle ' + langClass + ' ' + datatypeClass + '" data-toggle="dropdown"><span class="caret"></span></button>\
                <ul class="dropdown-menu pull-right">\
                  <li><a href="#" class="remove">Remove</a></li>\
                  <li class="divider"></li>\
                  ' + languageSubmenuMarkup + '\
                  ' + datatypeSubmenuMarkup + '\
                </ul>\
              </div>\
            </div>';
      return markup;
    },
    
    ready: function () {
      var self = this;
      console.log('rdy called for literal widget');
      // jquery events
      console.log('elementDropdown', this.elementDropdown());
      $(self.elementDropdown()).on('click', '.remove', function (event) {
        self.remove();
      });
    },
    
    remove: function () {
      var self = this;
      self.removeOnSubmit = true;
      // hide widget chrome inlcuding input and input group (dropdown)
      self.element().parents('.widget').hide();
      
    },

    shouldProcessSubmit: function () {
      var t1 = !this.statement.hasObject();
      var t2 = null === this.value();
      var t3 = this.removeOnSubmit;

      return (!(t1 && t2) || t3);
    },

    
    submit: function () {
      if (this.shouldProcessSubmit()) {
        console.log('submit literal widget', this.value());
        /*
        var v = this.value();
        // */

        var somethingChanged = (
          this.statement.hasObject() && (
            // existing statement should have been edited
            this.statement.objectValue() !== this.value() ||
            this.statement.objectLanguage() !== this.lang() ||
            this.statement.objectDatatype() !== this.datatype()
          )
        );

        // new statement must not be empty
        var isNew = !this.statement.hasObject() && (null !== this.value());

        if (somethingChanged || this.removeOnSubmit) {
            //remove
            console.log('remove literal', this.statement.deleteStatementQuery());
            RDFauthorInstance.setUpdateSource('delete', this.statement.asTriple());
            console.log('remove literal triple', this.statement.asTriple());
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
            console.log('add new statement resource', newStatement.insertStatementQuery());
            RDFauthorInstance.setUpdateSource('insert', newStatement.asTriple());
            console.log('new literal triple', newStatement.asTriple());
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
