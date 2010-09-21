function InlineController(options) {
    // unique subjects
    this._subjects     = {};
    this._subjectCount = 0;
}

InlineController.prototype = {
    addWidget: function (statement, constructor) {
        var graphURI     = statement.graphURI();
        var subjectURI   = statement.subjectURI();
        var subjectGroup = this.getSubjectGroup(graphURI, statement);
        
        return subjectGroup.addWidget(statement, constructor);
    }, 
    
    getSubjectGroup: function (graphURI, statement) {
        var subjectGroup;
        var subjectURI   = statement.subjectURI();
        var predicateURI = statement.predicateURI();
        var index        = subjectURI + predicateURI;
        
        if (undefined !== this._subjects[index]) {
            subjectGroup = this._subjects[index];
        } else {
            subjectGroup = new SubjectGroup(
                graphURI, 
                subjectURI, 
                subjectURI, 
                this.getContentContainer(statement), 
                RDFauthor.nextID(), 
                {showLabels: false});
            
            this._subjects[index] = subjectGroup;
            this._subjectCount++;
            
            // save the first group as the initially active group
            if (null === this.activeSubject) {
                this.activeSubject = subjectURI;
            }
        }
        
        return subjectGroup;
    }, 
    
    activeSubjectGroup: function () {
        if (null === this.activeSubject) {
            this.activeSubject = RDFauthor.defaultSubjectURI();
            var activeGraph = RDFauthor.defaultGraphURI();
            var subjectGroup = this.getSubjectGroup(activeGraph, this.activeSubject);
        }
        
        return this.subjectGroup(this.activeSubject);
    }, 
    
    getContentContainer: function (statement) {
        var element = RDFauthor.elementForStatement(statement);
        return $(element).parent();
    }, 
    
    getElement: function () {
        return null;
    }, 
    
    subjectGroup: function (subjectURI) {
        return this._subjects[subjectURI];
    }, 
    
    cssID: function () {
        return '';
    }, 
    
    numberOfSubjects: function () {
        return this._subjectCount;
    }, 
    
    position: function () {
        
    }, 
    
    reset: function () {
        
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