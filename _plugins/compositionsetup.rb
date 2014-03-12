module Jekyll
  class CompositionsetupTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
    end

    def render(context)
      ""
    end
  end
end

Liquid::Template.register_tag('compositionsetup', Jekyll::CompositionsetupTag)
