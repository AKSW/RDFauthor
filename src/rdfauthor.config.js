var RDFAUTHOR_CONFIG = {
  'widgets': {
    'date': {
      'src': 'rdfauthor.widget.date.js',
      'enabled': true
    },
    'datetime': {
      'src': 'rdfauthor.widget.datetime.js',
      'enabled': false
    },
    'geo': {
      'src': 'rdfauthor.widget.geo.js',
      'enabled': false
    },
    'mailto': {
      'src': 'rdfauthor.widget.mailto.js',
      'enabled': true
    },
    'markdown': {
      'src': 'rdfauthor.widget.markdown.js',
      'enabled': false
    },
    'picture': {
      'src': 'rdfauthor.widget.picture.js',
      'enabled': false
    },
    'tel': {
      'src': 'rdfauthor.widget.tel.js',
      'enabled': false
    },
    'time': {
      'src': 'rdfauthor.widget.time.js',
      'enabled': false
    }
  }, // end of widgets 
  'choreographies': {
    'http://aksw.org/Projects/RDFauthor/localChoreography#foaf': {
      'src': 'rdfauthor.choreography.foaf.js',
      'enabled': true,
      'property': [
        'http://xmlns.com/foaf/0.1/name',
        'http://xmlns.com/foaf/0.1/surname',
        'http://xmlns.com/foaf/0.1/knows',
        'http://xmlns.com/foaf/0.1/currentProject',
        'http://xmlns.com/foaf/0.1/depiction']
    }
  } // end of choreogprahies
} // end of RDFAUTHOR_CONFIG