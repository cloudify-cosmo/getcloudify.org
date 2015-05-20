module Jekyll

  # Extensions to the Jekyll Site class.

  class Site

    # Regular expression by which guide pages are recognized
    DOC_PAGE_RE = /\/guide\/.*/

    # Find my blog posts among all the pages.
    def doc_pages
        self.pages.select {|p|p.full_url =~ DOC_PAGE_RE}
    end

    # Add some custom options to the site payload, accessible via the
    # "site" variable within templates.
    #
    # articles - blog articles, in reverse chronological order
    # max_recent - maximum number of recent articles to display
    alias orig_site_payload site_payload
    def site_payload
        h = orig_site_payload
        payload = h["site"]
        payload["page_categories"] = {}
        #payload["categories"] = {}
        docs_local = self.doc_pages
        docs_local.each do |page|
            #puts page.title, page.category, page.publish

            unless payload["page_categories"].key? page.category
                payload["page_categories"][page.category] = []
            end

            if (page.publish != nil and page.publish == true)
                liquid_map = {"url" => page.url, "title" => page.title, "abstract" => page.abstract, "pageord" => page.pageord }
                page_category = payload["page_categories"][page.category] += [liquid_map]
			end
        end
            payload["page_categories"].each_pair do |category, pages|
            payload["page_categories"][category] = pages.sort {|p1, p2| p1["pageord"] <=> p2["pageord"]}
        end
		    payload["categories"]=["Getting Started", "Agents", "Release Notes","Installation & Setup","Bootstrapping","Developing Recipes","Common Patterns","Deploying Services & Applications","Monitoring Your Applications","Developing Cloud Drivers", "Plugins and Probes","Integration","REST API","Reference","Contributing", "User Interface"]
        payload["categories_3_1"]=["Installation", "Agents", "Guides", "Product Overview", "Reference", "Official Plugins", "Contributed Plugins", "DSL Specification", "User Interface", "Troubleshooting"]
        payload["categories_3_1_root"] = ['','','','','','/guide/3.1/plugin-official-general.html','/guide/3.1/plugin-contrib-general.html','/guide/3.1/dsl-spec-general.html','',''];
        payload["categories_3_2"]=[
            "Getting Started",
            "Product Overview",
            "Command-Line Interface",
            "Manager Blueprints",
            "Blueprints",
            "Workflows",
            "Plugins",
            "Official Plugins",
            "Contributed Plugins",
            "Policies",
            "DSL Specification",
            "Agents",
            "Guides",
            "Reference",
            "User Interface",
            "Troubleshooting"]
        payload["categories_3_2_root"] = [
            '/guide/3.2/getting-started.html',
            '/guide/3.2/overview-general.html',
            '/guide/3.2/cli-general.html',
            '/guide/3.2/manager-blueprints-general.html',
            '/guide/3.2/blueprints-general.html',
            '/guide/3.2/workflows-general.html',
            '/guide/3.2/plugins-general.html',
            '/guide/3.2/plugins-official-general.html',
            '/guide/3.2/plugins-contrib-general.html',
            '/guide/3.2/policies-general.html',
            '/guide/3.2/dsl-spec-general.html',
            '/guide/3.2/agents-general.html',
            '',
            '',
            '',
            ''];
        h["site"] = payload
        h
    end

  end

end
