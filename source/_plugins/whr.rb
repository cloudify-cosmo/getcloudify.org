module Jekyll
  class WhrTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
    end

    def render(context)
      "<hr>"
    end
  end
end

Liquid::Template.register_tag('whr', Jekyll::WhrTag) 
