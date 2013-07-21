$(document).ready(function () {
	$("#tipue_search_button").click(function(){
			searchOption();
	});
	$('#search , #tipue_search_input').keydown(function(e){
		 //enter button in ASCII code
			 if(e.keyCode == 13){
			 //$('#resultsDiv').show();
			  searchOption();
			  return false;
			 }
	});
});


function searchOption(){
	 $('#tipue_search_input').tipuesearch({
          'show': 4,
		  'minimumLength': 1
     });
}