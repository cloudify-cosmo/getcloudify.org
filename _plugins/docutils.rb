module DocUtils

  def self.get_current_version(context)
    versionDir = context.environments.first["page"]["url"].split("/")[2]
    if !versionDir.nil?
      versionDir
    else
      context.registers[:site].config["latest_cloudify_version"]
    end
  end 

end
