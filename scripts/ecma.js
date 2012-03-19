$(function() {

	<!--this code make the playlist-->		
	var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/D470957921551B9A?&max-results=5&v=2&alt=json&callback=?';
	var videoURL= 'http://www.youtube.com/watch?v=';
	$.getJSON(playListURL, function(data) {
		var list_data="";
		var showDescription="";
		var movieTitle="";
		var updated="";
		$.each(data.feed.entry, function(i, item) {
			var feedTitle = item.title.$t;
			var deScrip = item.media$group.media$description.$t;
			var upDate = item.updated.$t;
			var feedURL = item.link[1].href;
			var fragments = feedURL.split("/");
			var videoID = fragments[fragments.length - 2];
			var url = videoURL + videoID;
			var thumb = "http://img.youtube.com/vi/"+ videoID +"/0.jpg";
			//var description = item.description.$s;
			list_data += '<li id="'+videoID+'" class="videoThumbBox"><div class="vidThumb"><a href="'+ url +'" title="'+ feedTitle +'"><img alt="'+ feedTitle+'" src="'+ thumb +'"></a></div> <h4>'+feedTitle+'</h4><span class="mainVidDate">'+upDate+'</span><div class="clear"></div></li>';
			showDescription += '<p class="'+videoID+'" style="display:none" >'+deScrip+'</p>';
			movieTitle += '<h3 class="'+videoID+'" style="display:none"> '+feedTitle+'</h3>';
			updated += '<span class="'+videoID+'" style="display:none">'+upDate+'</span>';
		});
		
		
		$(list_data).appendTo(".videoThumbs");<!-- push li to ul.videoThumbs -->
		$('.videoDesc').empty();
		$(showDescription).appendTo(".videoDesc");<!-- push movie description  -->
		$(movieTitle).appendTo("div.clipTitle");<!-- push movie title  -->
		$(updated).appendTo(".mainVidDate div");<!-- push movie title  -->
			
			//load the first description
			var currentId = $('li.videoThumbBox').attr('id');
			$('p.'+currentId+'').show();
			$('h3.'+currentId+'').show();
            $('span.'+currentId+'').show();
	
	//this code load the player
	$("ul.videoThumbs").ytplaylist({addThumbs:true, autoPlay: false, holderId: 'ytvideo2'});
	//
	
	//this code show the right description after we click on playlist link
	$('li.videoThumbBox a').click(function() {
		$('p , div.clipTitle h3 , div.mainVidDate span ').hide();
		//$('div.mainVideo-box h3').hide();
		var currentId = $(this).parent().parent().attr('id');
		$('p.'+currentId+' , div.clipTitle h3.'+currentId+' , div.mainVidDate span.'+currentId+'' ).show();  
		//$('div.mainVideo-box h3.'+currentId+'').show();      

	});
	
});


		});