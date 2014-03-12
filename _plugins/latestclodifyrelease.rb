require 'kramdown'
module Jekyll
  module Tags
    class LatestCloudifyRelease < Liquid::Tag
      include Liquid::StandardFilters

      def initialize(tag_name, markup, tokens)
        super
      end

      def render(context)
        context.registers[:site].config["latest_cloudify_release"]
      end
      
    end
  end
end

Liquid::Template.register_tag('latestcloudifyrelease', Jekyll::Tags::LatestCloudifyRelease)