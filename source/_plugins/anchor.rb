module Jekyll
  class AnchorTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @text = text.strip
    end

    def render(context)
      "<span id=\"#{@text}\"></span>"
    end
  end
end

Liquid::Template.register_tag('anchor', Jekyll::AnchorTag)
