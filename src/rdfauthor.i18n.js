var __i18n = {
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
    'Cancel' : {
        'en' : 'Cancel',
        'de' : 'Abbrechen'
    },

    'Create Resource' : {
        'en' : 'Create Resource',
        'de' : 'Instanz anlegen'
    },

    'Add Property' : {
        'en' : 'Add Property',
        'de' : 'Eigenschaft hinzufügen'
    },

    'Save Changes' : {
        'en' : 'Save Changes',
        'de' : 'Änderungen speichern'
    },

    'createNewInstanceOf' : {
        'en' : 'Create New Instance Of %1',
        'de' : 'Neue Ressource vom Typ %1 anlegen'
    },

    'editResource' : {
        'en' : 'Edit Resource %1',
        'de' : 'Ressource %1 editieren'
    }
}

var _translate = function (key) {
    console.log("Translating", key);
    var args = [];
    if (Object.prototype.toString.call(key) === '[object Array]') {
       args = key.slice(1);
       key = key[0];
    }

    if(key in __i18n && RDFAUTHOR_LANGUAGE in __i18n[key]) {
        var translation = __i18n[key][RDFAUTHOR_LANGUAGE];
        for(var i = 0; i < args.length; i++) {
            translation = translation.replace('%' + (i+1), args[i]);
        }
        return translation;
    }
    else {
        return key;
    }
}

