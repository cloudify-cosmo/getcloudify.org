---
layout: bt_wiki
title: Delete Deployment
category: Troubleshooting
publish: true
abstract: Explains the manual process for deleting a deployment from the Cloudify Manager
pageord: 100

---
{%summary%}{{page.abstract}}{%endsummary%}

Before you begin this process, it is important to understand that you will not be able to execute any workflows on this deployment afterwards. Specifically, the uninstall workflow. This means that any resources that were provisioned during previous workflow executions (specifically the install workflow) will have to be deleted manually as well. This process only deals with how to properly and manually delete a deployment from the cloudify manager.

{%note title=Note%}
This process is only relevant if your manager is not docker based, but
rather is using the packages based bootstrap.
{%endnote%}


## Step 1: Stop celery process running for this deployment

Each deployment will have two celery workers dedicated for this deployment. Depending on the state of your manager, these service may or may not be running.
In case they are still running, execute the following commands:

{% highlight bash %}
sudo service celeryd-<deployment_id> stop
sudo service celeryd-<deployment_id>_workflows stop
{% endhighlight %}

## Step 2: Delete deployment directories

Each deployment will have two directories dedicated fro this deployment. These directories are tied to the above mentioned workers.
To delete them, execute the following commands:

{% highlight bash %}
rm -rf ~/cloudify.<deployment_id>
rm -rf ~/cloudify.<deployment_id>_workflows
{% endhighlight %}

## Step 3: Update Elasticsearch data

### Delete the deployment executions
`curl -XDELETE 'http://{management_ip}:9200/cloudify_storage/execution/_query?pretty' -d '{"query": {"term": {"deployment_id": "<deployment_id>"}}}'`

### Delete deployment node instances
`curl -XDELETE 'http://{management_ip}:9200/cloudify_storage/node_instance/_query?pretty' -d '{"query": {"term": {"deployment_id": "<deployment_id>"}}}'`

### Delete deployment nodes
`curl -XDELETE 'http://{management_ip}:9200/cloudify_storage/node/_query?pretty' -d '{"query": {"term": {"deployment_id": "<deployment_id>"}}}'`

### Delete the deployment
`curl -XDELETE 'http://{management_ip}:9200/cloudify_storage/deployment/<deployment_id>?pretty' -d ''`

## Step 4: Verification

test that everything is ok by running 'cfy deployments list' and make sure this deployment no longer appears in the result.

