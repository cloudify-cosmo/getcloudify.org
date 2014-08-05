require 'kramdown'
module Jekyll
  module Tags
    class LinkList < Liquid::Tag
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super
        @panelPrefix = 0
        @headingStyle  = markup || ""
        @headingStyle.strip!
      end

      def render(context)      
        ++@panelPrefix
        divName = "linksPanel#{@panelPrefix}"   
        output = "<div class=\"linksPanel\" id=\"#{divName}\">"
        output << "<script>$(document).ready(function() {createLinkList('#{@headingStyle}', '#{divName}');});</script>"
        output << "</div>"        
      end
    end
  end
end

Liquid::Template.register_tag('linklist', Jekyll::Tags::LinkList)