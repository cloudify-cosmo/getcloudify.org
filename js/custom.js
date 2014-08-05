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
		$.ajax({
		    type:'GET',
		    url:'/guide/' + version + '/toc.html',                                
		    success:function (data) {	
		    	$("#tocAside").html(data.toString());
		    	
		    	//highlight  docs menu links
				$('a.list-group-item').each(function() {					
					if (window.location.href.indexOf($(this).attr('href')) != -1)  {						
						$(this).addClass('highlight');
						$(this).parent().show();
						$('.icon-caret-down').attr('class','icon-caret-right');
						$(this).parent().prev().addClass("active");
						$(this).parent().prev().children().attr('class','icon-caret-down')
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
				$("#tocAside").css("display", "block");

				//Left docs menu control - open ,close and highlight.
				$( ".titleHolder").click(function( event ) { 
					event.preventDefault();
					if($(this).hasClass('active')){
						if($(this).next().is(':visible')){
							$('.icon-caret-down').attr('class','icon-caret-right');
						} else{
							$(this).children().attr('class','icon-caret-down');
						}
						$(this).next().toggle("fast");
					} else{
						$('.icon-caret-down').attr('class','icon-caret-right');
						$(".titleHolder.active").next().hide("fast");
						$(".titleHolder").removeClass('active');
						$(this).addClass("active");
						$(this).children().attr('class','icon-caret-down');
						$(this).next().show("fast");
					}
				});



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

		    }
		});						
	}
	

	

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
	$('ul.nav li.dropdown').hover(function () {
		$(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn();
	}, function () {
		$(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut();
	});
	
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


//////////////////////////End YouTube Player  Data //////////////////////////////
});
