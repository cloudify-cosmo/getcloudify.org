$(document).ready(function () {	
	//Header buttons
	
	//TOC Tree
	$(".TableOfContents").jstree( {core:{animation: 50}, "themes" : {"theme" : "classic", "dots" : false, "icons" : false },
									plugins:["themes","html_data"]} ).loaded ($(".TableOfContents").css("background-color","transparent")) }
									
);