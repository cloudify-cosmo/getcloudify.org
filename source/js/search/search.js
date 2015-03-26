

var autocompleteRenderFunction = function(document_type, item) {
    var title = item["highlight"]["title"];
    var section = getSection(item["url"]);

    if (!title) {
        title = item["title"]
    }

    var sectionText = section.section != "gen"? "[" + section.desc + "] " : ""; 
    var out = "<p class='title'>" + sectionText + title + "</p>";
    if (item["highlight"]["sections"]) {
        return out.concat("<p class='sections'><span class='section'>" + item["highlight"]["sections"] + "</span></p>");
    }
    return out;
}



var Swiftype = window.Swiftype || {};
(function() {
    Swiftype.key = 'MdeBSe5BbjKxTiXEYcxH';

    Swiftype.searchFunctionalBoosts = {
        "page": {"score": "exponential"}
    };

    var sections = getSectionsForSearch();
    Swiftype.searchFilters = function() {
        return { 'page' : { 'section' : sections}};
    };

    Swiftype.autocompleteFilters = function() {
        return { 'page' : { 'section' : sections}};
    };


    Swiftype.autocompleteRenderFunction = autocompleteRenderFunction; 
    //Swiftype.autocompleteResultRenderFunction = autocompleteResultRenderFunction;
    

    /** DO NOT EDIT BELOW THIS LINE **/
    var script = document.createElement('script'); script.type = 'text/javascript'; script.async = true;
    script.src = "//s.swiftypecdn.com/embed.js";
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
}());


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function startsWith(str, prefix) {
    return str.indexOf(prefix) == 0;
}

function getSectionsForSearch() {
    var section = getSection(window.location.href).section;
    if (startsWith(section, "guide")) return section; 
    return ["guide3.1", "gen", "blog"];
}

function getSection(url) {
    if (url) {
        var urlSections = url.split("/");
        if (urlSections.length > 3) {
            if (urlSections[3] == "guide") {
                var version = urlSections.length > 4? urlSections[4]:null; 
                return {desc: version + " Docs", section:"guide" + version};
            } else if (urlSections[3] == "blog" || urlSections[3] == "tags" || $.isNumeric(urlSections[3])) {
                return {desc: "Blog", section:"blog"};
            } 
        }             
    }
    return {desc: "", section:"gen"};            
}




