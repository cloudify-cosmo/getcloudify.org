$(function() {
		$( "#accordion" ).accordion({autoHeight:false, navigation: false,collapsible: true,
		create: function(event, ui) {
			$(this).children("h3").each(function(i){
			 if (this.val() == $(".pageTitle").val() ) {
			 	activate(i);
			 }
			})
		}
		});
});