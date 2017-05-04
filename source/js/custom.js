/*global jQuery:false */
$(document).ready(function() {
	"use strict";


	(function() {

		var $menu = $('.navigation nav'),
		optionsList = '<option value="" selected>Go to..</option>';

		$menu.find('li').each(function() {
			var $this   = $(this),
			$anchor = $this.children('a'),
			depth   = $this.parents('ul').length - 1,
			indent  = '';

			if( depth ) {
				while( depth > 0 ) {
					indent += ' - ';
					depth--;
				}

			}
			$(".nav li").parent().addClass("bold");

			optionsList += '<option value="' + $anchor.attr('href') + '">' + indent + ' ' + $anchor.text() + '</option>';
		}).end()
		.after('<select class="selectmenu">' + optionsList + '</select>');
		
		$('select.selectmenu').on('change', function() {
			window.location = $(this).val();
		});
		
		
	})();

	
	//$('#da-slider').cslider();
	$('#da-slider').cslider({

	current		: 0, 	
	// index of current slide
	
	bgincrement	: 50,	
	// increment the background position 
	// (parallax effect) when sliding
	
	autoplay	: true,
	// slideshow on / off
	
	interval	: 8000  
	// time between transitions
	
});

	//for highlight current pages
	//http://docs.shopify.com/support/configuration/store-customization/how-do-i-style-active-link-with-javascript-and-css
	$('.nav li.topmenu').each(function() {
		var href = $(this).find('a').attr('href');
		if (href === window.location.pathname) {
			$(this).addClass('active');
			if($(this).parent().parent().hasClass("topmenu")){
				$(this).parent().parent().addClass('active');
			}
		}
	});

	if (location.href.indexOf('/guide/') != -1) {
		var version = document.location.href.split("/guide/")[1].split("/")[0];
		var tocUrl = '/guide/' + version + '/toc.html';

                var baseurl = document.location.href.split("/guide/")[0].split("/").slice(3).join("/")
		// Grab the menu data
		$.ajax({
		    type:'GET',
		    url:'/' + [baseurl, 'guide', version, 'toc.html'].filter(function (val) {return val;}).join("/"),
		    //url:'/guide/' + version + '/toc.html',                                
		    success:function (data) {
				// Once we have the menu in place, process it

		    	$("#tocAside").html(data.toString());
		    	
		    	//highlight  docs menu links according to the page url
				fixMenuAccordingToUrl();

				$("#tocAside").css("display", "block");

				// Listen to menu click events
				$("a.list-group-item").click(function(event){
					event.preventDefault();

					// If the href is not empty
					if ($.trim($(this).attr('href'))) {
						// Dont actually navigate, we'll do this here.
						event.preventDefault();

						// Change highlighting if needed (title holder click does it on its own)
						if (!$(this).hasClass('titleHolder')) {
							$('a.list-group-item').removeClass('active');
							$(this).addClass('active');
						}

						// Grab the navigation data
						var newPageUrl = $(this).attr('href');
						var pageTitle = $(this).text();

						// Save state in history (so it will show in the url and we can navigate back)
						window.history.pushState( { url: newPageUrl, title: pageTitle } , pageTitle , newPageUrl);

						// Load the new page
						loadNewPage(newPageUrl,pageTitle);
					}
				});

				//Left docs menu control - open ,close and highlight.
				$( ".titleHolder").click(function( event ) {
					event.preventDefault();

					var isActive = $(this).hasClass('active');

					// Clear any previous selection
					$('.icon-caret-down').attr('class','icon-caret-right');
					$(".titleHolder.active").next().hide("fast");
					$("a.list-group-item").removeClass('active');
					$('.titleHolder').removeClass("active");

					if (!isActive) {
						$(this).addClass("active");
						$(this).children().attr('class','icon-caret-down');
						$(this).next().show("fast");
					}
				});

		    }
		});						
	}

	/**
	 * Highlite and "opens" the right node according to the selected URL
	 */
	function fixMenuAccordingToUrl() {
		// Clear all active selection
		$('.titleHolder').removeClass("active");
		$('a.list-group-item').removeClass('active');

		$('a.list-group-item').each(function() {
			if ($.trim($(this).attr('href')) && window.location.href.indexOf($(this).attr('href')) != -1)  {
				// Add the active class
				$(this).addClass('active');

				if ($(this).hasClass('titleHolder')) {
					$(this).children().attr('class','icon-caret-down');
//					$(this).addClass("active");
					$(this).next().show("fast");
				} else {
					// If this is not title holder, it means its a leaf. In this case, show the entire box (open the parent), and mark as active
					$(this).parent().show();
//					$(this).parent().prev().addClass("active");
					$(this).parent().prev().children().attr('class','icon-caret-down')
				}

				var pathArray = window.location.pathname.split( '/' );
				pathArray = pathArray[2];

				//highlight top menu when user click on docs menu links
				$('.nav li.topmenu').each(function() {
					var href = $(this).find('a').attr('href');
					var splitHref = href.split( '/' );
					splitHref=splitHref[2];
					if (splitHref === pathArray) {
						$(this).addClass('active');
						$(this).parent().parent().addClass('active');
					}
				});
			}
		});
	}

	/**
	 * Load a page into "pageContent". Runs its attached "createLinkList" scripts.
	 * @param newPageUrl
	 * @param pageTitle
	 */
	function loadNewPage(newPageUrl,pageTitle) {
		// Create a temporary div to store the page content (if we put it directly into pageContent we'll have 2 pageContent divs one inside the other)
		var page = $('<div></div>');
		$(page).load( newPageUrl +" #pageContent" , function(fullPageData) {
			// check if need to refresh the entire page- navigate to another page. If so we will have a 'http-equiv=refresh' header to the loaded html.
			// If so just place it in, and the browser will do the rest.
			if (fullPageData.indexOf('http-equiv="refresh"') >= 0 ){
				$( "#pageContent").html(fullPageData);
			} else {

				// If not, add all of the loaded "PageContent" children to our page's pageContent.
				$( "#pageContent").html($(page).find('#pageContent').children());

				// Make sure we scroll to the top
				$(window).scrollTop(0);

				// Change the breadcrumb according to the title
				$('.bt_wiki-breadcrumb .breadcrumb li').last().html(pageTitle);

				runPageScripts(fullPageData);
			}

		});
	}

	/**
	 * Run the relevant scripts on the loaded page
	 * @param fullPageData
	 */
	function runPageScripts(fullPageData) {
		// Find scripts that are attached to the loaded html (we only want to run the "createLinkList" which is the script that
		// Is related to the jekyll plugins that we are using)
		var scriptIndex=fullPageData.indexOf('createLinkList');
		while (scriptIndex >= 0) {
			// Grab the script itself
			var script = fullPageData.substring(scriptIndex);
			var fullPageData = script.substring(20); // Jump over the createLinkList
			var scriptEnd = script.indexOf(');');
			script = script.substring(0,scriptEnd) + ");";

			// Run the script
			try {
				eval(script);
			} catch (e) {console.log(e);}

			// Move to the next script (in most cases we will only have one
			scriptIndex=fullPageData.indexOf('createLinkList');
		}

		initWikiPageLayout();

		trackPage();

		initMixpanelTracking();
	}

	/**
	 * Listen to onpopstate event. We used pushstate to save the navigation in the url. So now we have to make sure we listen to the "back" action and reverse it
	 * @param event
	 */
	window.onpopstate = function(event) {
		// If we found a state, and a url inside the state (means its the data we saved) then load the wanted page, and highlight the menu accordingly
		if (event.state && event.state.url) {
			loadNewPage(event.state.url,event.state.title);
			fixMenuAccordingToUrl();
		}
	};


	$('.toggle-link').each(function() {
	$(this).click(function() {
	  var state = 'open'; //assume target is closed & needs opening
	  var target = $(this).attr('data-target');
	  var targetState = $(this).attr('data-target-state');
	  
	  //allows trigger link to say target is open & should be closed
	  if (typeof targetState !== 'undefined' && targetState !== false) {
		state = targetState;
	  }
	  
	  if (state == 'undefined') {
		state = 'open';
	  }
	  
	  $(target).toggleClass('toggle-link-'+ state);
	  $(this).toggleClass(state);      
	});
});

	//add some elements with animate effect

	$(".big-cta").hover(
		function () {
			$('.cta a').addClass("animated shake");
		},
		function () {
			$('.cta a').removeClass("animated shake");
		}
		);
	$(".box").hover(
		function () {
			$(this).find('.icon').addClass("animated pulse");
			$(this).find('.text').addClass("animated fadeInUp");
			$(this).find('.image').addClass("animated fadeInDown");
		},
		function () {
			$(this).find('.icon').removeClass("animated pulse");
			$(this).find('.text').removeClass("animated fadeInUp");
			$(this).find('.image').removeClass("animated fadeInDown");
		}
	);
	
		
	$('.accordion').on('show', function (e) {

		$(e.target).prev('.accordion-heading').find('.accordion-toggle').addClass('active');
		$(e.target).prev('.accordion-heading').find('.accordion-toggle i').removeClass('icon-plus');
		$(e.target).prev('.accordion-heading').find('.accordion-toggle i').addClass('icon-minus');
	});
	
	$('.accordion').on('hide', function (e) {
		$(this).find('.accordion-toggle').not($(e.target)).removeClass('active');
		$(this).find('.accordion-toggle i').not($(e.target)).removeClass('icon-minus');
		$(this).find('.accordion-toggle i').not($(e.target)).addClass('icon-plus');
	});	


		
	//Navi hover
	/*$('ul.nav li.dropdown').hover(function () {
		$(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn();
	}, function () {
		$(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut();
	});*/
	
	// tooltip
	$('.social-network li a, .options_box .color a').tooltip();

	// fancybox
	$(".fancybox").fancybox({				
		padding : 0,
		autoResize: true,
		beforeShow: function () {
			this.title = $(this.element).attr('title');
			this.title = '<h4>' + this.title + '</h4>' + '<p>' + $(this.element).parent().find('img').attr('alt') + '</p>';
		},
		helpers : {
			title : { type: 'inside' },
		}
	});

		
	//scroll to top
	$(window).scroll(function(){
		if ($(this).scrollTop() > 100) {
			$('.scrollup').fadeIn();
		} else {
			$('.scrollup').fadeOut();
			
		}
		
		//if ($(this).scrollTop() < 500) {
		//$('.footerlist').fadeOut();
		//}
		
		//for footer
		//if ($(this).scrollTop() > 400) {
		/*
		var totalHeight, currentScroll, visibleHeight; 
		currentScroll = $(document).scrollTop();
		// Height of page
		totalHeight = document.body.offsetHeight;
		// Height visible
		visibleHeight = document.documentElement.clientHeight;
		 
		 if (visibleHeight + currentScroll >= totalHeight) {
			$('.footerlist').fadeIn();
			} else {
			//$('.footerlist').fadeOut();
		}*/
	});
	$('.scrollup').click(function(){
		$("html, body").animate({ scrollTop: 0 }, 1000);
		return false;
	});

	$('#mycarousel').jcarousel();
	$('#mycarousel1').jcarousel();
		

	//TWITTER
	/*getTwitters('twitter', {
		id: 'wrapbootstrap',
		count: 1,
		enableLinks: true,
		ignoreReplies: false,
		template: '<i class="icon-twitter icon-circled icon-48 active"></i><br /><span class="twitterPrefix"><span class="twitterStatus">%text%</span><br /><em class="twitterTime"><a href="http://twitter.com/%user_screen_name%/statuses/%id_str%">Date - %time%</a></em>',
		newwindow: true
	});*/


	//flexslider
	$('.flexslider').flexslider();

	//nivo slider
	$('.nivo-slider').nivoSlider({
		effect: 'random', // Specify sets like: 'fold,fade,sliceDown'
		slices: 15, // For slice animations
		boxCols: 8, // For box animations
		boxRows: 4, // For box animations
		animSpeed: 500, // Slide transition speed
		pauseTime: 5000, // How long each slide will show
		startSlide: 0, // Set starting Slide (0 index)
		directionNav: true, // Next & Prev navigation
		controlNav: false, // 1,2,3... navigation
		controlNavThumbs: false, // Use thumbnails for Control Nav
		pauseOnHover: true, // Stop animation while hovering
		manualAdvance: false, // Force manual transitions
		prevText: '', // Prev directionNav text
		nextText: '', // Next directionNav text
		randomStart: false, // Start on a random slide
		beforeChange: function(){}, // Triggers before a slide transition
		afterChange: function(){}, // Triggers after a slide transition
		slideshowEnd: function(){}, // Triggers after all slides have been shown
		lastSlide: function(){}, // Triggers when last slide is shown
		afterLoad: function(){} // Triggers when slider has loaded
	});

	//slitslider				
	var Page = (function() {

		var $nav = $( '#nav-dots > span' ),
		slitslider = $( '#slider' ).slitslider( {
			onBeforeChange : function( slide, pos ) {
				$nav.removeClass( 'nav-dot-current' );
				$nav.eq( pos ).addClass( 'nav-dot-current' );
			}
		} ),

		init = function() {
			initEvents();
		},
		initEvents = function() {
			$nav.each( function( i ) {
				$( this ).on( 'click', function() {
					var $dot = $( this );

					if( !slitslider.isActive() ) {
						$nav.removeClass( 'nav-dot-current' );
						$dot.addClass( 'nav-dot-current' );
					}

					slitslider.jump( i + 1 );
					return false;

				} );

			} );

		};

		return { init : init };
	})();

	Page.init();
	/*
	var $items  = $('<div class="sl-slide sl-slide-color-2" data-orientation="horizontal" data-slice1-rotation="-5" data-slice2-rotation="10" data-slice1-scale="2" data-slice2-scale="1"><div class="sl-slide-inner bg-1"><div class="sl-deco" data-icon="t"></div><h2>some text</h2><blockquote><p>bla bla</p><cite>Margi Clarke</cite></blockquote></div></div>');
	// call the plugin's add method
	ss.add($items);
	*/





	//////////////////////////Start YouTube Player  Data /////////////////////////////
	//Current time   http://jsfiddle.net/M78zz/
	//var id = $.fancybox.inner.find('iframe').attr('id');
	//player = new YT.Player(id)
	//player.getCurrentTime()
	var player ;
	var videoTitle;
	var videoWatchDuration;
	var count=0;
	// Fires whenever a player has finished loading
	function onPlayerReady(event) {
		event.target.playVideo();
	}

	// Fires when the player's state changes.
	function onPlayerStateChange(event) { 
		videoWatchDuration = player.getCurrentTime();
		//get title
		var url=player.getVideoUrl();
		var videoid = url.match(/(https?):\/\/(www.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/watch\?feature=player_embedded&v=)([A-Za-z0-9_-]*)(\&\S+)?(\S)*/);
		videoid=videoid[4];
		
		$.get('http://gdata.youtube.com/feeds/api/videos/'+videoid+'?v=2&alt=json',function(data) {
			videoTitle=data.entry.title.$t;
			if(videoTitle!=undefined){
				mixpanel.identify() ;
				mixpanel.people.set({
					"Video Name": videoTitle,
					"Video Watch Duration": videoWatchDuration
				});
				if(count==0){
					mixpanel.people.increment({
						"Watched Video": 1
					}); 
					mixpanel.track("Watched Video",{'page name' : document.title, 'url' :  window.location.pathname, 'video-name': videoTitle });
					count+=1;
				}
			}
		});
		if (event.data === 0) {
		     // Go to the next video after the current one is finished playing
		     $.fancybox.next();
		     count=0;
		}
	}


	function onYouTubePlayerAPIReady() {

    	// Initialise the fancyBox after the DOM is loaded
	    $(document).ready(function() {

	    	$(".fancybox")
	    	.attr('rel', 'gallery')
	    	.fancybox({
	    		beforeShow  : function() {
                    // Find the iframe ID
                    var id = $.fancybox.inner.find('iframe').attr('id');
                    count=0;
                    // Create video player object and add event listeners
                    player = new YT.Player(id, {
                    	events: {
                    		'onReady': onPlayerReady,
                    		'onStateChange': onPlayerStateChange
                    	}
                    });
	            },
	            beforeClose: function() {
					//alert(player.getCurrentTime())
					//onPlayerStateChange() ;
					if(player.u==true){
						videoWatchDuration = player.getCurrentTime();
						mixpanel.people.set({
							"Video Watch Duration": videoWatchDuration
						});
					}
				}
			});
	    });
	}

	//mobile menu 
	$('#menu_toggle').on('click',function(){ 
		$(this).toggleClass('open'); 
		$('.mobile_header .top_nav_mobile').slideToggle(300); });


					
				
	


//////////////////////////End YouTube Player  Data //////////////////////////////

/*
//EventsPage - This code parsing google calendar data using json//
if (location.href.indexOf('/participate') != -1) {
		var strVar='';
		var registerLink='';
		var twitterLink='';
		var mapLink='';
		var startdate = '';
		var enddate = '';
		//var futureeventsData = 'https://www.google.com/calendar/feeds/cloudifysource@gmail.com/public/full?orderby=starttime&sortorder=ascending&max-results=5&futureevents=true&alt=json';
		var futureeventsData = 'https://www.google.com/calendar/feeds/cloudifysource%40gmail.com/public/basic?orderby=starttime&sortorder=ascending&max-results=5&futureevents=true&alt=json';
		$.getJSON(futureeventsData,function(data){
		  if(data.feed.entry!=undefined){
		  for(var i = 0; i < data.feed.entry.length; i++){
			 if(data.feed.entry[i].gd$where[0].valueString.split("~~").length>0){
				startdate = new Date(data.feed.entry[i].gd$when[0].startTime); // some mock date
				//startdate=startdate.toLocaleFormat();
				var curr_date = startdate.getDate();
				var curr_month = startdate.getMonth() // + 1; //Months are zero based
				var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
				curr_month = months[parseInt(curr_month,10)];
				var curr_year = startdate.getFullYear();
				var curr_time = startdate.toLocaleTimeString();
				var startdatetext =   curr_month  + " " + curr_date+ ", " + curr_year;
				
				
				
				registerLink = data.feed.entry[i].gd$where[0].valueString.split("~~")[1];
				mapLink  = data.feed.entry[i].gd$where[0].valueString.split("~~")[2];
				twitterLink = data.feed.entry[i].gd$where[0].valueString.split("~~")[3];
			 }

strVar += "<article>";
strVar += "				<div class=\"row\">";
strVar += "					<div class=\"span8\">";
strVar += "						<div class=\"wrapper\">";
strVar += "							<div class=\"testimonial\">";
strVar += "								<div class=\"author\">";
strVar += "									<i class=\"icon-50 icon-calendar\"><\/i>";
strVar += "									<p class=\"name\">";
strVar += 									data.feed.entry[i].title.$t;
strVar += "										<br\/>";
strVar += "									<strong><span class=\"highlight\">"+startdatetext+"<\/span><\/strong> ";
strVar += "									<\/p>";
strVar += "								<\/div>";
strVar += "								<p>";
strVar += 								data.feed.entry[i].content.$t;
strVar += "								<\/p>";
strVar += "";
strVar += "                                 <p class=\"text-left\">";
strVar += "                                 <a href="+registerLink+" target=\"_blank\" class=\"btn btn-rounded\">Register &raquo;<\/a>";
if (twitterLink!=undefined){
strVar += "                                  <a  href="+twitterLink+" target=\"_blank\" class=\"btn btn-rounded btn-theme btn-sm hover-wrap\"><i class=\"icon-twitter\" ><\/i>&nbsp;Tweet<\/a> ";
}
if (mapLink!=undefined){
strVar += '                                 <a data-fancybox-group=\"map\" title=\"Get location!\"  href="'+mapLink+'" class=\"btn btn-rounded btn-info btn-sm fancybox fancybox.iframe\">';
strVar += "								 <i class=\"icon-map-marker\"><\/i>&nbsp;Map<\/a>";
}
strVar += "								 <\/p>  ";
strVar += "							<\/div>";
strVar += "						<\/div>";
strVar += "					<\/div>";
strVar += "				<\/div>";
strVar += "				<\/article>";
			 
			 
 }
  $('#eventsWrapper').append(strVar);
  }
});
 
 
var strVarPast='';
var  ytnum = '';
var yutubeLink='';
var d = new Date();
var n = d.toJSON();
var pasteventsData = 'https://www.google.com/calendar/feeds/cloudifysource@gmail.com/public/basic?orderby=endtime&sortorder=descending&max-results=3&futureevents=false&alt=json';
$.getJSON(pasteventsData,function(data){
 if(data.feed.entry!=undefined){
  for(var i = 0; i < data.feed.entry.length; i++){
  if(data.feed.entry[i].gd$where[0].valueString.split("/")[4]!=undefined){
			ytnum = data.feed.entry[i].gd$where[0].valueString.split("/")[4].split("?")[0];
			yutubeLink = data.feed.entry[i].gd$where[0].valueString.split("~~")[0];
  }else{
	ytnum = "";
  }
  
strVarPast += "<li class=\"widget\">	";
strVarPast += "<h5 class=\"widgetheading\">";
strVarPast += data.feed.entry[i].title.$t;
strVarPast +="<\/h5>";
strVarPast += "<!-- Fancybox - Gallery Enabled - Title - Full Image -->";
strVarPast += "<a class=\"hover-wrap fancybox fancybox.iframe\" data-fancybox-group=\"gallery\" title=\"";
strVarPast += data.feed.entry[i].title.$t;
strVarPast += '"href=\"';
strVarPast += yutubeLink;
strVarPast += "\">";
strVarPast += "";
strVarPast += "<!-- Thumb Image and Description -->";
if (ytnum!=""){
strVarPast += '<img src="http://img.youtube.com/vi/'+ytnum+'/0.jpg" alt="'+data.feed.entry[i].content.$t+'">'; 
strVarPast += "<p><\/p>";
strVarPast += "<p class=\"text-right\">"; 
strVarPast += "	<span class=\"btn btn-blue\" ><i class=\"icon-play\"><\/i> watch<\/span>";
strVarPast += "<\/p>";
}
strVarPast += "<\/a>";
strVarPast += "<!-- End Item Project -->";
strVarPast += "<\/li>";
  }	
	  	   
  
		  
		  $('.watchWrapper').append(strVarPast);
		  }
		});

// Ende Event Page code // 

}
*/
});
