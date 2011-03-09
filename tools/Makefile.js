var files = [
    // 'libraries/jquery-ui.js', 
    'libraries/jquery.rdfquery.core.js',
    'libraries/jquery.json.js',
    'libraries/rdfa.js',
    'src/rdfauthor.statement.js',
    'src/rdfauthor.predicaterow.js',
    'src/rdfauthor.selector.js',
    'src/rdfauthor.subjectgroup.js',
    'src/rdfauthor.popovercontroller.js',
    'src/rdfauthor.mobilecontroller.js',
    'src/rdfauthor.inlinecontroller.js',
    'src/widget.prototype.js',
    'src/widget.literal.js',
    'src/widget.resource.js',
    'src/widget.meta.js',
    'src/widget.xmlliteral.js',
    'src/widget.date.js',
    'src/widget.mailto.js',
    'src/widget.tel.js',
    'src/rdfauthor.cache.js',
    'src/rdfauthor.js'
];

var uglify = require('uglify-js'), 
    fs     = require('fs'),
    util   = require('util');

var baseDir = fs.realpathSync(__dirname + '/..');

var combined = '';
files.forEach(function (f) {
    combined += fs.readFileSync(baseDir + '/' + f);
});

fs.writeFileSync('rdfauthor.combined.js', combined);

