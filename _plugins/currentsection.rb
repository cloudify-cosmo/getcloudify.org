require 'kramdown'
module Jekyll
  class CurrentSection < Liquid::Tag

    def initialize(tag_name, markup, tokens)
      super
      @url = markup.strip
    end

    def render(context)
      sectionPath = @url.strip!
      if !sectionPath || sectionPath != ""  
        sectionPath = context.environments.first["page"]["url"].split("/")[1]
      end 
      DocUtils.get_current_section(sectionPath)
    end
  end
end

Liquid::Template.register_tag('currentsection', Jekyll::CurrentSection)