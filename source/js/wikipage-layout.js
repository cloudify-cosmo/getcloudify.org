$(function() {
    initWikiPageLayout();
});

function initWikiPageLayout() {
    $('#edit-on-github').click(function (e) {
        var path = location.pathname;
        var repo = "https://github.com/cloudify-cosmo/getcloudify.org";
        //handling directories 

        if (path.indexOf("/", path.length - 1) !== -1) path = path.slice(0, -1);
        if (path.indexOf(".html") == -1) path += "/index.html";
        //2.x guide use textile 
        var markdownFile;
        if (path.indexOf("/guide/2.") != -1) {
            markdownFile = path.replace(".html", ".textile");
        } else {
            markdownFile = path.replace(".html", ".md");
        }
        location.href = repo + "/edit/master/source" + markdownFile + "#";
    });


    var githubPopupPresented = localStorage.getItem('githubPopupPresented');
    var githubPopupTitle = 'Help Us Improve!';
    var githubPopupText = 'Found a mistake in this page? Click here to edit it in Github and propose your change!';

    var mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) {
        $("#edit-on-github").popover({
            placement: 'left',
            html: 'true',
            title: '<span class="text-info"><strong>' + githubPopupTitle + '</strong></span>' +
            '<button type="button" id="close" class="close" onclick="$(&quot;#edit-on-github&quot;).popover(&quot;hide&quot;);">&times;</button>',
            content: githubPopupText
        });


        function enablePopoverOnMouseover() {
            $('#edit-on-github').on('mouseover',
                function () {
                    $('#edit-on-github').popover('show');
                }
            );

            $('#edit-on-github').on('mouseleave',
                function () {
                    $('#edit-on-github').popover('hide');
                }
            );
        }


        if (githubPopupPresented == null) {
            setTimeout(function () {
                $('#edit-on-github').popover('show');
                localStorage.setItem('githubPopupPresented', 'true');

                setTimeout(function () {
                    $('#edit-on-github').popover('hide');
                    enablePopoverOnMouseover();
                }, 5000);
            }, 500);
        } else {
            enablePopoverOnMouseover();
        }
    }


    /*$('#sidebar > a').on('click', function (e) {
     e.preventDefault();

     if(!$(this).hasClass("active")){
     var lastActive = $(this).closest("#sidebar").children(".active");
     lastActive.removeClass("active");
     lastActive.next('div').collapse('hide');
     $(this).addClass("active");
     $(this).next('div').collapse('show');

     }else{
     //$(this).removeClass("active");
     $(this).closest("#sidebar").children(".in").css("height","0px");
     $(this).closest("#sidebar").children(".in").removeClass("in");
     $(this).removeClass("active");

     }

     });*/

    //for lightbox 
    $('.fancybox-media').fancybox({
        openEffect: 'elastic',
        closeEffect: 'elastic',

        helpers: {
            title: {type: 'inside'},
            media: {}
        }
    });


    $("div.expand").hide();
    $("span.inlineToggleExpandBtn").append("<span class='arrow arrowsDown'>&raquo;</span>").click(function () {
        $(this).children('span.arrow').toggleClass('arrowsDown').toggleClass('arrowsUp');
        $(this).parent().next("div.expand").slideToggle(500);
    });
    $("span.expandBtn,span.inlineExpandBtn").append("<span class='arrow arrowsDown'>&raquo;</span>").click(function () {
        var elem = $(this),
            divExpand = elem.children("div.expand"),
            divExpandIframe = divExpand.children("iframe");

        elem.children('span.arrow').toggleClass('arrowsDown').toggleClass('arrowsUp');
        divExpandIframe.contents().find("body").css("background", "none !important");
        //divExpandIframe.contents().find("body").style.background='none !important';
        if (divExpand.length == 0) {
            divExpand = $("<div class='expand'><span id='expandLoading'>Loading content ...</span></div>").hide().appendTo(elem);
            divExpand.width(725).height(480).css("border", "none");
        }
        if (divExpandIframe.length == 0) {
            divExpandIframe = $("<iframe src='" + elem.attr("title") + "' />").css("opacity", 0).appendTo(divExpand);
            divExpandIframe.width(725).height(480).css({"overflow-x": "hidden", "overflow-y": "auto", "border": "0"});

            var getContent = function () {
                divExpandIframe.contents().find("body").css("background", "none");
                //divExpandIframe.contents().find("head").append('<link rel="stylesheet" href="/css/template.css" type="text/css"/>');
                //divExpandIframe.contents().find("head").append('<link rel="stylesheet" href="/css/jquery-ui-1.8.17.custom.css" type="text/css" media="all"/>');
                //divExpandIframe.contents().find("head").append('<link rel="stylesheet" type="text/css" href="/scripts/prettify/prettify.css">');
                divExpandIframe.contents().find("body").css("background", "none !important");

                var data = divExpandIframe.contents().find("#docsWrap");

                divExpandIframe.contents().find("body").html(data);
                divExpandIframe.contents().find("#versionSelectionBottom").remove();
                divExpandIframe.contents().find("body").css("background", "none !important");
                divExpandIframe.contents().find("body").addClass('noBg');

                divExpandIframe.contents().find("img").each(function () {
                    var maxWidth = 707;

                    if ($(this).width() > (maxWidth - $(this).offset().left)) {
                        $(this).width(maxWidth - $(this).offset().left);
                    }
                });

                $("#expandLoading").remove();

                divExpandIframe.animate({"opacity": 1}, 'slow');
            };

            if ($.browser.webkit) {
                var load = function (callback) {
                    (divExpandIframe.contents().find("#docsWrap").html()) ? callback() : setTimeout(function () {
                        load(callback);
                    }, 500);
                };
                load(getContent);
            }
            else
                divExpandIframe.load(getContent);
        }
        divExpand.slideToggle(500);
    });


    $("li.expandBtn").click(function () {
        $(this).next("div.expand").slideToggle(500);
        if ($(this).html() == "More...") {
            $(this).html("Less...");
        } else {
            $(this).html("More...");
        }
    });


}
