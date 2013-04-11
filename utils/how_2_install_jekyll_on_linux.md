Here is all you need to know in order install Jekyll on Linux
--------------------------------------------------------------------------------

Perform all the following as root : 
<pre><code>
yum install curl
bash -s stable < <(curl -s https://raw.github.com/wayneeseguin/rvm/master/binscripts/rvm-installer)
source /etc/profile.d/rvm.sh
source ~/.bash_profile
rvm requirements
rvm install 1.9.3
rvm rubygems 1.8.17
gem install jekyll
gem install jekyll_ext
gem install top
gem install RedCloth
rvm 1.9.3 do gem install jekyll_ext
cp /usr/local/rvm/gems/ruby-1.9.3-p125/gems/jekyll-0.11.2/lib/jekyll/converters/textile.rb /usr/local/rvm/gems/ruby-1.9.3-p125/gems/jekyll-0.11.2/lib/jekyll/converters/orig_textile.rb

</pre></code>
edit /usr/local/rvm/gems/ruby-1.9.3-p125/gems/jekyll-0.11.2/lib/jekyll/converters/textile.rb
In line 25 :
<pre><code>
    def output_ext(ext)
      ".html"
    end
// change the above to the following  :
    def output_ext(ext)
         ""
    end
</pre></code>
<pre><code>
cp /usr/local/rvm/gems/ruby-1.9.3-p125/gems/jekyll-0.11.2/bin/jekyll
/usr/local/rvm/gems/ruby-1.9.3-p125/gems/jekyll-0.11.2/bin/orig_jekyll
</pre></code>
Change the following in 
/usr/local/rvm/gems/ruby-1.9.3-p125/gems/jekyll-0.11.2/bin/jekyll
right after the following two lines (lines 268-269):
<pre><code>
  mime_types = WEBrick::HTTPUtils::DefaultMimeTypes
  mime_types.store 'js', 'application/javascript'
/* Add the following line: */
  mime_types.store nil, 'text/html'  
</pre></code> 
stop your Jekyll server  
<pre><code>
cd YOUR_SITE_ROOTFOLDER
rm �rf _site
</pre></code>

start your Jekyll server  :  

jekyll --server

Access your local site (the default port is 4000): 
http://localhost:4000



Click [here](ttps://sites.google.com/site/gigaspacesprivatewiki/cloudifysource-documentation) for Windows instructions.


