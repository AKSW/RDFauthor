/**
 * RDFauthor Resource Widget
 */

RDFauthor.getInstance(function(RDFauthorInstance) {
  RDFauthorInstance.registerWidget({
    init: function () {
      
    },
    
    markup: function () {
      console.log(this.statement);
      var markup = '<div style="margin-bottom: 10px;" class="input-group widget resource">\
              <input type="text" class="form-control" value="' + this.statement.objectValue() + '">\
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
    
    submit: function () {
      
    },
    
    value: function () {
      
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
