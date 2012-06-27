/**
  * ScriptName: Version
  * Created: 22nd June 2012
  * By: Shlomo Sagir, Tech-Tav Documentation Limited
  *
  **/

var debug = false,
    dataFile = 'version.data.js';
	
var currentVersionText='Current';
var VersionTitle='This document refers to Cloudify Version: ';

/* Generates content object
 * Run from command prompt: cscript //nologo version.js */
if (typeof WScript != 'undefined') {
	var fso = new ActiveXObject('Scripting.FileSystemObject'),
	    fh,
	    guidePath = '../guide',
		content = "var guide = {";
	
	processFolder(guidePath, 1, false);
	
	if (content.match(/,$/)) content = content.substr(0, content.length-1);
	content += '\r\n};'
	
	fh = fso.CreateTextFile(dataFile);
	fh.Write(content);
	fh.close();
}

function processFolder(folder, level, closeBrace) {
	var fc, f;
	var firstFile = true;
	
	f = fso.GetFolder(folder);
	
	fc = new Enumerator(f.subfolders);
	for (; !fc.atEnd(); fc.moveNext()) {
		if (!fc.item().name.match(/^api$/) && !fc.item().name.match(/^images$/)) {
			content += '\r\n' + Array(level+1).join('\t') + '\'' + fc.item().name + '\':{';
			processFolder(fc.item().path, level + 1, true);
		}
	}
	
	fc = new Enumerator(f.files);
	for (; !fc.atEnd(); fc.moveNext()) {
		if (fc.item().name.match(/\.textile$/)) {
			content += ((firstFile) ? '' : ',') + '\r\n' + Array(level+1).join('\t') + '\'' + fc.item().name.replace('.textile','') + '\':true';
			firstFile = false;
		}
	}
	
	if (closeBrace) content += '\r\n' + Array(level).join('\t') + '},';
}

function addPageVersions() {
	var href = document.location.href, //'http://cloudify.org/guide/qsg/quick_start_guide', //document.location.href;
	    base = href.substr(0, href.indexOf('guide')-1),
	    path = href.substr(href.indexOf('guide')).split('/'),
		pageBasename = path[2].split('-')[0],
		pageCurrent = path[2],
		pageParts = pages = value = null,
		options = new Object;
	
	debugWrite('Base: ' + base + '\tPath: ' + path);
	
	options['version'] = '';
	if (!isEmpty((pages = getAlternatePages(path)))) {
		debugWrite('Pages: ' + pages + '\tLength: ' + pages.length);
		
		options['version'] += '<option selected="true">Choose another version</option>';
		for (page in pages) {
			debugWrite('Processing page: ' + page);
			
			pageParts = page.split('-');
			debugWrite('pageParts: ' + pageParts);
			
			value = //pageParts[0] +
					' Version: ' + ((pageParts[1]) ? pageParts[1].replace(/_/g, '\.') : currentVersionText) +
					((pageParts[2]) ? ' ,Release: ' + getRelease(pageParts[2]) : '');
					//((pageParts[2]) ? ' Release: ' + ((releases[pageParts[2]]) ? releases[pageParts[2]] : pageParts[2]) : '');
			debugWrite('Value: ' + value + '\tpageCurrent: ' + pageCurrent);
			
			options['version'] += '<option text="' + value + '" value="' + page + '">' + value + '</option>'; //((page == pageCurrent) ? ' selected="true"' : '') + '>' + value + '</option>';
		}
		
		debugWrite('options[version]: ' + options['version']);
		
		var urlPath = base + '/' + path[0] + '/' + path[1] + '/';
		
		pageParts = pageCurrent.split('-');
		var versionShowing = VersionTitle +	((pageParts[1]) ? pageParts[1].replace(/_/g, '\.') : currentVersionText) +
			((pageParts[2]) ? ' ,Release: ' + getRelease(pageParts[2]) : ''); //((releases[pageParts[2]]) ? releases[pageParts[2]] : pageParts[2]) : '');
		
		injectToHtml('#pageVersion', '<span id="versionSelectionTop">', '');
		
		injectToHtml('#versionSelectionTop', '<table class="versionTable">', '<tr><td class="impt"></td><td class="versionSelection"></td></tr>');
		injectToHtml('#versionSelectionTop table td.impt', '<span>', versionShowing);
		injectToHtml('#versionSelectionTop table td.versionSelection', '<select onchange="document.location.href = \'' + urlPath + '\' + this.options[this.selectedIndex].value;">', options['version'], 'append');
		
		injectToHtml('#pageContent', '<span id="versionSelectionBottom">', '', 'append');
		injectToHtml('#versionSelectionBottom', '<br>', '');
		injectToHtml('#versionSelectionBottom', '<table class="versionTable">', '<tr><td class="impt"></td><td class="versionSelection"></td></tr>', 'append');
		injectToHtml('#versionSelectionBottom table td.impt', '<span>', versionShowing);
		injectToHtml('#versionSelectionBottom table td.versionSelection', '<select onchange="document.location.href = \'' + urlPath + '\' + this.options[this.selectedIndex].value;">', options['version'], 'append');
	}
	
}

function getAlternatePages (path) {
	if (guide[path[1]]) {
		var pages = new Object(),
		    pageBasename = path[2].split('-')[0],
			len = pageBasename.length;
		
		for (page in guide[path[1]]) {
			if (page.substr(0, len) == pageBasename &&
			    page.substr(len,1) != '_' &&
				page != path[2]) {
				pages[page] = true;
			}
		}
		
		return ((pages) ? pages : null);
	}
	else
		return null;
}

function getRelease(release) {
	var releases = {
			ga: 'General Availability',
			mx: 'Milestone ',
			rc: 'Release Candidate'
		},
		milestone = null;
	
	debugWrite('Release: ' + release);
	if (release.match(/m\d/)) {
		milestone = release.match(/\d+/);
		release = 'mx';
		debugWrite('Release: ' + release + '\tMilestone: ' + milestone);
	}
	return ((releases[release]) ? releases[release] + ((release=='mx') ? milestone : '') : release);
}

function injectToHtml(target, element, msg, location) {
	if (location == 'append')
		$(element).html(msg).appendTo(target);
	else
		$(element).html(msg).prependTo(target);
}

function isEmpty(map) {
   for (var key in map) {
         return false;
   }
   return true;
}

function debugWrite(msg) {
	if (debug) {
		if (typeof WScript != 'undefined')
			WScript.Echo ('version.js::' + msg);
		else if (typeof console != 'undefined')
			console.log('version.js::' + msg);
	}
}