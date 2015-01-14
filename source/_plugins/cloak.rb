module Jekyll
  module Tags
    class Togglecloak < Liquid::Block
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super
        if markup.empty?
          @div_id = "generic"
        else
          @div_id  = markup.strip.sub("id=", "")
        end
      end

      def render(context)
      	add_togglecloak(context, super)
      end

      def add_togglecloak(context, content)
      	output = "<div class='panel panel-default'><div class='panel-heading'><h4 class='panel-title'>"
        output << "<a class='accordion-toggle' data-toggle='collapse' data-parent='#accordion' href='##{@div_id}'>"
        output << Kramdown::Document.new(content).to_html
        output << "</a></h4></div>"
      end
    end

    class Gcloak < Liquid::Block
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super
        if markup.empty?
          @div_id = "generic"
        else
          @div_id  = markup.strip.sub("id=", "")
        end
      end

      def render(context)
      	add_gcloak(context, super)
      end

      def add_gcloak(context, content)
      	output = "<div id='#{@div_id}' class='panel-collapse collapse'><div class='panel-body'>"
        output << Kramdown::Document.new(content).to_html
        output << "</div></div></div>"
      end
    end
  end
end

Liquid::Template.register_tag('togglecloak', Jekyll::Tags::Togglecloak)
Liquid::Template.register_tag('gcloak', Jekyll::Tags::Gcloak)