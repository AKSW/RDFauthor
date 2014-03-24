var RDFAuthorTools = {

    updateStatus: function (element, success) {
        if (success) {
            html = ' <span class="update-status update-OK">&#x2713; OK</span>';
        }
        else {
            html = ' <span class="update-status update-failure">&#x2717; Error</span>';
            element = $(element).addClass("strikeThrough");
            element = $('<div>').append($(element).clone()).html();
        }

        newElement = element + html;

        setTimeout(function(){
                    $(".update-status").fadeOut("fast", function () { $(this).remove(); });
                    }, 3000);

        return newElement;
    }
}
