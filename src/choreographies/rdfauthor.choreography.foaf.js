/**
 * RDFauthor Default Choreography
 */

RDFauthor.getInstance(function(RDFauthorInstance) {
  RDFauthorInstance.registerChoreography({
    init: function () {
      // run code on create
      this._widgets = [];
    },
    
    /**
     * Is the subjectData compatible with this choreography 
     * @param {Object} property
     */
    partOfChoreography: function (property) {
      var self = this;
      var properties = self.getProperties();
      
      if (properties != undefined) {
        console.log('propertyHooks', properties);
        
        // default
        if (properties.length === 0) {
          return true;
        }
        
        // check if resource property is hook of choreo property
        for (var i in properties) {
          if (property == properties[i]) {
            return true;
          }
        }
      }
      
      // not part of choreography
      return false;
    },
    
    markup: function (subjectData) {
      console.log('subjectData markup', subjectData);
      var self = this;
      
      var propertiesMarkup = '';
      for (var subject in subjectData) {
        for (var property in subjectData[subject]) {
          console.log(property);
          var propertyMarkup = $('<div class="panel panel-default"></div>')
            .append('<div class="panel-heading">' + property + '</div>')
            .append('<div class="panel-body"></div>')
            .append('<div class="panel-footer"></div>');
          var propertyMarkup = '\
            <div class="panel panel-default">\
              <div class="panel-heading">' + property + '</div>\
              <div class="panel-body">';
              
          
          for (var object in subjectData[subject][property]) {
            console.log(subjectData[subject][property][object]);
            var o = subjectData[subject][property][object];
            var value = o.value;
            
            var stmtSpec = {
              subject: subject,
              predicate: property,
              object: o
            }
            
            var stmt = new Statement(stmtSpec);
            
            console.log('stmt', stmt);
            
            
            console.log('stmt predicate label', stmt.predicateLabel());
            
            console.log('getCompatibleWidget',RDFauthorInstance.getCompatibleWidgets(stmt));
            
            var compWidgetsUris = RDFauthorInstance.getCompatibleWidgets(stmt);
            
            console.log('compWidgetInstance', RDFauthorInstance.getWidgetForUri(compWidgetsUris[0]));
            
            var widget = RDFauthorInstance.getWidgetForUri(compWidgetsUris[0], stmt);
            
            
            self._widgets.push(widget);
            
            // init widget
            widget.init();
            
            console.log('widgetMarkup', widget.markup());
            
            propertyMarkup += widget.markup();
          }
          
          propertyMarkup += '</div>\
              <!--div class="panel-footer">Panel footer</div-->\
            </div>\
          ';
          
          propertiesMarkup += propertyMarkup;
        }
      }
      
      console.log(propertiesMarkup);
      
      var markup = '\
        <div class="rdfauthor-portlet panel panel-default">\
          <div class="panel-heading">' + self.title() + '</div>\
          <div class="panel-body">\
            ' + propertiesMarkup + '\
          </div>\
          <!--div class="panel-footer">Panel footer</div-->\
        </div>\
      ';
      return markup;
    },
    
    getProperties: function () {
      return this._properties;
    },
    
    ready: function () {
      var self = this;
      // call ready for widgets
      for (var w in self._widgets) {
        self._widgets[w].ready();
      }
    },
    
    submit: function () {
      var self = this;
      var submitOk = true;
      for (var w in self._widgets) {
        var submitWidgetOk = self._widgets[w].submit();
        console.log('submit widget', submitWidgetOk);
        submitOk &= submitWidgetOk;
      }
      return submitOk;
    },
    
    title: function () {
      return 'FOAF';
    },
    
    value: function () {
      
    },
    
    choreographyUri: function () {
      return 'http://aksw.org/Projects/RDFauthor/localChoreography#foaf';
    }
  }, 
  {
    // hooks
    hook: {
      // if resource has type foaf:person then use this choreo if it is enabled (config)
      type: ['http://xmlns.com/foaf/0.1/person']
    }
  },
  function () {
    // callback
  });
});