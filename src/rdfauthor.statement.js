/*
 * This file is part of the RDFauthor project.
 * http://code.google.com/p/rdfauthor
 * Author: Norman Heino <norman.heino@gmail.com>
 */

/**
 * Constructs a Statement object which encapsulates a statement and display-specific properties.
 * 
 * @param statementSpec Either an instance of jQuery.rdf.triple or RDFA.triple or an object 
 * with the following properties:
 * <ul>
 *   <li><code>subject</code> an object (value, options), </li>
 *   <li><code>predicate</code> an object (value, options), </li>
 *   <li><code>object</code> an object (value, options). The <code>options</code> 
 *       object must contain a key named <code>lang</code> or <code>datatype</code>.</li>
 * </ul>
 * @param statementOptions an object with display-specific settings. The following keys are recognized:
 * <ul>
 *   <li><code>hidden</code> boolean, </li>
 *   <li><code>required</code> boolean, </li>
 *   <li><code>protected</code> boolean, </li>
 *   <li><code>predicateTitle</code> string, </li>
 *   <li><code>preferredWidget</code> reserved for future use.</li>
 * </ul>
 *
 * @constructor
 * @requires rdfQuery
 */
function Statement(statementSpec, statementOptions) {
    if (typeof jQuery.rdf.triple != 'undefined' && statementSpec instanceof jQuery.rdf.triple) {
        // rdfQuery triple, we store the parts directly
        this._subject   = statementSpec.subject;
        this._predicate = statementSpec.property;
        this._object    = statementSpec.object;
    } else if (typeof RDFStatement != 'undefined' && statementSpec.constructor == RDFStatement) {
        // RDFA triple, create rdfQuery truple parts and store them
        this._subject   = jQuery.rdf.resource('<' + statementSpec.subject.uri + '>');
        this._predicate = jQuery.rdf.resource('<' + statementSpec.predicate.uri + '>');
        
        // TODO: blank nodes
        if (statementSpec.object.uri) {
            this._object = jQuery.rdf.resource('<' + statementSpec.object.uri + '>');
        } else {
            var literalOpts  = {};
            var quoteLiteral = true;
            
            if (statementSpec.object.lang) {
                literalOpts.lang = statementSpec.object.lang;
                quoteLiteral = false;
            } else if (statementSpec.object.datatype) {
                literalOpts.datatype = statementSpec.object.datatype.uri;
                quoteLiteral = false;
                
                // register user-defined datatype
                if (!this.isDatatypeValid(literalOpts.datatype)) {
                    this.registerDatatype(literalOpts.datatype);
                }
            }
            
            if (quoteLiteral) {
                statementSpec.object.value = '"' + statementSpec.object.value + '"';
            }
            
            this._object = jQuery.rdf.literal(statementSpec.object.value, literalOpts);
        }
    } else if (statementSpec.hasOwnProperty('subject')) {
        // s, p, o
        // create rdfQuery triple parts and store them
        var subjectSpec = typeof statementSpec.subject == 'object' ? statementSpec.subject.value : statementSpec.subject;
        var subjectOpts = statementSpec.subject.options ? statementSpec.subject.options : null;
        try {
            this._subject = jQuery.rdf.resource(subjectSpec, subjectOpts);
        } catch (e) {
            try {
                this._subject = jQuery.rdf.blank(subjectSpec, subjectOpts);
            } catch (f) {
                // error
                throw 'Invalid subject spec';
            }
        }
        
        this._predicate = null;
        if (statementSpec.hasOwnProperty('predicate')) {
            var predicateSpec = typeof statementSpec.predicate == 'object' ? statementSpec.predicate.value : statementSpec.predicate;
            var predicateOpts = statementSpec.predicate.options ? statementSpec.predicate.options : null;
            this._predicate = jQuery.rdf.resource(predicateSpec, predicateOpts);
        }
        
        this._object = null;
        // specified object: if object is given, it must be valid
        if (statementSpec.hasOwnProperty('object') && statementSpec.object) {
            var quote = true;
            var objectSpec = typeof statementSpec.object == 'object' ? statementSpec.object.value : statementSpec.object;
            var objectOpts = statementSpec.object.options ? statementSpec.object.options : null;
            
            if (objectOpts && (objectOpts.hasOwnProperty('lang') || objectOpts.hasOwnProperty('datatype'))) {
                quote = false;
            }
            
            try {
                this._object = jQuery.rdf.resource(objectSpec, objectOpts);
            } catch (e) {
                try {
                    this._object = jQuery.rdf.blank(objectSpec, objectOpts);
                } catch (f) {
                    try {
                        // quote if necessary
                        if (quote) {
                            objectSpec = '"' + objectSpec + '"';
                        }
                        this._object = jQuery.rdf.literal(objectSpec, objectOpts);
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
    
    // statement options and defaults
    statementOptions = statementOptions != undefined ? statementOptions : {};
    this._hidden     = statementOptions.hidden != undefined ? Boolean(statementOptions.hidden) : false;
    this._required   = statementOptions.required != undefined ? Boolean(statementOptions.required) : false;
    this._protected  = statementOptions.protected != undefined ? Boolean(statementOptions.protected) : false;
    this._graph      = statementOptions.graph != undefined ? String(statementOptions.graph) : null;
    
    // the human-readable string representing the property 
    if (statementOptions.title && typeof statementOptions.title == 'string' && '' != statementOptions.title) {
        this._predicateLabel = statementOptions.title;
    } else {
        if (String(this._predicate.value).lastIndexOf('#') > -1) {
            this._predicateLabel = String(this._predicate.value).substr(String(this._predicate.value).lastIndexOf('#') + 1);
        } else {
            this._predicateLabel = String(this._predicate.value).substr(String(this._predicate.value).lastIndexOf('/') + 1);
        }
    }
}

Statement.prototype = {
    /**
     * Update vocabulary namespace.
     * @type {string}
     */
    updateNS: 'http://ns.aksw.org/update/', 
    
    /**
     * Namespaces that are ignored (not display, not editable).
     * @type {array}
     */
    ignoreNS: ['http://www.w3.org/1999/xhtml/vocab#'], 
    
    /**
     * Returns the statement as an rdfQuery triple object (jQuery.rdf.triple).
     * @return {object}
     */
    asRdfQueryTriple: function () {
        return jQuery.rdf.triple(this._subject, this._predicate, this._object);
    }, 
    
    /**
     * Returns a new statement based on the current statement where the object is changed
     * 
     */
    copyWithObject: function (objectSpec) {
        var copy = new Statement({
            subject: '<' + this.subjectURI() + '>', 
            predicate: '<' + this.predicateURI() + '>', 
            object: objectSpec
        }, {
            hidden: this.isHidden(), 
            ignored: this.isIgnored(), 
            required: this.isRequired(), 
            protected: this.isProtected(), 
            graph: this.graphURI(), 
            title: this.predicateLabel()
        });
        
        return copy;
    }, 
    
    /**
     * Returns a string representation of the statement.
     * @return {string}
     */
    toString: function () {
        return String(this.asRdfQueryTriple());
    }, 
    
    /**
     * Returns a string that uniquelly identifies this statement's parts.
     * @return {string}
     */
    hash: function () {
        
    },
    
    /**
     * Returns whether the statement has its 'hidden' attribute set.
     * @return {boolean}
     */
    isHidden: function () {
        return this._hidden;
    }, 
    
    /**
     * Denotes whether the statement's predicate is from an ignored namespace.
     * @return {boolean}
     */
    isIgnored: function () {
        if (undefined === this.ignored) {
            this.ignored = false;
            
            for (var i in this.ignoreNS) {
                if (String(this._predicate.value).search(RegExp('^' + this.ignoreNS[i])) > -1) {
                    this.ignored = true;
                    break;
                }
            }
        }
        
        return this.ignored;
    }, 
    
    /**
     * Returns whether the statement has its 'required' attribute set.
     * @return {boolean}
     */
    isRequired: function () {
        return this._required;
    }, 
    
    /**
     * Returns whether the statement has its 'protected' attribute set.
     * @return {boolean}
     */
    isProtected: function () {
        return this._protected;
    }, 
    
    /**
     * Returns true if the statement's predicate stems from the AKSW update 
     * vocabulary (http://ns.aksw.org/update/), false otherwise.
     * @return {boolean}
     */
    isUpdateVocab: function () {
        return (String(this._predicate.value).search(RegExp('^' + this.updateNS)) > -1);
    }, 
    
    /**
     * Denotes whether the statement's object has been set.
     * @return {boolean}
     */
    hasObject: function () {
        return (null !== this._object);
    }, 
    
    /**
     * Returns the graph to which this statement belongs or null.
     * @return {String|null}
     */
    graphURI: function () {
        return String(this._graph);
    }, 
    
    /**
     * Returns the subject of this statement.
     * @return {string}
     */
    subjectURI: function () {
        return String(this._subject.value);
    }, 
    
    /**
     * Returns the statement's predicate label property or the predicate URI
     * if no label has been set.
     * @return {string}
     */
    predicateLabel: function () {
        return String(this._predicateLabel);
    }, 
    
    /**
     * Returns the predicate of this statement.
     * @return {string}
     */
    predicateURI: function () {
        return String(this._predicate.value);
    }, 
    
    /**
     * Returns the datatype of the statement's literal object (if any) or null.
     * @return {string}
     */
    objectDatatype: function () {        
        if (this.hasObject()) {
            if (this._object.datatype) {
                return String(this._object.datatype);
            }
        }
        
        return null;
    }, 
    
    /**
     * Returns the language of the statement's literal object (if any) or null.
     * @return {string}
     */
    objectLang: function () {
        if (this.hasObject()) {
            if (this._object.lang) {
                return String(this._object.lang);
            }
        }
        
        return null;
    }, 
    
    /**
     * Returns the type of the statement's object.
     * For a URI object the string 'uri' is returned, for a literal
     * object, 'literal'.
     * @return {string}
     */
    objectType: function() {
        if (this.hasObject()) {
            if (this._object instanceof jQuery.rdf.resource) {
                return 'uri';
            } else {
                return 'literal';
            }
        }
    },
    
    /**
     * Returns the object of this statement.
     * @return {string}
     */
    objectValue: function() {
        if (this.hasObject()) {
            return String(this._object.value);
        }
        
        return null;
    }, 
    
    /**
     * Denotes whether a given datatype is valid.
     * Valid datatypes are the standard RDF datatypes or user-defined datatypes that have
     * explicitely been registered (see {@link Statement#registerDatatype}).
     * @param {string} datatypeURI
     * @return {boolean}
     */
    isDatatypeValid: function (datatypeURI) {
        return jQuery.typedValue.types.hasOwnProperty(datatypeURI);
    }, 
    
    /**
     * Registers the supplied datatype with rdfQuery.
     * @param {string} datatypeURI The URI of the datatype to be registered
     * @param {RegExp} regex A RegExp object to test for validity of literal with respect to the datatype
     * @param {boolean} strip
     * @param {function} valueFunction A callback function used for value extraction
     */
    registerDatatype: function (datatypeURI, regex, strip, valueFunction) {
        jQuery.typedValue.types[datatypeURI] = {
            regex: regex | /^.*$/, 
            strip: strip | false, 
            value: valueFunction | function(v) {return v;}
        }
    }
}

