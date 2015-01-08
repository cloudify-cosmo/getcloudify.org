module DocUtils

  def self.get_current_version(context)
    versionDir = context.environments.first["page"]["url"].split("/")[2]
    if !versionDir.nil?
      versionDir
    else
      context.registers[:site].config["latest_cloudify_version"]
    end
  end 

  def self.get_current_section(context)
    sectionDir = context.environments.first["page"]["url"].split("/")[1]
    if sectionDir == "guide"
    	versionDir = context.environments.first["page"]["url"].split("/")[2]
    	return sectionDir + (versionDir || "")
    else 
    	if sectionDir == "blog" || sectionDir == "tags" || sectionDir.to_i > 0
    		return "blog"
    	end      
    end
    return "gen"
  end 


end
