/**
 * RDFauthor Date Widget
 */

RDFauthor.getInstance(function(RDFauthorInstance) {
  RDFauthorInstance.registerWidget({
    init: function () {
      
    },
    
    markup: function () {
      
    },
    
    ready: function () {
      
    },
    
    submit: function () {
      
    },
    
    value: function () {
      
    },
    
    widgetUri: function () {
      return 'http://aksw.org/Projects/RDFauthor/local#date';
    }
  }, {
    hook: {
      datatype: [
        'http://www.w3.org/2001/XMLSchema#date'
      ],
      property: [
        'http://xmlns.com/foaf/0.1/birthday'
      ]
    }
  }, function () {
    // callback
  });
});
