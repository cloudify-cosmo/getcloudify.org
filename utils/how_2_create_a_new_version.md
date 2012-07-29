
# Creating A New Guide Version

Here is all you need to know in order create a new guide version
( for example - when version 2.3 GA is ready and you want to start working on 2.4 m1 )


*latestGAversion*
----------------------------------

Modify _includes\latestGAversion.html : 
insert the new GA version :  
 Replace  
  {% assign latestGAversion = '2.3' %}
 with 
  {% assign latestGAversion = '2.4' %} 
    
This will make sure that the banner links will always lead to the latest GA.


*if-then-else*
-----------------

Add 2.4 ( if and "then" ) to _layouts\default.html: 
Unfortunately, some of the liquid tweaks that work on my private Jekyll, do NOT work on GitHub.
So I had to do the following stuff manually...

<pre><code>         
{% capture currentVersion %}{{ page.url | remove: "/guide/" | split:"/" | first }}{% endcapture %}
{% if currentVersion contains '2.1' %}
	{% include toc2.1.html %}
{% else %}
	{% if currentVersion contains '2.2' %}
		{% include toc2.2.html %}
	{% else %}
		{% if currentVersion contains '2.3' %}					
			{% include toc2.3.html %}
		{% else %}
			{% include toc2.1.html %}
		{% endif %}						
	{% endif %}
{% endif %}	              
</pre></code>

*Generate*
-----------------

* Start your local Jekyll.  
* Wait until all files are generated ( Sometimes many files are generated 15-20 seconds after the server is up...  
(look in _site to make sure ... )  
* Run copyGeneratedPosts.sh/bat (This script is in utils folder. It will take care of the blog posts/tags etc as well). 
* Make sure that now _includes\contains toc2.2.html, toc2.3.html, toc2.4.html etc... . If these files do NOT exist, create them yourself...   
* Push to GitHub. 

