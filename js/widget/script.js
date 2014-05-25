var postUrl = null;
var updatedTerm = false;
function start() {
    //  NProgress.start();
    $('#loading').attr('style', '');
    var iframe = $("#iframe");
    var postObj = {name: 'play_widget'};
    $.postMessage(JSON.stringify(postObj), postUrl, iframe.get(0).contentWindow);
	
	//for xap
 var $myDiv = $('#xapShell');
    if ( $myDiv.length){
        $('#xapShell').hide();
    }
}
function stop() {
    var iframe = $("#iframe");
    $.postMessage(JSON.stringify({name: 'stop_widget'}), postUrl, iframe.get(0).contentWindow);
}
function updateButtonState(state) {
    if (state == 'RUNNING') {
        $('#launch').data('launched', true).
        html("<span class='glyphicon glyphicon-stop'></span> Stop");
		$('#launch').css({"background":"#CD0004 ","color":"white"});
		$(".pbarWrap").show();
        $('.panel').show(200);
    } else if (state == 'STOPPED') {
        //    NProgress.done();
        $('#launch').data('launched', false).
        html("<span class='glyphicon glyphicon-play'></span> Launch Now");
		$('#launch').css({"background":"#479c18 ","color":"white"});
		$(".pbarWrap").hide();
        $('.panel').hide(200);
    }
}

function updateLog(logLines) {
    $('#log').html(logLines.join('\n'));
}
function appendLog(line) {
    $('#log').append(('\n') + line);
}

function updateUseUrl(url, title) {
    var $use = $('#use');
    updateActionButton($use, url);
}
function updateYoutubeUrlBtn(){
   var tempurl=$("#ytIframe").attr("src");
   $("#watchVideoBtn").attr('href',tempurl);
}

function updateTermUrl(url) {
    if (!updatedTerm) {
        /* var html = '<iframe id="butterfly" src="' + url + '" width="768px" height="400px" frameborder="1" scrolling="auto"></iframe>';
        html = html + '<a class="hover-wrap fancybox fancybox.iframe" data-fancybox-group="gallery" title="Cloudify Your App on Chef" href="https://www.youtube.com/embed/JQUADOKF2kM" rel="gallery"><span class"btn btn-rounded btn-default"><i class="icon-play"></i> Watch</span></a>'
        html = html + '<h2>Type the following into the terminal window:</h2><ul><li>connect 127.0.0.1</li><li>list-applications</li><li>use-application chef-server</li><li>invoke chef-server listCookbooks</li><li>invoke chef-server updateCookbooks tar "http://s3.amazonaws.com/yoramw/apache.tgz" ""</li><li>invoke chef-server listCookbooks</li><li>install-service -overrides /tmp/customeatt.properties /tmp/base_chef</li><li>list-applications</li></ul>';
        $('#butterfly-iframe').html(html);*/
		updateYoutubeUrlBtn();
		$("#ytIframe").hide();
		$("#loading").hide();
		$("#butterflyWrapper").show();
		$("#butterfly").attr("src",url);
        updatedTerm = true;
    }
}


function updateManageUrl(url) {
    updateActionButton($('#manage'), url);
}
function updateTtyUrl(url) {
    var $tty = $('#tty');
    if ($tty) {
        updateActionButton($tty, url);
    }
}
function updateActionButton($elm, url) {
    $elm.attr('href', url);
    if (url) {
        $elm.removeClass('disabled');
        $elm.attr("disabled", false);
    } else {
        $elm.addClass('disabled');
        $elm.attr("disabled", true);
    }
}
function updateTimeLeft(minutes) {
    $('#time-left').html(minutes);
}

$(function() {
    var src = 'http://launch.cloudifysource.org/widget/widget?' + 
    'apiKey=' + WIDGET_ID + 
    '&title=Launch' + 
    '&origin_page_url=' + document.location.href;
    postUrl = src;
    var html = '<iframe id="iframe" src="' + src + '" width="600" height="463"></iframe>';
    $('#hidden-iframe').html(html);
    
    $('#launch').click(function() {
        if ($('#launch').data('launched')) {
            stop();
        } else {
            start();
        }
    });
    $('#use').click(function(e) {
        if ($('#use').hasClass('disabled'))
            e.preventDefault();
    });
    
    $.receiveMessage(function(e) {
        try {
            console.log(["parent got the message", e]);
            var msg = JSON.parse(e.data);
            var $log = $("#log");
            
            if (msg.name == 'write_log') {
                $log.append($("<li/>", {html: msg.html}).addClass(msg.className));
                $log.scrollTop($log[0].scrollHeight);
            } else if (msg.name == "widget_status") {
                updateButtonState(msg.status.state);
                
                console.log(msg.status);
                updateTimeLeft(msg.status.timeleft);
                updateManageUrl('http://' + msg.status.publicIp + ':8099/');
                if (msg.status.consoleLink) {
                    updateTermUrl('http://' + msg.status.publicIp + ':8080')
                    updateUseUrl(msg.status.consoleLink.url, msg.status.consoleLink.title);
                    updateTtyUrl('http://' + msg.status.publicIp + ':8080/');
                    NProgres.done();
                } else {
                    updateTtyUrl();
                    updateUseUrl();
                }
                
                updateLog(msg.status.output);
				if(msg.status.state!="RUNNING"){
					$("#loading").attr('style', 'display:none');
					$("#butterflyWrapper").hide();
					$("#ytIframe").show();
				}
            } else if (msg.name == "stop_widget") {
                updateButtonState('STOPPED');
                appendLog('STOPPED');
                updateUseUrl();
                updateTtyUrl();
                updateManageUrl();
				
				// this section hide iframe and show youtube movie 
                $("#loading").attr('style', 'display:none');
				$("#butterflyWrapper").hide();
				$("#ytIframe").show();
				updateTimeLeft(19);
            }
			
        } catch (exception) {
            console.log(["problem receiving message... ", e, exception]);
        }
    }, function(origin) {
        return true;
    });


	//Chef Progress-bar
	var timeleft = 1140000;
	var temptime=""; 
	var $bar = $('.bar');


	$('#time-left').bind("DOMNodeInserted ",function(timeleft){
		timeleft = $('#time-left').text()*60*1000;
		 if (timeleft!=temptime){
		 var lefttoshow = 100 - ((timeleft/1000/60)*100/19);
		  var widthtoshow = 400 - ((timeleft * 400) / 1140000);
		  $bar.width(widthtoshow.toFixed(0));
		  $bar.text( lefttoshow.toFixed(0)+ "%");
		  temptime = timeleft;
		}
	});

	$('#butterfly-iframe').bind("DOMNodeInserted ",function(timeleft){
		$('#loading').hide();
	});

	//on page load btn status
	if($('#launch').text()==" Stop"){
		$('#launch').css({"background":"#CD0004 ","color":"white "});
	}else{
		$('#launch').css({"background":"#479c18 ","color":"white"});
		$(".pbarWrap").hide();
	}




});
