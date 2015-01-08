require 'kramdown'
module Jekyll
  class CurrentSectionBlock < Liquid::Block
    
    def initialize(tag_name, markup, tokens)
      super
    end

    def render(context)
      sectionPath = super.to_s
      if !sectionPath.nil?
        sectionPath = sectionPath.split("/")[1]
      end
      DocUtils.get_current_section(sectionPath)
    end
  end
end

Liquid::Template.register_tag('currentsectionblock', Jekyll::CurrentSectionBlock)