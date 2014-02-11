module Jekyll
  class Page
    def tags
        (self.data["tags"] || "").split(",")
    end

    def full_url
        File.join(@dir, self.url)
    end

    def category
        (self.data["category"] || self.data["cat"] || "")
    end

    def publish
        self.data["publish"]
    end

    def title
        self.data["title"]
    end

    def abstract
        self.data["abstract"]
    end

    def pageord
        self.data["pageord"]
    end



    alias orig_to_liquid to_liquid
    def to_liquid
        h = orig_to_liquid
					
		if (category && category != nil)
          h["category"] = category 
		else
          h["category"] = ""
		end
		hCategory=h["category"]		
		
		if (publish && publish != nil)			
          h["publish"] = publish
		else
          h["publish"] = false
        end
		hPublish=h["publish"]		
		
		if (tags && tags != nil)			  
          h["tags"] = tags
        else		  
		  h["tags"] = []
		end 
		hTags=h["tags"]		
		
		if (pageord != nil)	
		  h["pageord"] = pageord
		else
          h["pageord"] = 100
		end 
		hPageOrd=h["pageord"]		
		
		if (pageord != nil)	
			h["abstract"] = abstract
		else
			h["abstract"] = "" 
		end
		hAbstract=h["abstract"]			
        h
    end
  end
end