# Cloudify Documentation

This repository contains the markup files, html templates and javascript sources for the new [Cloudify documentation portal](http://getcloudify.org/).
It's based on [Jekyll](http://jekyllrb.com/), a Ruby-based static site generator, and uses [Markdown](http://whatismarkdown.com/) as a markup language. 

## Help Us Improve! 

It's important for us to encourage your feedback and contribution. Contributing to this website is straightforward. Simply fork this repository, make your changes, test them with your local Jekyll installation, and submit a pull request. We promise to review and comment on every pull request, and merge it if it makes sense.

## Installing, Editing and Testing Locally

To run and test the website locally, you should perform the following steps:

* Install [Ruby](https://www.ruby-lang.org/en/downloads/).

* Install [RubyGems](https://rubygems.org/pages/download).

* Install [Bundler](http://bundler.io/).

        sudo gem install bundler

* Create a fork of this repo and clone it to your machine.

        git clone https://github.com/&lt;your github username&gt;/getcloudify.org.git

* Go to the repository directory: 

        cd getcloudify.org

- If you're using Windows, run `setup-win.bat` with administrative permissions (requires Windows Vista or later).
This script is a workaround for a known issue in git which ignores symbolic links on windows. 

* Make the required changes to the docs (if you need to).

* Run Jekyll in server mode, and wait for the site generation to complete: 

        jekyll serve
        
        
You should see the following output if everything was ok:
 
        .....
        Generating... 
                    done.
        Configuration file: ..../getcloudify.org/_config.yml
        Server address: http://0.0.0.0:4000/


* Point your browser to [http://localhost:4000](http://localhost:4000). You should see the documentation portal home page, and verify that you're ok with your changes. 

* If you've forked the repository and updated documentation pages, you can submit a pull request. We will review, comment and merge the pull request after approving it. 

## Continuous Deployment 

This website is hosted on AWS S3. Every push to this reposiroty triggers a build process (currently we use the excellent [Circle CI](http://circleci.com) conitnuous integration service), at the end which the generated website is pushed to S3 using the [s3_website](https://github.com/laurilehmijoki/s3_website) library. The Circle CI configuration is located at in the file [`circle.yml`](circle.yml). 

## Authoring Guidelines

You can find these guidelines [here](http://getcloudify.org/guide/3.0/cheatsheet.html)














