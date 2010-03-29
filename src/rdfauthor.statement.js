/**
 * Constructs an RDFauthor statement object which encapsulates a statement and 
 * display-specific properties.
 * 
 * @param object statementSpec. Either an instance of $.rdf.triple or RDFA.triple 
 *  or a key-value object with the following keys:
 *  - subject: an Object (value, options), 
 *  - predicate: an Object (value, options), 
 *  - object: an Object (value, options = Object (lang xor datatype)).
 * @param object statementOptions. An object with display-specific options.
 *  The following keys are recognized:
 *  - hidden: Boolean, 
 *  - required: Boolean, 
 *  - protected: Boolean, 
 *  - predicateTitle: String, 
 *  - preferredWidget: reserved for future use.
 */
function Statement(statementSpec, statementOptions) {
    if (statementSpec instanceof $.rdf.triple) {
        // rdfQuery triple, we store the parts directly
        this._subject   = statementSpec.subject;
        this._predicate = statementSpec.property;
        this._object    = statementSpec.object;
    } else if (statementSpec.constructor == 'RDFStatement') {
        // RDFA triple, create rdfQuery truple parts and store them
        this._subject   = $.rdf.resource(statementSpec.subject.uri);
        this._predicate = $.rdf.resource(statementSpec.predicate.uri);
        
        // TODO: blank nodes
        if (statementSpec.object.uri) {
            this._object = $.rdf.resource(statementSpec.object.uri);
        } else {
            var literalOpts = {};
            
            if (statementSpec.object.lang) {
                literalOpts.lang = statementSpec.object.lang;
            } else if (statementSpec.object.datatype) {
                literalOpts.datatype = triple.object.datatype.uri;
                
                // register user-defined datatype
                if (!this.isValidDatatype(literalOpts.datatype)) {
                    this.registerDatatype(literalOpts.datatype);
                }
            }
            
            this._object = $.rdf.literal(statementSpec.object.value, literalOpts);
        }
    } else if (statementSpec.hasOwnProperty('subject') && statementSpec.hasOwnProperty('predicate')) {
        // s, p, o
        // create rdfQuery triple parts and store them
        var subjectSpec = typeof statementSpec.subject == 'object' ? statementSpec.subject.value : statementSpec.subject;
        var subjectOpts = statementSpec.subject.options ? statementSpec.subject.options : null;
        try {
            this._subject = $.rdf.resource(subjectSpec, subjectOpts);
        } catch (e) {
            try {
                this._subject = $.rdf.blank(subjectSpec, subjectOpts);
            } catch (f) {
                // error
                throw 'Invalid subject spec';
            }
        }
        
        var predicateSpec = typeof statementSpec.predicate == 'object' ? statementSpec.predicate.value : statementSpec.predicate;
        var predicateOpts = statementSpec.predicate.options ? statementSpec.predicate.options : null;
        this._predicate = $.rdf.resource(predicateSpec, predicateOpts);
        
        this._object = null;
        // specified object
        if (statementSpec.hasOwnProperty('object') && statementSpec.object) {
            var quote = true;
            var objectSpec = typeof statementSpec.object == 'object' ? statementSpec.object.value : statementSpec.object;
            var objectOpts = statementSpec.object.options ? statementSpec.object.options : null;
            
            if (objectOpts && (objectOpts.hasOwnProperty('lang') || objectOpts.hasOwnProperty('datatype'))) {
                quote = false;
            }
            
            try {
                this._object = $.rdf.resource(objectSpec, objectOpts);
            } catch (e) {
                try {
                    this._object = $.rdf.blank(objectSpec, objectOpts);
                } catch (f) {
                    try {
                        // quote if necessary
                        if (quote) {
                            objectSpec = '"' + objectSpec + '"';
                        }
                        this._object = $.rdf.literal(objectSpec, objectOpts);
                    } catch (g) {
                        // error
                        throw 'Invalid object spec';
                    }
                }
            }
        }
    } else {
        // error
        throw 'Invalid statement spec.';
    }
    
    // statement options
    if (statementOptions) {
        this._hidden         = Boolean(statementOptions.hidden) | false;
        this._required       = Boolean(statementOptions.required) | false;
        this._protected      = Boolean(statementOptions.protected) | false;
        this._predicateLabel = statementOptions.title ? String(statementOptions.title) : String(this._predicate.value);
    } else {
        this._hidden         = false;
        this._required       = false;
        this._protected      = false;
        this._predicateLabel = String(this._predicate.value);
    }
    
    // other members
    this.updateNamespace = 'http://ns.aksw.org/update/';
}

Statement.prototype = {
    /**
     * Returns the statement as an rdfQuery triple object ($.rdf.triple).
     * @return object
     */
    asRdfQueryTriple: function () {
        return $.rdf.triple(this._subject, this._predicate, this._object);
    }, 
    
    /**
     * Returns a string representation of the statement.
     * @return string
     */
    toString: function () {
        return String(this.asRdfQueryTriple());
    }, 
    
    /**
     * Returns whether the statement has its 'hidden' attribute set.
     * @return boolean
     */
    isHidden: function () {
        return this._hidden;
    }, 
    
    /**
     * Returns whether the statement has its 'required' attribute set.
     * @return boolean
     */
    isRequired: function () {
        return this._required;
    }, 
    
    /**
     * Returns whether the statement has its 'protected' attribute set.
     * @return boolean
     */
    isProtected: function () {
        return this._protected;
    }, 
    
    /**
     * Returns true if the statement's predicate stems from the AKSW update 
     * vocabulary (http://ns.aksw.org/update/), false otherwise.
     * @return boolean
     */
    isUpdateVocab: function () {
        return (String(this._predicate.value).search(RegExp('^' + this.updateNamespace)) > -1);
    }, 
    
    /**
     * Denotes whether the statement's object has been set.
     * @return boolean
     */
    hasObject: function () {
        return (null !== this._object);
    }, 
    
    /**
     * Returns the statement's predicate label property or the predicate URI
     * if no label has been set.
     * @return string
     */
    predicateLabel: function () {
        return this._predicateLabel;
    }, 
    
    /**
     * Denotes whether a given datatype is valid (i.e. registered with rdfQuery).
     * @return boolean
     */
    isDatatypeValid: function (datatypeURI) {
        return $.typedValue.types.hasOwnProperty(datatypeURI);
    }, 
    
    /**
     * Registers the supplied datatype with rdfQuery.
     * @param string datatypeURI The URI of the datatype to be registered.
     * @param string regex A RegExp object to test for validity of literal with respect to the datatype.
     * @param boolean strip
     * @param function valueFunction A callback function used for value extraction.
     */
    registerDatatype: function (datatypeURI, regex, strip, valueFunction) {
        $.typedValue.types[datatypeURI] = {
            regex: regex | /^.*$/, 
            strip: strip | false, 
            value: valueFunction | function(v) {return v;}
        }
    }
}

