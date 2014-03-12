module Jekyll
  class WbrTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
    end

    def render(context)
      "<br/>"
    end
  end
end

Liquid::Template.register_tag('wbr', Jekyll::WbrTag) 
