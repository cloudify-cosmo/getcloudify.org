module Jekyll
  class RedirectTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @url = text.strip.split("|").first
      @title = text.strip.split("|").last
    end

    def render(context)
      output = <<-output
<div class="alert alert-warning">
  <i class="icon-warning-sign"></i>&nbsp;
  <strong>Redirection Notice</strong>
  <br />
  This page should redirect to <a href="#{@url}" title="#{@title}">#{@title}</a>.
</div>
<script type="text/JavaScript">
  setTimeout("location.href = '#{@url}';",1500);
</script>
output
    end
  end
end

Liquid::Template.register_tag('redirect', Jekyll::RedirectTag)
