http://www.readwriteweb.com/archives/10_twitter_list_widgets_you_can_grab_embed_right_n.php
new TWTR.Widget({
    version: 2,
    type: 'search',
    search: '@cloudifysource',
    interval: 30000,
    title: '',
    subject: '',
    width: 1005,
    height: 56,
    theme: {
        shell: {
            background: 'none',
            color: '#ffffff'
        },
        tweets: {
            background: 'none',
            color: '#393939',
            links: '#24ACC5',
        }
    },
    features: {
        scrollbar: false,
        loop: true,
        live: true,
 	avatars: false,
        behavior: 'default'
    }
}).render().start();




////New horizontal twitter script from http://www.fuzionpro.info/2010/11/add-horizontal-twitter-ticker-widget-to.html
///var tweetUsers = ['cloudifysource'];
//var buildString = "";
//
//$(document).ready(function(){
// for(var i=0;i<tweetUsers.length;i++)
// {
//  if(i!=0) buildString+='+OR+';
//  buildString+='from:'+tweetUsers[i];
// }
// 
// var fileref = document.createElement('script');
// 
// fileref.setAttribute("type","text/javascript");
// fileref.setAttribute("src", "http://search.twitter.com/search.json?q="+buildString+"&callback=TweetTick&rpp=50");
// 
// document.getElementsByTagName("head")[0].appendChild(fileref);
//});
//
//
//
//function TweetTick(ob)
//{
// var container=$('#tweet-container');
// container.html='';
// $(ob.results).each(function(el){
//      
//  var str = '<li class="rotating-item">'+formatTwitString(this.text)+'</li>';
//  container.append(str);
//  
// });
// $('#tweet-container li').hide();
//    InOut();
//}
//function formatTwitString(str)
//{
// str=' '+str;
// str = str.replace(/((ftp|https?):\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/gm,'<a href="$1" target="_blank">$1</a>');
// str = str.replace(/([^\w])\@([\w\-]+)/gm,'$1@<a href="http://twitter.com/$2" target="_blank">$2</a>');
// str = str.replace(/([^\w])\#([\w\-]+)/gm,'$1<a href="http://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
// return str;
//}
//
//
//
//
//
//
//function InOut()
//{
//var initialFadeIn = 1000;
//
//   var itemInterval = 5000;
//
//   var fadeTime = 1000;
//
//   var numberOfItems = $('#tweet-container li').length;
//
//   var currentItem = 0;
//   $('#tweet-container li').eq(currentItem).fadeIn(initialFadeIn);
//   var infiniteLoop = setInterval(function(){
//   
//    $('#tweet-container li').eq(currentItem).fadeOut(fadeTime);
//
//    if(currentItem == numberOfItems -1){
//     currentItem = 0;
//    }else{
//     currentItem++;
//    }
//    $('#tweet-container li').delay(1000);
//    $('#tweet-container li').eq(currentItem).fadeIn(fadeTime);
//   }, itemInterval);
//}
//
