require 'kramdown'
module Jekyll
  module Tags
    class LinkList < Liquid::Tag
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super
        @headingNumber  = markup || ""
        @headingNumber.strip!
      end

      def render(context)        
        output = "<div class=\"linksPanel\" id=\"linksPanel\">"
        output << "<script>$(document).ready(function() {createLinkList('#{@headingNumber}');});</script>"
        output << "</div>"        
      end
    end
  end
end

Liquid::Template.register_tag('linklist', Jekyll::Tags::LinkList)