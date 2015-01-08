require 'kramdown'
module Jekyll
  class CurrentVersion < Liquid::Tag
    include Liquid::StandardFilters

    def initialize(tag_name, markup, tokens)
      super
    end

    def render(context)
      versionDir = context.environments.first["page"]["url"].split("/")[2]
      if !versionDir.nil?
        versionDir
      else
        1.0 
    end
    end
  end
end

Liquid::Template.register_tag('pagescore', Jekyll::CurrentVersion)