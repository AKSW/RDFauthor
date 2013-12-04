/**
 * RDFauthor Default Choreography
 */

RDFauthor.getInstance(function(RDFauthorInstance) {
  RDFauthorInstance.registerChoreography({
    init: function () {
      // run code on create
      this._widgets = [];
    },
    
    getStatementsForPredicate: function (predicateUri) {
      var self = this;
      var matchedStmts = [];
      // console.log('self.statements', self.statements);
      for (var s in self.statements) {
        if (self.statements[s].predicateUri() === predicateUri) {
          matchedStmts.push(self.statements[s]);
        }
      }
      
      console.log('getStatementsForPredicate', matchedStmts);
      return matchedStmts;
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
      
      console.log('statements for choreography', self.statements);
      
      var statementsForMarkup = {};
      for (var subjectUri in subjectData) {
        for (var predicateUri in subjectData[subjectUri]) {
          if (self.partOfChoreography(predicateUri)) {
            var statementForPredicate = self.getStatementsForPredicate(predicateUri);
            if (statementForPredicate.length > 0) {
              statementsForMarkup[predicateUri] = statementForPredicate;
            }
          }
        }
      }
      console.log('statementsForChoreography', self.choreographyUri(), statementsForMarkup);
      
      var propertiesMarkup = '';
      for (var property in statementsForMarkup) {
        console.log('property', property);
        var propertyMarkup = '\
          <div class="panel panel-default">\
            <div class="panel-heading">' + property + '</div>\
            <div class="panel-body">';
        for (var s in statementsForMarkup[property]) {
          var stmt = statementsForMarkup[property][s];
          console.log('stmt', stmt);
          console.log('getCompatibleWidget',RDFauthorInstance.getCompatibleWidgets(stmt));
          var compWidgetsUris = RDFauthorInstance.getCompatibleWidgets(stmt);
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
      
      console.log('propertiesMarkup', propertiesMarkup);
      
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
      type: ['http://xmlns.com/foaf/0.1/person'],
      property: ['http://xmlns.com/foaf/0.1/lastName', 'http://xmlns.com/foaf/0.1/depiction']
    }
  },
  function () {
    // callback
  });
});