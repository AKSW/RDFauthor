/**
 * Constructs an RDFauthor statement object which encapsulates a statement and 
 * display-specific properties.
 * 
 *
 * @param Object subjectOrTriple
 * @param Object predicate
 * @param Object object
 */
function Statement(statementSpec, statementOptions) {
    if (statementSpec.hasOwnProperty('')) {
        
    }
    
    
    
    if (arguments.length === 3) {
        // s, p, o
    } else if (arguments.length === 1) {
        // triple
        if (subjectOrTriple instanceof $.rdf.triple) {
            // rdfQuery triple
        } else {
            // assume RDFA triple
        }
    } else {
        throw 'Invalid arguments.';
    }
    
    this.hidden = Boolean(statementSpec.hidden) | false;
    this.required = Boolean(statementSpec.required) | false;
    this.protected = Boolean(statementSpec.protected) | false;
    this.predicateTitle = String(statementSpec.title) | this.predicate.uri;
}

Statement.prototype = {
    
}