---
layout: bt_wiki
title: Azure Plugin
category: Official Plugins
publish: false
abstract: Cloudify Azure plugin description and configuration
pageord: 600p
---


{%summary%}
This section describes how to use an Azure based cloud infrastructure in your services and applications.
For more information about Azure, please refer to: [http://azure.microsoft.com/](http://azure.microsoft.com/).
{%endsummary%}

{%note title=Note%}
The Azure plugin uses Azure's Resource Manager (ARM) API. - This API is aka IaaS V2. <br/>
This plugin enables users to use Cloudify for managing cloud resources on Microsoft Azure. For more information about the library, please refer to the [Azure SDK for Python](http://azure-sdk-for-python.readthedocs.org/en/latest/).
{%endnote%}

# Plugin Requirements
* Python Versions: 
  * 2.7.x
* An account with Microsoft Azure 
  * Your Account credentials: 
    * Username
    * Password
    * Client ID
    * Tenant ID
    * Subscription ID

# Compatibility
The Azure plugin currently supports the new Azure Resource Manager API.

{%note title=Note%}
This version supports (Microsoft Azure) API Version = '2015-05-01-preview’.
{%endnote%}

# Types

The following are [node](reference-terminology.html#node) type definitions. Nodes describe cloud resources in your cloud infrastructure. For more information, see [nodes](reference-terminology.html#node).

### Common Properties

All cloud resource nodes have common properties:

**Properties**

* `Subscription_id` is the 32 digit subscription id you will get on creation of a Microsoft Azure account in the settings tab of the older manage.azure.com portal. The location where you will find the subscription id is marked in red in the screenshot below. Defaults to ‘’ (empty string).

![Subscription ID]({{ site.baseurl }}/guide/images/azure/subscription_screenshot.jpg)

*	`location` is the region of the azure data center where you prefer to create the cloud resources. Defaults to 'West US'.
 Possible valid values are: 
   * Central US
   * East Asia
   * East US
   * East US 2
   * Japan East
   * Japan West
   * North Europe
   * South Central US
   * Southeast Asia
   * West Europe
   * West US
*	`vm_name` this can be the name of the virtual machine created. The name of other resources required to create the virtual machine like resource group, storage account, virtual network, etc. will be derived from the vm_name string. Defaults to ‘my_vm’.
*	`client_id` the location where you will find the client id in azure account on the manage.azure.com portal is marked in red in the screenshot below. Defaults to ‘’ (empty string). <br/>
Active Directory->your active directory->Applications->your application->configure->Client ID

![Client ID]({{ site.baseurl }}/guide/images/azure/client_id_screenshot.jpg)

* `tenant_id` the location where you will find the tenant id in azure account on the manage.azure.com portal is marked in red in the screenshot below. Defaults to ‘’ (empty string).
Active Directory->your active directory->Applications->your application->view endpoints->tenant id in the URLs as highlighted below.

![Tenanct]({{ site.baseurl }}/guide/images/azure/tenant_id_screenshot.jpg)

*	`username` is the email address used to login to the Microsoft Azure account portal
* `password` is the corresponding password used with the account.

## cloudify.azure.nodes.ResourceGroup

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**
 
All the common properties from the above section.
 
**Mapped Operations:**

* `cloudify.interfaces.lifecycle.create` creates the resource group.
* `cloudify.interfaces.lifecycle.delete` deletes the resource group and waits for termination.
* `cloudify.interfaces.validation.creation` see common validations section.

## cloudify.azure.nodes.Server

**Derived From:** [cloudify.nodes.Compute](reference-types.html)

**Properties:**
* `public_key` Required. The ssh public key to be used to create the virtual machine. The corresponding private key should be used to login to the remote server after creation. Defaults to ‘’ (empty string).
* `vm_size` Required. The size of the virtual machine. Azure offers standard size values. Defaults to ‘Standard A0’.
* `vm_os_type` Required. The operating system of the virtual machine to be created. Default string provided: ‘UbuntuServer’.

**Mapped Operations:**

* `cloudify.interfaces.lifecycle.create` creates the virtual machine.
* `cloudify.interfaces.lifecycle.start` starts the virtual machine, if it’s not already started.
* `cloudify.interfaces.lifecycle.stop` stops the virtual machine, if it’s not already stopped.
* `cloudify.interfaces.lifecycle.delete` deletes the virtual machine.
* `cloudify.interfaces.validation.creation` see common validations section. 

## cloudify.azure.nodes.PublicIP

**Derived From:** [cloudify.nodes.VirtualIP](reference-types.html)

**Properties:**

All the common properties from the above section.

**Mapped Operations:**

* `cloudify.interfaces.lifecycle.create` creates the public ip.
* `cloudify.interfaces.lifecycle.delete` deletes the public ip and waits for termination.
* `cloudify.interfaces.validation.creation` see common validations section. 

## cloudify.azure.nodes.StorageAccount

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

All the common properties from the above section.

**Mapped Operations:**

* `cloudify.interfaces.lifecycle.create` creates the storage account.
* `cloudify.interfaces.lifecycle.delete` deletes the storage account and waits for termination.
* `cloudify.interfaces.validation.creation` see common validations section.

## cloudify.azure.nodes.NIC

**Derived From:** [cloudify.nodes.Root](reference-types.html)

**Properties:**

All the common properties from the above section.

**Mapped Operations:**

* `cloudify.interfaces.lifecycle.create` creates the network interface card.
* `cloudify.interfaces.lifecycle.delete` deletes the network interface card and waits for termination.
* `cloudify.interfaces.validation.creation` see common validations section.

## cloudify.azure.nodes.VNET

**Derived From:** [cloudify.nodes.Network](reference-types.html)

**Properties:**
 
All the common properties from the above section.
 
**Mapped Operations:**

* `cloudify.interfaces.lifecycle.create` creates the virtual network.
* `cloudify.interfaces.lifecycle.delete` deletes the virtual network and waits for termination.
* `cloudify.interfaces.validation.creation` see common validations section.


