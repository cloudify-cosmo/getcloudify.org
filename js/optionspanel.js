jQuery(document).ready(function($) {
	
	$('.options_toggle').bind('click', function() {
		if($('#t_options').css('left') == '0px'){
			$('#t_options').stop(false, true).animate({left:'-230px'}, 400, 'easeOutExpo');
		}else {
			$('#t_options').stop(false, true).animate({left:'0px'}, 400, 'easeOutExpo');
		}	
	});

	$(".wideboxed a.wrapboxed").click(function() { 
		$.cookie($('#wrapper').addClass("boxed"));
		return false;
	});
	$(".wideboxed a.wrapwide").click(function() { 
		$.cookie($('#wrapper').removeClass("boxed"));
		return false;
	});
	
	
	$("#stylechanger .color a").click(function() { 
		$("#t-colors").attr("href",'skins/'+$(this).attr('data-rel'));
		$.cookie("css",'skins/'+$(this).attr('data-rel'), {expires: 365, path: '/'});
		return false;
	});
	
	$(".bgr .color a").click(function() { 
		$("#bodybg").attr("href",'bodybg/'+$(this).attr('data-rel'));
		$.cookie("css",'bodybg/'+$(this).attr('data-rel'), {expires: 365, path: '/'});
		return false;
	});
	
	$('#accent_color').ColorPicker({
		onSubmit: function(hsb, hex, rgb, el) {
			$(el).val(hex);
			$(el).ColorPickerHide();
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			$('#accent_color').val(hex);
			$('#accent_color').css('backgroundColor', '#' + hex);
			accentColorUpdate(hex);
		}
	})
	.bind('keyup', function(){
		$(this).ColorPickerSetColor(this.value);
	});
	
	$('#bodybg_color').ColorPicker({
		onSubmit: function(hsb, hex, rgb, el) {
			$(el).val(hex);
			$(el).ColorPickerHide();
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			$('#bodybg_color').val(hex);
			$('#bodybg_color').css('backgroundColor', '#' + hex);
			bodybgColorUpdate(hex);
		}
	})
	.bind('keyup', function(){
		$(this).ColorPickerSetColor(this.value);
	});
	
function accentColorUpdate(hex){

	hex = '#'+hex;

	$('#custom_styles').html('<style>'+
		'	a, a:hover,a:focus,a:active, footer a.text-link:hover, strike, footer ul.link-list li a:hover, .post-meta span a:hover, footer a.text-link, ul.meta-post li a:hover, ul.cat li a:hover, ul.recent li h6 a:hover, ul.portfolio-categ li.active a, ul.portfolio-categ li.active a:hover, ul.portfolio-categ li a:hover,ul.related-post li h4 a:hover, span.highlight,article .post-heading h3 a:hover,.navbar .nav > .active > a,.navbar .nav > .active > a:hover,.navbar .nav > li > a:hover,.navbar .nav > li > a:focus,.navbar .nav > .active > a:focus, .validation,#sendmessage,.post-meta .comments a:hover,.recent-post .text h5 a:hover { color:'+ hex +'; }' +
		'	.custom-carousel-nav.right:hover, .custom-carousel-nav.left:hover,.dropdown-menu li:hover,.dropdown-menu li a:hover,.dropdown-menu li > a:focus,.dropdown-submenu:hover > a,.dropdown-menu .active > a,.dropdown-menu .active > a:hover,.pagination ul > .active > a:hover,.pagination ul > .active > a,.pagination ul > .active > span,.flex-control-nav li a:hover,.flex-control-nav li a.active,.modal.styled .modal-header,.icon-square:hover,		.icon-rounded:hover,.icon-circled:hover,[class^="icon-"].active,[class*=" icon-"].active,.fancybox-close:hover,.fancybox-nav:hover span,.nivo-directionNav a:hover  { background-color:'+ hex +';}'+
		'	.pagination ul > li.active > a,.pagination ul > li.active > span, a.thumbnail:hover, input[type="text"].search-form:focus  { border: 1px solid '+ hex +';}'+
		'	textarea:focus,input[type="text"]:focus,input[type="password"]:focus,input[type="datetime"]:focus,		input[type="datetime-local"]:focus,input[type="date"]:focus,input[type="month"]:focus,input[type="time"]:focus,input[type="week"]:focus,input[type="number"]:focus,input[type="email"]:focus,input[type="url"]:focus,input[type="search"]:focus,input[type="tel"]:focus,input[type="color"]:focus,.uneditable-input:focus,input:focus { border-color: '+ hex +';}'+
		
	    '   .pullquote-left { border-left:5px solid '+ hex +'; }'+
		'   .pullquote-right { border-right: 5px solid '+ hex +';}'+
	    '   .hidden-top,#header-hidden-link a.toggle-link,#header-hidden-link a.top-link,.jcarousel-skin-tango .jcarousel-prev-horizontal:hover,.jcarousel-skin-tango .jcarousel-prev-horizontal:focus,.jcarousel-skin-tango .jcarousel-next-horizontal:hover,.jcarousel-skin-tango .jcarousel-next-horizontal:focus,.widget ul.tags li a:hover,.pricing-box-alt.special .pricing-heading,.item-thumbs .hover-wrap .overlay-img,#pagination a:hover,.pricing-box.special .pricing-offer,.da-dots span { background: '+ hex +';}'+
	    '   .btn-dark:hover,.btn-dark:focus,.btn-dark:active,.btn-theme { border: 1px solid '+ hex +'; background: '+ hex +';}'+
	    '   .post-meta { border-top: 4px solid '+ hex +';}'+
	    '   .widget ul.tags li a:hover { background: '+ hex +';}'+

	    '   ul.clients li:hover { border: 4px solid '+ hex +';}'+
	    '   .da-slide .da-link:hover { background: '+ hex +'; border: 4px solid '+ hex +';}'+

		'	#featured .flexslider .slide-caption { border-left: 5px solid '+ hex +';}'+
		'	.nivo-caption, .caption { border-bottom: 5px solid '+ hex +';}'+
		
		'</style>');
}

function bodybgColorUpdate(hex){
	$('body').css('background', '#'+hex);
}
	
});