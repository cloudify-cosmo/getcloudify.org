/**
 * Zazar Presentation Framework
 *
 * Library: jquery.zazar.js
 * 
 * Version: 2.0.0
 * (C) 2011-2012 Zazar Ltd
 * 
 * Description: Framework function and effect library
 * 
 * History:
 * 2.0.0 - First commercial release
 *
 **/


(function($){
$.noConflict();
	$.zazar = {
		all: function() {

			// Initialise all functions with default values
			$.zazar.accordion();
			$.zazar.bookmark();
			$.zazar.dialog();
			$.zazar.navigation();
			$.zazar.random();
			$.zazar.reveal();
			$.zazar.rotate();
			$.zazar.scrollto();
			$.zazar.slider();
			$.zazar.tabs();
			$.zazar.ticker();
			$.zazar.tooltip();
			$.zazar.tree();
		},
		accordion: function(options) {

			// Set defaults
			var defaults = {
				selector: '.accordion',
				titletag: 'h4',
				contenttag: 'p',
				oneclick: true,
				speed: 400
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {
				var obj = $(this);
				if (!$(obj).hasClass('accordion')) $(obj).addClass('accordion');

				// Get each child item
				$(this).children().each(function() {

					// Get content element
					var content = $(options.contenttag,this);

					// Hide content
					$(content).hide();

					// Style title with link pointer
					$(options.titletag,this).css({
						cursor: 'pointer'
					}).click(function() {

						// If oneclick option then hide any visible content
						if (options.oneclick) {
							$(options.contenttag,obj).slideUp();
						}

						// Show or hide content
						if (!$(content).is(':visible')) {
							$(content).slideDown(options.speed);
						} else {
							$(content).slideUp(options.speed);
						}
					});
				});
			});
		},
		bookmark: function(options) {

			// Set defaults
			var defaults = {
				selector: 'a.bookmark'
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {

				// Attach click event to anchor
				$(this).bind('click',function() {

					var url = window.location;
					var title = document.title;									

					// Add bookmark on supported browsers
					if (window.sidebar) {
						window.sidebar.addPanel(title, url,"");
					} else if( window.external || document.all) {
						window.external.AddFavorite( url, title);
					} else {
						alert('Your browser does not support this bookmark action');
					}

					// Override default anchor handling
					return false;
				});
			});
		},
		dialog: function(options) {

			// Set defaults
			var defaults = {
				selector: '.dialog',
				id: 'dialog',
				modal: true,
				opacity: 0.8,
				fade: 'fast',
				width: 800,
				height: 500,
				errormsg: 'The content could not be loaded'
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function(i,e) {
				var obj = $(this);

				// Set up variables
				var cX, cY, cI, cJ;
				cX = cY = cI = cJ = 0;
				var dlg, dlgm, dlgt, dlgc;
				var el;
				var id = '';

				// Function to show dialog
				var dialogOpen = function() {

					// Get window width and full height
					var x = $(window).width();
					var y = $(document).height();

					// Calculate center
					cX = $(window).width() / 2;
					cY = $(window).height() / 2;

					// Show background mask for modal option
					if (options.modal) {

						dlgm = $('<div class="dialogMask"></div>').appendTo('body').css({
							display: 'none',
							position: 'absolute',
							width: x,
							height: y,
							top: '0',
							left: '0',
							zIndex: '10000',
							opacity: options.opacity
						}).fadeIn(options.fade).click(function() {
							dialogClose();
						});
		                        }

					// Create dialog window
					dlg = $('<div id="'+ options.id +'" class="dialogBox loader"></div>').appendTo('body');

					x = cX - $(dlg).width() / 2;
					y = cY - $(dlg).height() / 2;

					$(dlg).css({
						display: 'none',
						position: 'fixed',
						left: x,
						top: y,
						zIndex: '10001'
					});

					// Support for IE6
					if ($.browser.msie  && parseInt($.browser.version) <= 7) {

						cI = $(window).scrollTop(); 
						$(dlg).css({
							position: 'absolute',
							top: (y + cI) + 'px',
							paddingTop: '2em'
						});
						$('select, object, embed').css({
							visibility: 'hidden'
						});
					}

					$(dlg).fadeIn(options.fade);

					// Create title & close button
					dlgt = $('<span class="dialogTitle"></span>').appendTo($(dlg));
					$('<a href="#" class="dialogClose"></a>').appendTo($(dlg)).click(function(e) {
						e.preventDefault();
						dialogClose();
					});
					$('.dialogTitle, .dialogClose').css({
						display: 'none',
						position: 'absolute'
					});

					cJ = $('.dialogClose').width();

					// Create content container
					dlgc = $('<div class="dialogContent"></div>').appendTo($(dlg)).css({
						display: 'none'
					});
					
					// Load content from anchor
					dialogContent(obj);
				};

				// Function to close dialog
				var dialogClose = function() {

					// Reapply id for elements
					if (id) $(el).attr('id',id);

					// Remove dialog
					$('.dlgContent img').remove();
					$(dlg).remove();

					// Remove background mask
					if (options.modal) {

						$(dlgm).fadeOut(options.fade,function() {

							if ($.browser.msie  && parseInt($.browser.version) <= 7) {
								$('select, object, embed').css({
									visibility: 'visible'
								});
							}

							$(this).remove();
						});
					}
				};

				// Function to change content
				var dialogContent = function(obj) {

					var x = 0, y = 0;
					var err = false;

					// Remove any existing content
					$('.dialogTitle, .dialogClose, .dialogContent').fadeOut(options.fade);
					$(dlgc).html('');
					
					// Show loader
					$(dlg).addClass('loader');					

					// Set new title
					$(dlgt).html($(obj).attr('title'));

					// Get content link and type
					var href = $(obj).attr('href');
					var type = href.substr(href.lastIndexOf('.')).toLowerCase();

					if (type == '.gif' || type == '.jpg' || type == '.jpeg' || type == '.png' || type == '.bmp') {
					
						// Display image
						var img = new Image();

						$(img).load(function() {

							$(dlgc).css({textAlign: 'center'}).append(img);

							dialogAnimate(img.width, img.height);
						}).error(function() {
							dialogError();
						}).attr('src', href + '?' + (new Date()).getTime());
					} else if (href.charAt(0) == '#') {

						// Get element and ID
						el = $(href).get(0);

						if (el) {

							id = $(el).attr('id');

							// Create clone and clear original ID
							var el2 = $(el).clone();
							$(el).attr('id','');

							// Append to content
							$(dlgc).html($(el2).html());

							x = $(dlgc).width();
							y = $(dlgc).height();

							dialogAnimate(x,y);
						} else {
							dialogError();
						}
					} else {

						if (type == '.swf' || $(obj).hasClass('flash')) {

							// Display flash
							var html = '<object width="100%" height="100%" style="visibility: visible;">' +
								   '<param name="allowscriptaccess" value="always" />' +
								   '<param name="allowfullscreen" value="true" />' +
								   '<param name="movie" value="'+ href +'" />' +
								   '<embed src="'+ href +'" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="100%" height="100%" style="visibility: visible;"></embed>' +
								   '</object>';

							// Get flash size or set default
							x = 560;
							y = 315;
						} else {

							// Display in iFrame with default size
							var html = '<iframe frameborder="0" src="'+ href +'" scrolling="auto" style="width: 100%; height: 100%" />';
						}

						// Set content and style
						$(dlgc).css({width: '100%', height: '100%'}).html(html);

						dialogAnimate(x,y);
					}
				};

				// Function to animate to the new size of content
				var dialogAnimate = function(x,y) {

					// Set default size if zero
					if (x == 0) x = options.width;
					if (y == 0) y = options.height;

					// Set dialog width to title width
					if (($(dlgt).width() + cJ) > x) x = $(dlgt).width() + cJ;

					var offX = cX - (x / 2);
					var offY = cY - (y / 2) + cI;

					$(dlg).animate({width: x, height: y, left: offX, top: offY}, 200, function() {

						$('.dialogTitle, .dialogClose, .dialogContent').fadeIn(options.fade);
						$(dlg).removeClass('loader');
					});
				}

				// Function to show default error message
				var dialogError = function() {

					$(dlgc).html(options.errormsg).css({whiteSpace: 'nowrap'});
					$(dlgt).html('');

					var x = $(dlgc).width();
					var y = $(dlgc).height();

					dialogAnimate(x,y);
				}

				// Main actions
				$(this).bind('click', function(e) {
					e.preventDefault();

					if ($('#'+ options.id).length == 0) {
						dialogOpen();
					} else {
						dlg = $('#'+ options.id);
						dlgm = $('.dialogMask');

						dialogClose();
					}	
				});
			});
		},
		navigation: function(options) {

			// Set defaults
			var defaults = {
				selector: '.navigation',
				fade: 200,
				arrows: true,
				vertical: false
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {

				var obj = $(this);					// Current element			// 
				var dir = options.vertical ? 'vertical' : 'horizontal';	// Orientation stylesheet class name

				// Add effect classes if required
				if (!$(obj).hasClass('navigation')) $(obj).addClass('navigation');
				if (!$(obj).hasClass(dir)) $(obj).addClass(dir);

				// Fix z-index IE bug
				if ($.browser.msie  && parseInt($.browser.version) <= 7) {

					$('.navigation ul').parents().each(function() {
						var pos = $(this).css('position');
 
						if (pos == 'relative' || pos == 'absolute' || pos == 'fixed') {
							$(this).hover(function() {
								$(this).css('zIndex', 1000); 
							}, function() {
								$(this).css('zIndex', 0);
							});
						}
					});
				}

				// Add submenu indicators
				if (options.arrows) {

					// Add arrow indicators
					$('li', this).has('ul').each(function() {
						$('a:first',this).append('<span>+</span>');
					});
				}

				// Action for each list item
				$('li', this).each(function() {					

					// Show and hide menu levels
					$(this).hover(function() {
						$('ul:first', this).fadeIn(options.fadein);
					}, function() {
						$('ul', this).hide();
					});
				});
			});
		},
		random: function(options) {

			// Set defaults
			var defaults = {
				selector: '.random'
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {
				var obj = $(this);
				if (!$(obj).hasClass('random')) $(obj).addClass('random');

				var item = Math.floor(Math.random() * $(obj).children().length) + 1;

				// Hide all children
				$(obj).children().hide();

				// Show random child item
				$(obj).children(':nth-child('+ item +')').show();
			});
		},
		reveal: function(options) {

			// Set defaults
			var defaults = {
				selector: '.reveal',
				speed: 400
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {
				var obj;

				// Show pointer for non anchors and remove focus outline
				$(this).css({cursor: 'pointer', outline: 0});

				// Reveal previous element
				if ($(this).hasClass('prev')) {
					obj = $(this).prev().hide();
				} else {

					// Reveal element by ID
					if ($(this).hasClass('id')) {
						obj = $(this).attr('href');
						obj = $(obj).hide();
					} else {

						// Default reveal next element
						obj = $(this).next().hide();
					}
				}

				// Perform reveal
				$(this).toggle(function() {
					obj.slideDown(options.speed);
				}, function () {
					obj.slideUp(options.speed);					
				});
			});
		},
		rotate: function(options) {

			// Set defaults
			var defaults = {
				selector: '.rotate',
				items: 3,
				pause: 3000,
				speed: 800,
				direction: 'up',
				hoverpause: true,
				rowheight: 0
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {
				var obj = $(this);
				if (!$(obj).hasClass('rotate')) $(obj).addClass('rotate');

				var rowHeight = options.rowheight;

				// Create frame and item containers
				obj.wrap('<div class="rotateFrame" />');
				obj.children('li').wrapInner('<div class="rotateItem" />');

				// Hide list and style
				obj.parent().css({overflow: 'hidden', position: 'relative'});

				if (rowHeight == 0) {

					// Calculate largest item height
					obj.children('li').each(function() {

						if ($(this).height() > rowHeight) {
							rowHeight = $(this).height();
						}
					});
				}
				
				// Set height of list items
				obj.children('li').each(function() {
					$(this).height(rowHeight);
				});

				// Set container frame height
				obj.parent().height(rowHeight * options.items);

				// Function to handle item rotation
				function rotateMove() {

					// If item paused exit
					if (obj.hasClass('pause')) return;
		
					// Scroll in chosen direction
					if (options.direction == 'down') {

						// Get last list item and copy	
						var item = obj.children('li:last').clone(true);

						// Scroll item
						obj.css('top', '-'+ rowHeight +'px').prepend(item);
						obj.animate({top: 0}, options.speed, function() {
				        		$(this).children('li:last').remove();
		        			});
					} else {

						// Get first list item and copy
						var item = obj.children('li:first').clone(true);

						// Scroll item
						obj.animate({top: '-=' + rowHeight + 'px'}, options.speed, function() {
				        		$(this).children('li:first').remove();
	        					$(this).css('top', '0');
		        			});

						// Append copied item to end of list
					    	item.appendTo(obj);
					}
				};

				// Set timer interval for scrolling		
    				var interval = setInterval(function(){ rotateMove(); }, options.pause);
		
				// Enable pausing on mouse hover		
				if (options.hoverpause) {
					obj.bind("mouseenter",function() {
						obj.addClass('pause');
					}).bind("mouseleave",function() {
						obj.removeClass('pause');
					});
				}
			});
		},
		scrollto: function(options) {

			// Set defaults
			var defaults = {
				selector: 'a.scrollto',
				speed: 1000
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {

				// Attach click event to anchor
				$(this).bind('click',function() {
									
					// Scroll to given element
					$('html,body').animate({
						scrollTop: $($(this).attr('href')).offset().top
					}, options.speed);

					// Override default anchor handling
					return false;
				});
			});
		},
		slider: function(options) {
	  
			// Set defaults
			var defaults = {
				selector: '.slider',
				pause: 3000,
				speed: 800,
				direction: 'right',
				hoverpause: true,
				auto: true,
				continuous: true,
				pagination: '',
				controls: ''
			}; 
			var options = $.extend(defaults, options);
				
			return $(options.selector).each(function() {

				var obj = $(this);				// Current element
				var timeout;					// Timer for auto scrolling
				var listTotal = $(obj).children().length;	// Total number of list items
				var listMax = listTotal - 1;			// Zero indexed list total
				var slideX = $(obj).width();			// Slider width
				var slideY = $(obj).height();			// Slider height
				var itemIndex = 0;				// Current item index
				var nOffset = 0;				// Continous scroll offset
				var auto = false;				// State of auto scroll
				var pause = options.pause;			// Delay in slide animation
				var ready = true;				// Indicates if animation is in progress

				// Add framework class
				if (!$(obj).hasClass('slider')) $(obj).addClass('slider');

				// Create frame and item containers
				obj.wrap('<div class="sliderFrame" />');
				obj.children('li').wrapInner('<div class="sliderItem" />');

				// Set frame to current object & style
				obj = obj.parent();
				obj.width(slideX);
				obj.height(slideY);
				obj.css('overflow','hidden');

				// Style list
				$('ul',obj).css('width', slideX * listTotal);
				$('ul',obj).children('li').css({width: slideX+'px', height: slideY+'px'});

				// Clone list for continuous playing
				if (options.continuous) {
					$('ul', obj).prepend($('ul li:last-child', obj).clone());
					$('ul', obj).append($('ul li:nth-child(2)', obj).clone());
					$('ul', obj).css('width',(listTotal + 2) * slideX ).css('margin-left','-'+ slideX +'px');
					nOffset = 1;
					itemIndex = 1;
				};

				// Add pagination if required
				if (options.pagination) {

					// Get user element
					var pag = $(options.pagination);

					// Create pagination list
					var html = '<ul class="pagination">';
					for (var i=0; i < listTotal; i++) {
						html += '<li><a href="#" rel="'+ (i+1) +'">'+ (i+1) +'</a></li>';
					}
					html += '</ul>';

					// Add and set the first element as current
					$(pag).append(html);
					$('li:first', pag).addClass('current');

					// Add click handler
					$('li a', pag).click(function() {

						slideMove($(this).attr('rel'),true);
						return false;
					});
				}

				// Add controls if required
				if (options.controls) {

					// Get user element
					var con = $(options.controls);

					// Add previous and next handlers
					$('.sliderPrevious',con).click(function() {
						slideMove('left',true);
						return false;
					});

					$('.sliderNext',con).click(function() {
						slideMove('right',true);
						return false;
					});

					$('.sliderAuto',con).click(function() {
						slideAuto(!auto);
						return false;
					});
				}

				// Function to handle slide rotation
				function slideMove(inc,manual) {

					// Check for hover pause
					var pause = (!manual) ? $('ul.slider',obj).hasClass('pause') : false;

					// If ready then allow change
					if (ready && !pause) {

						// Change ready state and save current index
						ready = false;
						var oldIndex = itemIndex;

						// If controls clicked stop auto scrolling
						if (manual && options.auto) slideAuto(false);

						switch (inc) {
							case 'left':
								itemIndex = (oldIndex <= 0) ? (options.continuous ? itemIndex - 1 : nOffset) : itemIndex - 1;
								break; 
							case 'right':
								itemIndex = (oldIndex >= listMax) ? (options.continuous ? itemIndex + 1 : listMax) : itemIndex + 1;						
								break; 
							case 'random':
								itemIndex = Math.floor(Math.random() * listTotal);
								break; 
							default:
								itemIndex = inc - 1 + nOffset;
								break; 
						};

						// calculate position and speed
						var speed = (Math.abs(oldIndex - itemIndex)) * options.speed;
						var pos = (itemIndex * slideX * -1);
						pause = speed + options.pause;

						// Change pagination current highlight if enabled
						if (options.pagination) {
							var cPos = (itemIndex > listMax + nOffset) ? cPos = nOffset : (itemIndex < nOffset ? cPos = listMax + nOffset : cPos = itemIndex);
							$('li:nth-child('+ (oldIndex + 1 - nOffset) +')', pag).removeClass('current');
							$('li:nth-child('+ (cPos + 1 - nOffset) +')', pag).addClass('current');
						}
						
						// Perform slide
						$('ul.slider',obj).animate(
							{ marginLeft: pos }, 
							{ queue: false,
							  duration: speed,
							  complete: slideComplete }
						);				
					}

					// Re-start timer if auto mode
					if (options.auto) slideAuto(true);
				};

				// Check for slide looping and set position
				function slideComplete() {

					// Check for index wrap
					if (itemIndex > listMax + nOffset) itemIndex = nOffset;		
					if (itemIndex < nOffset) itemIndex = listMax + nOffset;	

					// Position new slide
					$('ul.slider',obj).css('margin-left',(itemIndex * slideX * -1));

					// Re-enable user controls
					ready = true;
				};

				// Start and stop auto scrolling
				function slideAuto(state) {

					clearTimeout(timeout);

					if (state) {
						timeout = setTimeout(function() { slideMove(options.direction,false); },pause);
						options.auto = true;
					} else {
						options.auto = false;
					}
				};

				// Check for auto start
				if (options.auto) slideAuto(true);

				// Enable pausing on mouse hover		
				if (options.hoverpause) {
					obj.bind('mouseenter',function() {
						$('ul.slider',obj).addClass('pause');
					}).bind('mouseleave',function() {
						$('ul.slider',obj).removeClass('pause');
					});
				}
			});						
		},
		tabs: function(options) {

			// Set defaults
			var defaults = {
				selector: '.tabs',
				content: '.tab'
			};
			var options = $.extend(defaults, options);

			// Hide all tab elements on page
			$(options.content).hide();

			return $(options.selector).each(function() {
				var obj = $(this);
				if (!$(obj).hasClass('tabs')) $(obj).addClass('tabs');

				// Check if any tab is current
				var tab = $('li.current',obj);

				if (tab.length > 0) {

					// Select current tab
					$('a',tab).show();
					tabChange(tab);
				} else {

					// Default to first tab
					var tab = $('li:first',this);

					if (tab.length > 0) {
						tab.addClass('current').find('a').show();
						tabChange(tab);
					}
				}

				// Add click handler
				$('li',this).click(function() {

					// Check the tab is not already chosen
					if (!$(this).hasClass('current')) {
						tabChange(this);
					}

					// Override default anchor handling
					return false;
				});

				function tabChange(obj2) {

					// Get current tab from class
					tab = $('li.current',obj).find('a').attr('href');
					$(tab).hide();

					// Remove class from tab list and add to current item
					$('li',obj).removeClass('current');
					$(obj2).addClass('current');

					// Get tab element
					tab = $(obj2).find('a').attr('href');

					// Show chosen tab
					$(tab).show();
				};
			});
		},
		ticker: function(options) {

			// Set defaults
			var defaults = {
				selector: '.ticker',
				pause: 3000,
				speed: 28,
				fade: 500,
				direction: 'next',
				hoverpause: true,
				auto: true,
				height: 0,
				pagination: '',
				controls: ''
			};
			var options = $.extend(defaults, options);
	
			return $(options.selector).each(function() {

				var obj = $(this);				// Current element
				var interval;					// Timer for auto scrolling
				var timeout;					// Timer for ticker animation
				var rowY = options.height;			// Height of ticker
				var listTotal = $(obj).children().length;	// Total number of list items
				var itemIndex = 1;				// Current item index
				var itemTitle = '';				// Current item title
				var charLen = 0;				// Ticker character progress
				var charSkip = false;				// Ticker skipping characters mode
				var ready = true;				// Indicates if animation is in progress

				// Add framework class
				if (!$(obj).hasClass('ticker')) $(obj).addClass('ticker');

				// Hide all list items
				$(obj).children().hide();

				// If height not set calculate
				if (rowY == 0) {

					// Calculate largest item height
					obj.children('li').each(function() {

						if ($(this).height() > rowY) {
							rowY = $(this).height();
						}
					});
				}

				// Set height of list items and show first
				$('li',obj).height(rowY);
				$('li:nth-child('+ itemIndex +')',obj).show();

				// Add pagination if required
				if (options.pagination) {

					// Get user element
					var pag = $(options.pagination);

					// Create pagination list
					var html = '<ul class="pagination">';
					for (var i=0; i < listTotal; i++) {
						html += '<li><a href="#" rel="'+ (i+1) +'">'+ (i+1) +'</a></li>';
					}
					html += '</ul>';

					// Add and set the first element as current
					$(pag).append(html);
					$('li:first', pag).addClass('current');

					// Add click handler
					$('li a', pag).click(function() {

						// Only change if ready
						tickerRotate($(this).attr('rel'),true);
						return false;
					});
				}

				// Add controls if required
				if (options.controls) {

					// Get user element
					var con = $(options.controls);
					
					// Add previous and next handlers
					$('.tickerPrevious',con).click(function() {
						tickerRotate('previous',true);
						return false;
					});

					$('.tickerNext',con).click(function() {
						tickerRotate('next',true);
						return false;
					});
				}

				// Function to handle item rotation
				function tickerRotate(inc,manual) {

					// Check for hover pause
					var pause = (!manual) ? obj.hasClass('pause') : false;

					// If ready then allow change
					if (ready && !pause) {

						// Clear any ticker animation in progress
						if (charLen > 0) {
							clearTimeout(timeout);
							$('li:nth-child('+ itemIndex +')',obj).html(itemTitle);
							charLen = 0;
						}

						// Change ready state and clear existing timer	
						ready = false;
						clearInterval(interval);

						// If controls clicked stop auto scrolling
						if (manual) options.auto = false;

						switch (inc) {

							case 'next':
								var newIndex = itemIndex + 1;
								if (newIndex > listTotal) newIndex = 1;
								break;

							case 'previous':
								var newIndex = itemIndex - 1;
								if (newIndex < 1) newIndex = listTotal;
								break;

							default:
								var newIndex = inc;
								break; 
						};

						// Change pagination current highlight if enabled
						if (options.pagination) {
							$('li:nth-child('+ itemIndex +')',pag).removeClass('current');
							$('li:nth-child('+ newIndex +')',pag).addClass('current');
						}

						// Fade out current item
						$('li:nth-child('+ itemIndex +')',obj).fadeOut(options.fade, function() {

							// Set new row item
							itemIndex = newIndex;
							var item = $('li:nth-child('+ newIndex +')',obj);
							itemTitle = $(item).html();

							// Animate new item
							tickerType(item);

							// Re-enable user controls
							ready = true;							
						});
					}
				};

				// Function for typing effect
				function tickerType(item) {

					// Check if character is within a tag
					var c = itemTitle.substr(charLen, 1);
					if (c == '<'){ charSkip = true; }
					if (c == '>'){ charSkip = false; }

					// If no speed fade in
					if (options.speed == 0) {
						charLen = itemTitle.length + 1;
						$(item).html(itemTitle.substr(0, charLen++)).fadeIn(options.fade);
					} else {
						$(item).html(itemTitle.substr(0, charLen++)).show();
					}
			
					// Check if another character is available
					if (charLen < itemTitle.length + 1) {

						// If character is a tag or pause show without delay
						if (charSkip || $(item).parent().hasClass('pause')) {
							tickerType(item);
						} else {
							timeout = setTimeout(function() { tickerType(item); }, options.speed);
						}
					} else {

						// Reset animation and timer	
						charLen = 0;
						charSkip = false;
			
						if (options.auto) {
							interval = setInterval(function() { tickerRotate(options.direction,false); }, options.pause);
						}
					}
				};

				// Check for auto start
				if (options.auto) {
					interval = setInterval(function() { tickerRotate(options.direction,false); }, options.pause);
				}

				// Enable pausing on mouse hover		
				if (options.hoverpause) {
					obj.bind('mouseenter',function() {
						obj.addClass('pause');
					}).bind('mouseleave',function() {
						obj.removeClass('pause');
					});
				}
			});
		},
		tooltip: function(options) {

			// Set defaults
			var defaults = {
				selector: '.tooltip',
				id: 'tooltip',
				offsetx: 16,
				offsety: 16,
				defaulttip: '',
				allowid: true
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {

				var itemTitle = $(this).attr('title');
				var tipText = itemTitle;

				$(this).hover(function(e) {

					// If content ID's allowed check for element
					if (options.allowid) {
						tipText = (tipText.substring(0,1) == '#') ? $(tipText).html() : tipText;
					}

					// If no text then use default
					tipText = (tipText != '') ? tipText : options.tiptext;

					if (options.cursor) { 
						$(this).css('cursor', options.cursor);
					}

					// Remove title from item
					$(this).attr('title', '');

					if (tipText != "" && tipText != undefined) {

						$('body').append('<div id="' + options.id + '" class="tooltipPopup">' + tipText + '</div>');
						$('#' + options.id).css({
							'position': 'absolute',
							'display': 'none',
							'zIndex': 1000
						}).css('top', (e.pageY - options.offsety) + 'px').css('left', (e.pageX + options.offsetx) + 'px');

						// Prevent layout jumping in early IE
						if ($.browser.msie  && parseInt($.browser.version) <= 7) {
							$('#' + options.id).show();
						} else {
							$('#' + options.id).fadeIn('fast');
						}
					}
				}, function() {

					// Remove tip from dom and re-add title
					$('#' + options.id).remove();
					$(this).attr('title', itemTitle);
				});

				// Track mouse movement
				$(this).mousemove(function(e) {

					var x = ((e.pageX + options.offsetx + $(this).width()) < $(window).width()) ? (e.pageX + options.offsetx) : (e.pageX - options.offsetX - $(this).width() - 16);
					$('#' + options.id).css('top', (e.pageY - options.offsety) + 'px').css('left', (x + 'px'));
				});
			});
		},
		tree: function(options) {

			// Set defaults
			var defaults = {
				selector: '.tree',
				speed: 400,
				showlines: true,
				expandroot: true
			};
			var options = $.extend(defaults, options);

			return $(options.selector).each(function() {

				var obj = $(this);
				var root = $(this).find('li');
				var state = '';

				if (!$(obj).hasClass('tree')) $(obj).addClass('tree');

				// Collapse outline
				$(obj).find('ul').hide();

				// Support for IE6
				if ($.browser.msie  && parseInt($.browser.version) <= 7) $('li',obj).css('height','1px');

				// Display guidelines if required
				if (options.showlines) $(obj).addClass('lines');

				// Ensure the last item has the 'last' class
				$('li:last-child',obj).addClass('last');

				// Add button to any item with sub-items
				$(root).each(function() {

					// Has the item sub-items
					if ($(this).children('ul').length > 0) {

						// Set default state and option to expamd root
						state = 'treePlus';
						if (options.expandroot && $(this).parent().hasClass('tree')) state += ' treeMinus';

						$(this).addClass('root').prepend('<span class="'+ state +'" />');
					}
				});

				// Perform default expands
				$('span.treeMinus',obj).nextAll('ul').show();

				// Add click event to toggle levels
				$('span.treePlus',obj).click(function() {

					if ($(this).hasClass('treeMinus')) {
						$(this).toggleClass('treeMinus').nextAll('ul').slideUp(options.speed);
					} else {
						$(this).toggleClass('treeMinus').nextAll('ul').slideDown(options.speed);
					}
				});
			});
		}
	};
})(jQuery);