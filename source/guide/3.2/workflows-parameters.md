---
layout: bt_wiki
title: Workflow and Execution parameters
category: Workflows
publish: true
abstract: Passing parameters to Workflows and Executions
pageord: 200


types_yaml_link: reference-types.html

default_workflows_source_link: https://github.com/cloudify-cosmo/cloudify-plugins-common/blob/3.2/cloudify/plugins/workflows.py
---

{%summary%}{{page.abstract}}{%endsummary%}


Workflows can have parameters. Workflow parameters are declared in the blueprint, and each parameter can be declared as either mandatory or optional with a default value. To learn more about parameter declaration please refer to the [Workflows Authoring Guide](workflows-authoring.html).

<br>
Viewing a workflow's parameters can be done in the CLI using the following command:

`cfy workflows get -d my_deployment -w my_workflow`

This command shows information on the `my_workflow` workflow of the `my_deployment` deployment, including the workflow's mandatory parameters as well as the optional parameters and their default values.

*Example: Retrieving a workflow's parameters*
{% highlight bash %}
$ cfy workflows get -d my_deployment -w my_workflow
Getting workflow 'my_workflow' of deployment 'my_deployment' [manager=11.0.0.7]

Workflows:
+--------------+---------------+-------------+------------+
| blueprint_id | deployment_id |     name    | created_at |
+--------------+---------------+-------------+------------+
| my_blueprint | my_deployment | my_workflow |    None    |
+--------------+---------------+-------------+------------+

Workflow Parameters:
    Mandatory Parameters:
        mandatory_parameter (this parameter is mandatory)
    Optional Parameters:
        optional_parameter:     optional_parameter_default_value        (this parameter is optional)
        nested_parameter:       {'key2': 'value2', 'key1': 'value1'}    (this parameter is also optional)

{% endhighlight %}
*The workflow has a single mandatory parameter named* `mandatory_parameter`*, and two optional parameters, one named* `optional_parameter` *which has a default value of* `optional_parameter_default_value`*, and another named* `nested_parameter` *which has a complex default value.*

<br>
When executing a workflow, it's required to specify values for all mandatory parameters, and it's possible to override the default values for any of the optional parameters. Parameters are passed in the CLI with the `-p` flag, and in YAML format. (Could be either a path to a YAML file or inline YAML [JSON is a subset of YAML, so inlining could also be in JSON format]).

*Example: Executing a workflow with parameters*
{% highlight bash %}
$ cfy executions start -d my_deployment -w my_workflow -p my_parameters.yaml
Executing workflow 'my_workflow' on deployment 'my_deployment' at management server 11.0.0.7 [timeout=900 seconds]
2014-12-04T10:02:47 CFY <my_deployment> Starting 'my_workflow' workflow execution
2014-12-04T10:02:47 CFY <my_deployment> 'my_workflow' workflow execution succeeded
Finished executing workflow 'my_workflow' on deployment'my_deployment'
* Run 'cfy events list --include-logs --execution-id 7cfd8b9c-dcd6-41bc-bc88-6aa0b00ffa62' for retrieving the execution's events/logs
{% endhighlight %}
`my_parameters.yaml`
{% highlight yaml %}
mandatory_parameter: mandatory_parameter_value
nested_parameter:
  key1: overridden_value
{% endhighlight %}
*Executing the workflow and passing the value* `mandatory_parameter_value` *for the* `mandatory_parameter` *parameter, and overriding the value of the* `nested_parameter` *parameter with a new complex value (though it could have been overridden with a non-complex value as well).*

<br>
Execution parameters are the actual parameters the execution was run with. To view those in the CLI, use the following command:

`cfy executions get -e my_execution`

{%note title=Note%}
Both workflows and executions live in the context of a deployment - The reason that a deployment is not specified in the above command is that every execution has a unique ID (in UUID format), while workflows are referred to by name which might not be unique across deployments.
{%endnote%}


*Example: Retrieving an execution's parameters*
{% highlight bash %}
$ cfy executions get -e 7cfd8b9c-dcd6-41bc-bc88-6aa0b00ffa62
Getting execution: '7cfd8b9c-dcd6-41bc-bc88-6aa0b00ffa62' [manager=11.0.0.7]

Executions:
+--------------------------------------+-------------+------------+----------------------------+-------+
|                  id                  | workflow_id |   status   |         created_at         | error |
+--------------------------------------+-------------+------------+----------------------------+-------+
| 7cfd8b9c-dcd6-41bc-bc88-6aa0b00ffa62 | my_workflow | terminated | 2014-12-04 10:02:22.728372 |       |
+--------------------------------------+-------------+------------+----------------------------+-------+

Execution Parameters:
    nested_parameter:       {'key1': 'overridden_value'}
    optional_parameter:     optional_parameter_default_value
    mandatory_parameter:    mandatory_parameter_value
{% endhighlight %}

*The workflow was executed with three parameters with the presented values. It can be seen that the* `optional parameter` *parameter was assigned with its default value, while the* `nested_parameter` *parameter's value was overridden with the new complex value.*

<br>
It is also possible to pass custom parameters that weren't declared for the workflow in the blueprint. By default, providing such parameters will raise an error, to help avoid mistakes - but if the need for such parameters arises, they can be allowed on a per-execution basis by enabling the `allow-custom-parameters` flag. For a syntax reference, see the [CFY CLI commands reference](reference-cfy.html).