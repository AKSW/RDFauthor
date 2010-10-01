function InlineController(options) {
    // default options
    var defaultOptions = {
        useAnimations: true, 
        animationTime: 250, // ms
    };
    
    // overwrite defaults if supplied
    this._options = jQuery.extend(defaultOptions, options);
    
    // rows by (s,p,o) key
    this._rows     = {};
    this._rowsByID = {};
    
    this.addWidget = function (statement, constructor) {
        var predicateURI = statement.predicateURI();
        var rowID = RDFauthor.nextID();
        var rowKey = String(statement);
        
        // TODO: move to callback
        var element = $(this.getContentElement(statement)).parent().empty().get(0);
        var row = new PredicateRow(statement.subjectURI(), 
                                   statement.predicateURI(), 
                                   null, 
                                   element, 
                                   rowID);
        
        this._rows[rowKey] = row;
        this._rowsByID[rowID] = row;
        this._rowCount++;
        
        return row.addWidget(statement, constructor);
    }
}

InlineController.prototype = {    
    getContentElement: function (statement) {
        var element = RDFauthor.elementForStatement(statement);
        return element;
    }, 
    
    reset: function () {
        
    }, 
    
    submit: function () {
        var submitOk = true;
        for (var index in this._rows) {
            submitOk &= this._rows[index].submit();
        }
        
        return submitOk;
    }, 
    
    cancel: function () {
        for (var index in this._rows) {
            result &= this._rows[index].cancel();
        }
    },
    
    show: function (animated) {
        for (var index in this._subjects) {
            var group = this._subjects[index];
            $(group.getElement()).parent().children().hide();
            group.show();
        }
    }, 
    
    hide: function (animated, callback) {
        for (var index in this._subjects) {
            var group = this._subjects[index];
            $(group.getElement()).parent().children().show();
            group.hide();
        }
    }
}