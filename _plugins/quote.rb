require 'kramdown'
module Jekyll
  module Tags
    class Quote < Liquid::Block
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super
      end

      def render(context)
        add_quote(context, super)
      end

      def add_quote(context, content)
        output = "<div class=\"bs-callout bs-callout-info\">"
        output << Kramdown::Document.new(content).to_html
        output << "</div>"
      end
    end
  end
end

Liquid::Template.register_tag('quote', Jekyll::Tags::Quote)