---
layout: null 
---


function createLinkList(headingStr, elementId) {
  var listItems = "";  
  $('#pageContent').children(headingStr).each(function() {
    listItems += '<li><a href="#'+this.id+'">'+$(this).text()+'</a></li>';
  });

  $("#" + elementId).html(listItems);
}

$(function () {

  $(".tabsection").each(function(index) {
    list = "";

    $(this).find(".tab-pane").each(function(index) {
      list_class = "";
      timestamp = parseInt(Date.now() * Math.random()) ;

      if(index === 0){
        list_class = "class='active'";
        $(this).prop("class", $(this).prop("class") + " active");
      }

      list += "<li " + list_class +"><a href='#" + timestamp + $(this).prop("id") +"'>" + $(this).prop("title") +"</a></li>";
      $(this).prop("id", timestamp + $(this).prop("id"));
    });
    $(this).find(".nav").html(list);
  });

  $('.tabsection ul.nav a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  

  if ($("#childrentree").length !== 0) {
    var childrentreeid = $("a:contains('" + $("title").text() +"')");
    var childrens_li = childrentreeid.siblings("ul").children("li");
    $("#childrentree").append("<ul></ul>");
    childrentreeul = $("#childrentree").children("ul");
    childrens_li.each(function() {
      tmp = $(this).clone();
      childrentreeul.append(tmp);
    });
  }

  if ($("#gallery").length !== 0) {
    $("#gallery a").fancybox();
  }


    var screenBigEnough = function() {
        // Check if matchMedia exists
        if (window.matchMedia) {
            return window.matchMedia('(min-width: 768px)').matches;
        } else {
            return $(window).width() > 768;
        }
    }

    var autoFitSidebar = function(){
        if (screenBigEnough()) {
            // Find the offset top of the bottom of the screen
            var windowTop = $(window).scrollTop();
            var footerTop = $('footer').offset().top;
            var windowBottom = windowTop + $(window).height();

            // Check if footer is in view
            var isInView = (windowBottom >= footerTop);
            var toolbar = $('.bt_wiki-tocspan');
            if (isInView) {
                var maxHeight = footerTop - windowTop - 139;
                toolbar.css({
                    'height' : maxHeight+'px'
                });
            } else {
                toolbar.css({
                    'height' : 'auto'
                });

            }
        } else {
            // Reset it all
            var toolbar = $('.bt_wiki-tocspan');
            toolbar.css({
                'height' : 'auto'
            });
        }
    }

    $(window).scroll(function(){
        autoFitSidebar();
    });

    autoFitSidebar();
})
