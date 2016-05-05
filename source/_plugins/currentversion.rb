require 'kramdown'
module Jekyll
  class CurrentVersion < Liquid::Tag
    include Liquid::StandardFilters

    def initialize(tag_name, markup, tokens)
      super
    end

    def render(context)
      DocUtils.get_current_version(context)
    end
  end
end

Liquid::Template.register_tag('currentversion', Jekyll::CurrentVersion)