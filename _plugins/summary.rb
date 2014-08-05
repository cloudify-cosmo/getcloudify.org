require 'kramdown'
module Jekyll
  module Tags
    class Summary < Liquid::Block
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super        
      end

      def render(context)
      	add_summary(context, super)
      end

      def add_summary(context, content)      	
        content_html = Kramdown::Document.new(content).to_html
        output =  content_html.sub('<p>', '<p class="lead">')
        output.sub('<p>', '<p class="lead">')
        output << "<hr style='margin-top:5px; margin-bottom:5px;'/>"        
        output << "<ul class='nav nav-pills' style='margin-bottom: 0px;' id='summarypanel'></ul>"
        output << "<hr style='margin-top:5px; margin-bottom:25px;'/>"        
        output << "<script>$(document).ready(function() {createLinkList('h1[id]', 'summarypanel');});</script>"
      end
    end
  end
end

Liquid::Template.register_tag('summary', Jekyll::Tags::Summary)