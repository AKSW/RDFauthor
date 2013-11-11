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
      var propertyHooks = self.propertyHooks();
      console.log('propertyHooks', propertyHooks);
      
      // default
      if (propertyHooks.length === 0) {
        return true;
      }
      
      // check if resource property is hook of choreo property
      for (var i in propertyHooks) {
        if (property == propertyHooks[i]) {
          return true;
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
    
    propertyHooks: function () {
      return [];
    },
    
    ready: function () {
      
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
      return 'Default';
    },
    
    value: function () {
      
    },
    
    choreographyUri: function () {
      return 'http://aksw.org/Projects/RDFauthor/localChoreography#default';
    }
  }, 
  {
    // hooks
    hook: {
      // empty indicates default choreo
    }
    // hook: {
      // type : ['http://xmlns.com/foaf/0.1/person']
    // }
  },
  function () {
    // callback
  });
});

// <div name="' + self.choreographyUri() + '" class="col-md-5 portlet">\
          // <!-- Navbar -->\
          // <div class="navbar navbar-fixed-top portlet-navbar" style="position: absolute;">\
            // <div class="navbar-inner">\
              // <div class="container" style="width: auto; padding: 0 20px;">\
                // <a class="brand" href="#">' + self.title() + '</a>\
                // <ul class="nav actionbar pull-right">\
                  // <li class="dropdown">\
                    // <a href="#" class="dropdown-toggle settings" data-toggle="dropdown"><i class="icon-cog"></i></a>\
                    // <ul class="dropdown-menu">\
                      // <li><a class="hide-show hide-show-portlet" href="#"><i class="icon-arrow-up" style="padding-right: 5px;"></i>Hide/Show</a></li>\
                      // <li><a class="remove remove-portlet disabled" href="#"><i class="icon-trash" style="padding-right: 5px;"></i>Remove Portlet</a></li>\
                      // <li><a class="add add-portlet" href="#"><i class="icon-plus-sign" style="padding-right: 5px;"></i>Add Property</a></li>\
                      // <li><a class="rename rename-portlet disabled" href=#"><i class="icon-pencil" style="padding-right: 5px;"></i>Rename Portlet</a></li>\
                    // </ul>\
                  // </li>\
                // </ul>\
              // </div>\
            // </div>\
          // </div>\
          // <!-- Portlet Content -->\
          // <div class="portlet-content">\
          // </div>\
        // </div>\