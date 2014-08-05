require 'kramdown'
module Jekyll
  class CurrentSection < Liquid::Tag

    def initialize(tag_name, markup, tokens)
      super
      @url = markup.strip
    end

    def render(context)      
      DocUtils.get_current_section(context)
    end
  end
end

Liquid::Template.register_tag('currentsection', Jekyll::CurrentSection)