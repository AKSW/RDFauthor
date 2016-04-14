var __config = {
    /**
     * RDfauthor Widget Configurations
     *
     * -- required
     * - path
     * - enable/disable widgets
     * - set hook object
     *
     * -- optional
     * - title
     */
    'widgets' : {
        /*------------------------------- xmlliteral ----------------------------------*/
        'xmlliteral' : {
            'path' : 'src/widget.xmlliteral.js',
            'enabled' : true,
            'hook' : [{
                name: 'range',
                values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
            }, {
                name: 'datatype',
                values: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral']
            }]
        },
        /*--------------------------------- HTML --------------------------------------*/
        'html' : {
            'path' : 'src/widget.html.js',
            'enabled' : true,
            'hook' : [{
                name: 'range',
                values: ['http://ns.ontowiki.net/SysOnt/HTML']
            }, {
                name: 'datatype',
                values: ['http://ns.ontowiki.net/SysOnt/HTML']
            }]
        },
        /*------------------------------- datetime ------------------------------------*/
        'datetime' : {
            'path' : 'src/widget.datetime.js',
            'enabled' : true,
            'hook' : [{
                name: 'datatype',
                values: ['http://www.w3.org/2001/XMLSchema#dateTime',
                         'http://www.w3.org/2001/XMLSchema#date',
                         'http://www.w3.org/2001/XMLSchema#time'],
                callback : function () {
                    $.typedValue.types['http://www.w3.org/2001/XMLSchema#time'] = {
                        regex: /^.*$/,
                        strip: true,
                        /** @ignore */
                        value: function (v, options) {
                            var opts = $.extend({}, $.typedValue.defaults, options);
                            return v;
                        }
                    };
                    $.typedValue.types['http://www.w3.org/2001/XMLSchema#dateTime'] = {
                        regex: /^.*$/,
                        strip: true,
                        /** @ignore */
                        value: function (v, options) {
                            var opts = $.extend({}, $.typedValue.defaults, options);
                            return v;
                        }
                    };
                }
            }, {
                name: 'property',
                values: [
                    'http://purl.org/dc/elements/1.1/issued',
                    'http://purl.org/dc/elements/1.1/modified',
                    'http://purl.org/dc/terms/created',
                    'http://purl.org/dc/terms/modified',
                    'http://vocab.ox.ac.uk/projectfunding#startDate',
                    'http://vocab.ox.ac.uk/projectfunding#endDate',
                    'http://schema.org/availabilityEnds',
                    'http://schema.org/availabilityStarts',
                    'http://schema.org/birthDate',
                    'http://schema.org/commentTime',
                    'http://schema.org/dateCreated',
                    'http://schema.org/dateModified',
                    'http://schema.org/datePosted',
                    'http://schema.org/datePublished',
                    'http://schema.org/deathDate',
                    'http://schema.org/endDate',
                    'http://schema.org/expires',
                    'http://schema.org/foundingDate',
                    'http://schema.org/guidelineDate',
                    'http://schema.org/lastReviewed',
                    'http://schema.org/ownedFrom',
                    'http://schema.org/ownedThrough',
                    'http://schema.org/priceValidUntil',
                    'http://schema.org/releaseDate',
                    'http://schema.org/startDate',
                    'http://schema.org/uploadDate',
                    'http://schema.org/validFrom',
                    'http://schema.org/validThrough'
                ]
            }]
        },
        /*--------------------------------- mailto ------------------------------------*/
        'mailto' : {
            'path' : 'src/widget.mailto.js',
            'enabled' : true,
            'hook' : {
                type: 'ObjectProperty',
                name: 'property',
                values: ['http://xmlns.com/foaf/0.1/mbox',
                         'http://rdfs.org/sioc/ns#email',
                         'http://usefulinc.com/ns/doap#mailing-list']
            }
        },
        /*---------------------------------- tel --------------------------------------*/
        'tel' : {
            'path' : 'src/widget.tel.js',
            'enabled' : true,
            'hook' : {
                type: 'ObjectProperty',
                name: 'property',
                values: ['http://xmlns.com/foaf/0.1/phone',
                         'http://purl.org/net/ldap#mobile',
                         'http://purl.org/net/ldap#homePhone',
                         'http://purl.org/net/ldap#telephoneNumber',
                         'http://purl.org/net/ldap#fax']
            }
        },
        /*---------------------------------- geo --------------------------------------*/
        'geo' : {
            'path' : 'src/widget.geo.js',
            'enabled' : true,
            'hook' : {
                name: 'property',
                values: ['http://www.w3.org/2003/01/geo/wgs84_pos#long',
                         'http://www.w3.org/2003/01/geo/wgs84_pos#lat']
            }
        },
        /*------------------------------- markdown ------------------------------------*/
        'markdown' : {
            'path' : 'src/widget.markdown.js',
            'enabled' : true,
            'hook' : [
            {
                name: 'property',
                values: ['http://www.w3.org/2000/01/rdf-schema#comment',
                         'http://purl.org/dc/terms/description',
                         'http://purl.org/dc/elements/1.1/description',
                         'http://www.w3.org/2004/02/skos/core#note',
                         'http://www.w3.org/2004/02/skos/core#editorialNote',
                         'http://ns.ontowiki.net/SysOnt/Site/content']
            },
            {
                name: 'datatype',
                values: ['http://ns.ontowiki.net/SysOnt/Markdown'],
                callback : function () {
                    $.typedValue.types['http://ns.ontowiki.net/SysOnt/Markdown'] = {
                        regex: /.*/,
                        strip: false,
                        /** @ignore */
                        value: function (v, options) {
                            var opts = $.extend({}, $.typedValue.defaults, options);
                            return v;
                        }
                    };
                }
            }]
        },

        'treeselector' : {
            'path' : 'src/widget.treeselector.js',
            'enabled' : true,
            'hook' : {
                name: 'property',
                values: ['http://foo.bar/treeselector']
            }
        }
    }
}
