var RDFAUTHOR_CONFIG = {
  'widgets': {
    'date': {
      'src': 'rdfauthor.widget.date.js',
      'enabled': true,
      'hook': {
        'datatype': [
          'http://www.w3.org/2001/XMLSchema#date'
        ],
        'property': [
          'http://xmlns.com/foaf/0.1/birthday'
        ]
      }
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
      'enabled': true,
      'hook': {
        'property': [
          'http://xmlns.com/foaf/0.1/mbox', 
          'http://rdfs.org/sioc/ns#email', 
          'http://usefulinc.com/ns/doap#mailing-list'
        ]
      }
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
    'default': {
      'src': 'rdfauthor.choreography.default.js'
    }
  } // end of choreogprahies
} // end of RDFAUTHOR_CONFIG