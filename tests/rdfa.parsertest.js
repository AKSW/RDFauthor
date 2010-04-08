$(document).ready(function() {
    module('rdfa.parser');
    
    asyncTest('parse', 1, function() {
        var numTriples = 0;
        RDFA.CALLBACK_NEW_TRIPLE_WITH_URI_OBJECT = function(e, t, g) {
            numTriples++;
        };
        RDFA.CALLBACK_NEW_TRIPLE_WITH_LITERAL_OBJECT = function(e, t, g) {
            numTriples++;
        }
        RDFA.CALLBACK_DONE_PARSING = function() {
            equal(numTriples, 6);
            start();
        }
        RDFA.parse();
    });
});