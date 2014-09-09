var __i18n = {

    // Popover controller

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
        'de' : 'Neue Instanz vom Typ %1 anlegen'
    },

    'editResource' : {
        'en' : 'Edit Resource %1',
        'de' : 'Ressource %1 editieren'
    },

    // Add property widget

    'Suggested Properties' : {
        'en' : 'Suggested Properties',
        'de' : 'Vorgeschlagene Eigenschaften'
    },

    'In use elsewhere' : {
        'en' : 'In use elsewhere',
        'de' : 'Bei anderen Ressourcen verwendet'
    },

    'elsewhereHelpText' : {
        'en' : 'These properties are currently in use at other resources of the same class(es).',
        'de' : 'Diese Eigenschaften werden momentan bei anderen Ressourcen der gleichen Klasse benutzt.'
    },

    'Template Properties' : {
        'en' : 'Properties from template',
        'de' : 'Eigenschaften aus dem Template'
    },

    'templatePropertiesHelpText' : {
        'en' : 'These properties are pre-selected by a template.',
        'de' : 'Diese Eigenschaften wurden durch ein Template vorausgewählt.'
    },

    'Generally applicable': {
        'en' : 'Generally applicable',
        'de' : 'Allgemein anwendbar'
    },

    'generallyHelpText' : {
        'en' : 'These properties are generally applicable to all resources.',
        'de' : 'Diese Eigenschaften sind allgemein für alle Ressourcen anwendbar.'
    },

    // resource widget

    'Filter by' : {
        'en' : 'Filter by',
        'de' : 'Einschränken auf'
    },

    // literal widget

    'Toggle details' : {
        'en' : 'Toggle details disclosure',
        'de' : 'Details ein-/ausblenden'
    },

    'Plain' : {
        'en' : 'Plain',
        'de' : 'Einfach'
    },

    'Typed' : {
        'en' : 'Typed',
        'de' : 'Ausgezeichnet'
    },

    'Language' : {
        'en' : 'Language',
        'de' : 'Sprache'
    },

    'none' : {
        'en' : 'none',
        'de' : 'keine'
    },

    'literalHint' : {
        'en' : 'Shift+Enter for line break - Enter for submitting changes',
        'de' : 'Shift+Enter für Zeilenumbruch - Enter zum Abschicken der Änderungen'
    },

    // predicate row

    'remove widget' : {
        'en' : 'Remove widget and data.',
        'de' : 'Eingabefeld und Daten entfernen'
    },

    'add widget' : {
        'en' : 'Add another widget of the same type.',
        'de' : 'weiteres Eingabefeld des gleichen Typs hinzufügen'
    },

    // info texts

    'Reload suggested' : {
        'en' : 'Changes to the resource type suggests a reload',
        'de' : 'Nach Änderungen am Typ der Ressource ist ein Neuladen empfehlenswert.'
    }

}

var _translate = function (key) {
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

