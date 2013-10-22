ebcaptcha
===========

jQuery Captcha Plugin

A simple, lightweight jQuery plugin for creating and implementing captcha with logic questions in jQuery.



Installation
============

Include script after the jQuery library.
<script type="text/javascript" src="jquery.ebcaptcha.js"></script>


Usage
=====
Call the plugin:

$('the_value').edoncaptcha();

"the_value" can be class or ID of the form. You are required to call a property of the form (class or ID).

When the plugin is called it will generate automatically a label and a text input at the bottom of the form before the submit input. 
The submit input automatically will disabled at the start. Also if you click on Enter it will do nothing.
Submit input will be enabled only after the logic question is right.

