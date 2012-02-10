$(function() {
		$( "#accordion" ).accordion({autoHeight:false, navigation: true,collapsible: true});
		
});  

$(document).ready(function(){	
	$("#slider").easySlider({
		auto: true,
		continuous: true,
		nextId: "slider1next",
		prevId: "slider1prev"
	});
	$("#slider2").easySlider({ 
		numeric: true
	}); 
	
}); 	
  
 