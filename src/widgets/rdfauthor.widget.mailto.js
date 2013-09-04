/**
 * RDFauthor Mailto Widget
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
      return 'http://aksw.org/Projects/RDFauthor/local#mailto';
    }
  }, {
    'hook': {
      'property': [
        'http://xmlns.com/foaf/0.1/mbox', 
        'http://rdfs.org/sioc/ns#email', 
        'http://usefulinc.com/ns/doap#mailing-list'
      ]
    }
  }, function () {
    // callback
  });
});
