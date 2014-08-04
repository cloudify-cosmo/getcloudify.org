//$(document).ready(function () {

    var autocompleteRenderFunction = function(document_type, item) {
        var title = item["highlight"]["title"];
        var section = getSection(item["url"]);
    
        if (!title) {
            title = item["title"]
        }
        var sectionText = section.section != "gen"? "[" + section.desc + "] " : ""; 
        var out = "<p class='title'>" + sectionText + title + "</p>";
        if (item["highlight"]["sections"]) {
            return out.concat("<p class='sections'>" + item["highlight"]["sections"] + "</p>");
        }
        return out;
    }

    var autocompleteResultRenderFunction = function(ctx, results) {
        var $list = ctx.list, config = ctx.config;
        
        var currentSection = getSection(window.location.href);

        $.each(results, function(document_type, items) {
          $.each(items, function(idx, item) {
            if (shouldIncludeInResults(currentSection, getSection(item["url"]))) {
                ctx.registerResult($('<li>' + config.renderFunction(document_type, item) + '</li>').appendTo($list), item);
            }
          });
        });
    }

    var resultRenderFunction = function(document_type, item) {
        
        var section = getSection(item["url"]);    
        
        var sectionText = section.section != "gen"? "[" + section.desc + "] " : ""; 

        var out = '<a href="' + item['url'] + '" class="st-search-result-link">' + sectionText + item['title'] + '</a>';
        return out.concat('<p class="genre">' + item['genre'] + '</p>');
    }

    var Swiftype = window.Swiftype || {};
    (function() {
        Swiftype.key = 'MdeBSe5BbjKxTiXEYcxH';

        Swiftype.searchFunctionalBoosts = {
            "page": {"score": "exponential"}
        };

        Swiftype.autocompleteRenderFunction = autocompleteRenderFunction; 
        Swiftype.autocompleteResultRenderFunction = autocompleteResultRenderFunction;
        //Swiftype.renderFunction = autocompleteRenderFunction;

        /** DO NOT EDIT BELOW THIS LINE **/
        var script = document.createElement('script'); script.type = 'text/javascript'; script.async = true;
        script.src = "//s.swiftypecdn.com/embed.js";
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
    }());

    function shouldIncludeInResults(currentSection, section) {
        if (section.section != "guide") return true; 
        if (currentSection.section != "guide") {
            return section.section != "guide" || section.version == "3.0";
        }
        return currentSection.version == section.version;         
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function startsWith(str, prefix) {
        return str.indexOf(prefix) == 0;
    }

    function getSection(url) {
        if (url) {
            var urlSections = url.split("/");
            if (urlSections.length > 3) {
                if (urlSections[3] == "guide") {
                    var version = urlSections.length > 4? urlSections[4]:null; 
                    return {desc: version + " Docs", version:version, section:"guide"};
                } else if (urlSections[3] == "blog" || urlSections[3] == "tags" || $.isNumeric(urlSections[3])) {
                    return {desc: "Blog", section:"blog"};
                } 
            }             
        }
        return {desc: "", section:"gen"};            
    }
    


//});
