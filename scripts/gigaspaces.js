$(window).ready(function () {
    $('.inputTextBox').focusin(function () {
        if (!$(this).hasClass('noBackground')) {
            $(this).addClass('noBackground');
        }
    });

    $('.inputTextBox').focusout(updateTextboxes);


//    var doc = $('.twtr-doc');
//    $(doc)[0].attr('id', 'twitterDoc');
});

updateTextboxes = function () {
    var inputTextBoxs = $('.inputTextBox');
    for (var i = 0; i < inputTextBoxs.length; i++) {
        if ($(inputTextBoxs[i]).val().length == 0 && $(inputTextBoxs[i]).hasClass('noBackground')) {
            $(inputTextBoxs[i]).removeClass('noBackground');
        }
    };
};

function addNewStyle(newStyle) {
    var styleElement = document.getElementById('styles_js');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'styles_js';
        document.getElementsByTagName('head')[0].appendChild(styleElement);
    }
    styleElement.appendChild(document.createTextNode(newStyle));
};

