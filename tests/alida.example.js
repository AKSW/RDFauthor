var subjectList = [];
var facetList = [];
var valueList = [];

// Ein Result könnte so aussehen:
var r = {
    subjects: [/* ... */],          /* Array mit subjekten */
    queryTime: 123,                 /* Ausführungszeit */
    query: 'SELECT ?s FROM ...',    /* Query die benutzt wurde */
    facets: function () {
        // Wenn das Subjekt innerhalb von Alida erzeugt wird, 
        // könntest du hier auch private Methoden aufrufen
        return Alida.facetsForSubject(this.uri);
    }, 
    filter: function (facet, /*value, array, undefined */ values) {
        if ($.isArray(values)) {
            // array
        } else {
            // kein array
        }
        
        return result;
    }
    /* Eventuell weitere informationen aus Alida */
};

// Ein Subjekt könnte so aussehen
//var s = {
//    uri: 'http://example.com/ttt',  /* Subjekt-URI */
//    valueForFacet: function (f) {
//        // Hier könntest du auf die interne Alida-Hashmap für Facetten
//        // zugreifen. Alternativ speichert jedes Subjekt seine Facetten, 
//        // nachdem einmal drauf zugegriffen wurde
//        return this.facets()[f].values;
//    }
//};

// Eine Facette könnte so aussehen:
var f = {
    subject: s,                         /* Subject zu der die Facette gehört */
    uri: 'http://example.com/facet1',   /* Facetten-URI */
    values: function () {
        /* 
         * Auch hier wieder mehrere Möglichkeiten:
         * - private Alida-Methode
         * - öffentliche (statische) Alida-Methode (braucht dann alle Parameter, 
         *   um Zustand widerherzustellen)
         */
        // statisch: 
        return Alida.valuesForSubjectAndFacet(this.s, this.uri);
        
        // privat:
        // wurde in Alida definiert und benutzt s und f.uri als die dort bekannt waren
        // und dann in das f-Objekt eingebaut wurden
        return _values();
    }
};

// Ein Value könnte so aussehen:
var v = {
    type: 'literal',    /* Typ */
    value: 'ttt',       /* Wert */
    lang: 'en'          /* Sprache oder Datentyp */
    facet: f,           /* Facette zu der das Value gehört */
    values: function () {
        return Alida.valuesForSubjectAndFacet(this.s, this.uri);
    }
};

// Get result from ALiDa
Alida.query('ttt', function (result) {
    for (var subject in result.subjects) {
        
        // make list of all subjects
        // an item if that list is the original subject
        // from alida + an added onclick handler
        subjectList.push($.extend({}, s, {
            
            // will be called by the gui when user clicks
            // on a subject
            onclick: function (s) {
                
                // user has clicked on a subject
                // now show all facets
                for (var f in s.facets()) {
                    
                    // make list of facets
                    facetList.push({
                        uri: f.uri, 
                        label: f.label, 
                        onclick: function (f) {
                            
                            // user has clicked on a facet
                            // make list of all possible values
                            for (var v in f.values()) {
                                valueList.push($.extend({}, v, {
                                    onclick: function (v) {
                                        
                                        // user has clicked on a value
                                        // remove all subjects from subject list
                                        // that do not have a value of v for
                                        // facet f
                                        var newList = [];
                                        for (var i = 0; 0 < subjectList.length; ++i) {
                                            var current = subjectList[i];
                                            
                                            if (current.value === v) {
                                                newList.push(current);
                                            }
                                            
                                            // replace old list
                                            // and show new (refined) list to the user
                                            subjectList = newList;
                                        }
                                    }
                                }));
                            }
                        }
                    });
                }
            }
        });
    }
});