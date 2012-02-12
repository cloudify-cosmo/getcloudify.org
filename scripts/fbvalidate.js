// ------------------
// Copyright 2011 Kevin Lieser, kleaserarts - Mediendesign
// info@ka-mediendesign.de, www.ka-mediendesign.de
// ------------------

var fbObjectValidationObjects = new Array("div", "span", "p", "ul", "li");

fbObjectValidationObjects.reverse(); function findFBML(string, fbmlcomm) { var i = (string).indexOf(fbmlcomm); return i === -1 ? false : true; } var x = 0; while (x < fbObjectValidationObjects.length) { var fbVObjectNode = document.getElementsByTagName(fbObjectValidationObjects[x]); var l = new Array(); for(var i=0, ll=fbVObjectNode.length; i!=ll; l.push(fbVObjectNode[i++])); l.reverse(); var fbVObject = l; var i = 0; while (i < fbVObject.length) { var fbRObject = fbVObject[i].innerHTML;
if(findFBML(fbRObject, '<!-- FBML ') != false) { var fbRObject = fbRObject.replace(/<!-- FBML /g, ""); var fbRObject = fbRObject.replace(/ FBML -->/g, ""); fbVObject[i].innerHTML = fbRObject;} i++; } x++; }