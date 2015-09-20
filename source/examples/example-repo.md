---
layout: bt_default
title: Cloudify Examples Home
---

<script type="text/javascript">
</script>

<section id="inner-headline">
	<div class="container">
		<div class="row">
<!-- 			<div class="span12">
				<ul class="breadcrumb">
					<li><a href="/"><i class="icon-home"></i></a><i class="icon-angle-right"></i></li>
					<li class="active">Cloudify Examples</li>
				</ul>
			</div>
 -->			<div class="span12">
				<div class="inner-heading">
					<h3><a href="home.html">Back</a></h3>
				</div>
			</div>
		</div>
	</div>
</section>

<section id="content" style="padding-top:0px;">
	<div class="container" style="min-height:500px;">
		<div class="row">
			<div class="span12" style="padding: 0 0 0 200px">
                <h1><strong>cloudify-nodecellar-example-ansible</strong></h1>
### This should be horizontal
                <ul>
                    <li><a href="https://github.com/cloudify-examples/cloudify-nodecellar-example-ansible"> Source </a></li>
                    <li><a href="https://github.com/cloudify-examples/cloudify-nodecellar-example-ansible/archive/master.zip"> Download </a></li>
                    <li><a href="..."> Upload to Manager </a></li>
                <ul>

                <p>A spin on the Cloudify-Nodecellar-Example using Ansible instead of bash scripts.</p>

                <h2>Notes</h2>

                <ol>
                    <li>This is a community contributed example.</li>
                    <li> Tested only with Cloudify 3.3m4</li>
                </ol>

                <h2> Instructions</h2>

                <p>Download the Vagrant Box from GetCloudify.org: http://getcloudify.org/guide/3.2/quickstart.html#important-before-you-begin.</p>

                <p>These simple commands should start the deployment on your vagrant machine:</p>

                <ul>
                  <li>cd /vagrant</li>

                  <li>git clone https://github.com/cloudify-examples/cloudify-nodecellar-example-ansible.git</li>

                  <li>cd cloudify-nodecellar-example-ansible</li>

                  <li>git checkout {branch or tag id}</li>

                  <li>cfy local init --install-plugins -p local-ansible-blueprint.yaml -i inputs/local.yaml.template</li>

                  <li>cfy local execute -w install</li>
                </ul>
			</div>
		</div>
	</div>
</section>
