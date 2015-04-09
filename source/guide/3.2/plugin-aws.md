---
layout: bt_wiki
title: AWS Plugin
category: Plugins
publish: true
abstract: Cloudify AWS plugin description and configuration
pageord: 600
---
{%summary%}
{%endsummary%}


# Description

The AWS plugin allows users to use Cloudify to manage cloud resources on AWS.
For more information about the library, please refer to: [http://boto.readthedocs.org/en/latest/index.html](http://boto.readthedocs.org/en/latest/index.html).


# Plugin Requirements

* Python Versions:
  * 2.7.x
* An account with AWS
  * Your AWS [Access Keys](http://docs.aws.amazon.com/AWSSecurityCredentials/1.0/AboutAWSCredentials.html#)


# Types

The following are [node](reference-terminology.html#node) type definitions. Nodes describe cloud resources in your cloud infrastructure. For more information, see [nodes](reference-terminology.html#node).

### Common Properties

All cloud resource nodes have common properties:

**Properties**

  * `use_external_resource` a boolean for setting whether to create the resource or use an existing one. See the [using existing resources section](#using-existing-resources). Defaults to `false`.
  * `resource_id` this can be the name of a resource when one is supported (security group and keypair) or the ID of an existing resource when the `use_external_resource` property is set to `true` (see the [using existing resources section](#using-existing-resources)). Defaults to `''` (empty string).
  * `aws_config` a dictionary that contains values you would like to pass to the connection client. For information on values that are accepted, please see [boto documentation](http://boto.readthedocs.org/en/latest/ref/ec2.html#boto.ec2.connection.EC2Connection)


## cloudify.aws.nodes.Instance

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Properties:**

  * `parameters` key-value server configuration as described in [AWS EC2 Classic](http://boto.readthedocs.org/en/latest/ref/ec2.html#module-boto.ec2.instance).
    * **Notes:**
      * The public key which is set for the server needs to match the private key name in your AWS account. The public key may be set in a number of ways:
        * By connecting the instance node to a keypair node using the `cloudify.aws.relationships.instance_connected_to_keypair` relationship.
        * By setting it explicitly in the `key_name` key under the `parameters` property.
        * If the agent's keypair information is set in the provider context, the agents' keypair will serve as the default public key to be used if it was not specified otherwise.
      * If the server is to have an agent installed on it, it should use the agents security group. If you are using a manager bootstrapped with the standard aws-manager-blueprint, there is a provider context dictionary on the manager that provides this value to the plugin. You can also use other security groups by:
        * `security_groups`: list of security group names.
        * `security_group_ids`: a list of security group IDs.
  * `image_id` The AMI image id for the instance. For more information, please refer to: [http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/finding-an-ami.html](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/finding-an-ami.html)
  * `instance_type` The instance type for the instance. For more information, please refer to: [http://aws.amazon.com/ec2/instance-types/](http://aws.amazon.com/ec2/instance-types/)

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the instance.
  * `cloudify.interfaces.lifecycle.start` starts the instance, if it's not already started.
  * `cloudify.interfaces.lifecycle.stop` stops the instance, if it's not already stopped.
  * `cloudify.interfaces.lifecycle.delete` deletes the instance and waits for termination.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additionally, the plugin checks to see if the image_id is available to your account.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

The create function also sets `reservation_id` attribute. For information, see [http://boto.readthedocs.org/en/latest/ref/ec2.html#boto.ec2.instance.Reservation](http://boto.readthedocs.org/en/latest/ref/ec2.html#boto.ec2.instance.Reservation)

Four additional `runtime_properties` are available on node instances of this type once the `cloudify.interfaces.lifecycle.start` operation succeeds:

  * `ip` the instance's private IP.
  * `private_dns_name` the instance's private FQDN in Amazon.
  * `public_dns_name` the instances's public FQDN in Amazon.
  * `public_ip_address` the instance's public IP address.


## cloudify.aws.nodes.KeyPair

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

  * `private_key_path` *Required*. The path (on the machine the plugin is running on) where the private key should be stored. If `use_external_resource` is set to `true`, the existing private key is expected to be at this path.

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the keypair.
  * `cloudify.interfaces.lifecycle.delete` deletes the keypair.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations). Additional validations which take place:
    * validation for the private key path supplied not to exist if it's a new keypair resource.
    * validation for the private key path supplied to exist and have the correct permissions and/or owner if it's an existing keypair resource.

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).


## cloudify.aws.nodes.SecurityGroup

**Derived From:** [cloudify.nodes.SecurityGroup](reference-types.html)

**Properties:**

  * `description` a description of the security group.
  * `rules` key-value security group rule configuration as described in [http://boto.readthedocs.org/en/latest/ref/ec2.html#boto.ec2.securitygroup.SecurityGroup.authorize](http://boto.readthedocs.org/en/latest/ref/ec2.html#boto.ec2.securitygroup.SecurityGroup.authorize). Defaults to `[]`.
      * `ip_protocol`
      * `from_port`
      * `to_port`
      * `cidr_ip` OR `src_group_id`.

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the security group, along with its defined rules.
  * `cloudify.interfaces.lifecycle.delete` deletes the security group.
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).


## cloudify.aws.nodes.ElasticIP

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Mapped Operations:**

  * `cloudify.interfaces.lifecycle.create` creates the elastic IP
  * `cloudify.interfaces.lifecycle.delete` deletes the elastic IP
  * `cloudify.interfaces.validation.creation` see [common validations section](#Validations).

**Attributes:**

See the [common Runtime Properties section](#runtime-properties).

Note that the actual IP is available via the `aws_resource_id` runtime-property.



# Relationships

A [relationship](reference-terminology.html#relationship) represents a dependency and/or a connection between [nodes](reference-terminology.html#node) in Cloudify. For example, an instance can be created within a Security Group. Or an Instance can depend on a keypair.

Oftentimes, a relationship may just require that one node is created before another, because some runtime property of it is required by another node.

However, sometimes, we map relationship behavior to plugin operations. The following plugin relationship operations are defined in the AWS plugin:

 * `cloudify.aws.relationships.instance_connected_to_elastic_ip` This connects an Instance to an Elastic IP. The source is the instance and the target is the Elastic IP.

There are also non-relationship operations that nonetheless perform operations when relationships are defined:

* `cloudify.aws.relationships.instance_connected_to_keypair` The `run_instances` operation looks to see if there are any relationships that define a relationship between the instance and a keypair. If so, that keypair will be the keypair for that instance. It inserts the key's name property in the 'key_name' parameter in the `run_instances` function.

* `cloudify.aws.relationships.instance_connected_to_security_group` The `run_instances` operation looks to see if there are any relationships that define a relationship between the instance and a security group. If so, that security group's ID will be the included in the list of security groups in the 'security_group_ids' parameter in the `run_instances` function.



# Types' Common Behaviors

## Validations

All types offer the same base functionality for the `cloudify.interfaces.validation.creation` interface operation:

  * If it's a new resource (`use_external_resource` is set to `false`), the basic validation is to verify that the resource doesn't actually exist.

  * When [using an existing resource](#using-existing-resources), the validation ensures that the resource does exist.



## Runtime Properties

**See section on [runtime properties](reference-terminology.html#runtime-properties)

Node instances of any of the types defined in this plugin get set with the following runtime properties during the `cloudify.interfaces.lifecycle.create` operation:

  * `aws_resource_id` the AWS ID of the resource



## Default Resource Naming Convention

If 'use_external_resource' is set to true in the blueprint, the 'resource_id' must be that resource's ID in AWS, unless the resource type is a keypair, in which case the value is the key's name.



# Using Existing Resources

It is possible to use existing resources on AWS - whether these have been created by a different Cloudify deployment or not via Cloudify at all.

All Cloudify AWS types have a property named `use_external_resource`, whose default value is `false`. When set to `true`, the plugin will apply different semantics for each of the operations executed on the relevant node's instances:

This behavior is common to all resource types:

 * `create` If `use_external_resource` is true, the AWS plugin will check if the resource is available in your account. If no such resource is available, the operation will fail, if it is available, it will assign the `aws_resource_id` to the instance `runtime_properties`.

 * `delete` If `use_external_resource` is true, the AWS plugin will check if the resource is available in your account. If no such resource is available, the operation will fail, if it is available, it will unassign the instance `runtime_properties`.

The following behaviors are unique:

 * `aws.ec2.instance.start` If `use_external_resource` is true, the `runtime properties` for `public_ip_address`, etc, are set, and the function exits.
 * `aws.ec2.instance.stop` If `use_external_resource` is true, the `runtime properties` for `public_ip_address`, etc, are unset, and the function exits.
 * `cloudify.aws.relationships.instance_connected_to_elastic_ip` Here, both the instance's and the elasticip's `use_external_resource` value are relevant. If both are external the function sets the relationship properties. If either are not external the function fails.
 * `cloudify.aws.relationships.instance_connected_to_security_group` Here, both the instance's and the security groups's `use_external_resource` value are relevant. If both are external the function sets the relationship properties. If either are not external the function fails.


# Account Information

* The plugin needs access to your `aws_access_key_id` and `aws_secret_access_key` in order to operate.

Please read about your AWS Boto configuration here:  http://boto.readthedocs.org/en/latest/boto_config_tut.html



# Tips

* It is highly recommended to **ensure that AWS names are unique.



# Misc

* Some configuration-saving information is available in the [Provider Context](reference-terminology.html#provider-context).

  The exact details of the structure of the AWS Provider Context are not documented, because parts may change.
