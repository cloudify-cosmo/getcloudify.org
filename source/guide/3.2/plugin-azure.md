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
The Azure plugin currently supports the Azure Resource Manager API.

# Azure Terminology
The ARM (Azure Resource Manager) API introduces a new JSON based templates to deploy VMs on Azure.
Below you will find a brief overview of the architecture.

{%note title=Note%}
You can get detailed information about new Azure Resource Manager in the following [link](
https://azure.microsoft.com/en-us/documentation/articles/resource-group-overview/) <br/>
The Cloudify plugin for azure supports (Microsoft Azure) API Version = '2015-05-01-preview’.
{%endnote%}

* `Resource Group` Prior to deploying a VM on Azure, a resource group needs to be created. The resource group which will store all the resources like storage account, NIC (Network interface card), virtual networks, public ip, virtual machine etc. One resource group can have multiple VMs. A resource group may contain resources that are connected to other resources in different resource groups.
For more information, please follow this [link](https://msdn.microsoft.com/en-us/library/azure/dn790546.aspx)

* `Storage Account` Storage Accounts are used to store all your information. It gives a direct access to blobs, queues or tables on Azure. For more information, please follow this [link](https://azure.microsoft.com/en-us/documentation/articles/storage-create-storage-account/)

* `Network Interface Card (NIC)` Each VM has at least 1 NIC. Azure ARM has the option of creating NIC for the virtual machine. 
For more information, please follow this [link](https://msdn.microsoft.com/en-us/library/azure/mt163579.aspx)

* `Virtual Networks` Network objects can be created within a virtual network. It reserves an IP address space and defines subnets.
For more information, please follow this [link](https://msdn.microsoft.com/en-us/library/azure/mt163650.aspx)

* `Public IP` A unique public IP address is associated to each VM. Thia public IP can be used to connect to the internet.
For more information please follow this [link](https://msdn.microsoft.com/en-us/library/azure/mt163638.aspx)

* `Virtual Machine` Each virtual machine is associated with a NIC and a public IP address.
For more information please follow this [link](https://msdn.microsoft.com/en-us/library/azure/mt163630.aspx).


# Types

The following are [node](reference-terminology.html#node) type definitions. Nodes describe cloud resources in your cloud infrastructure. For more information, see [nodes](reference-terminology.html#node).

### Common Properties

All cloud resource nodes have common properties:

**Properties**

* `Subscription_id` is the 32 digit subscription id you will get on creation of a Microsoft Azure account in the settings tab of the older manage.azure.com portal. The location where you will find the subscription id is marked in red in the screenshot below. Defaults to ‘’ (empty string).

![Subscription ID]({{ site.baseurl }}/guide/images/azure/subscription_screenshot.jpg)

*	`location` is the region of the azure data center where you prefer to create the cloud resources. Defaults to 'West US'.
Possible valid values are:

|_ |_ |_ |
| Central US | East Asia | East US |
| East US 2 | Japan East | Japan West |
| North Europe | South Central US | Southeast Asia |
| West Europe | West US | |

*	`vm_name` This can be the name of the virtual machine created. The name of other resources required to create the virtual machine like resource group, storage account, virtual network, etc. will be derived from the vm_name string. Defaults to ‘my_vm’.

* `vm_size` The size of VM. Default size is “Standard_A2” if no size is provided.

* `image_reference_publisher` The required VM's publisher. E.G.:
** For Ubuntu 14.04, the value of this input key is 'Canonical'. 
** For Ubuntu 12.04, the value of this input key is 'Canonical'.
** For CentOS 7, value of this input key can be ‘OpenLogic’.

* `image_reference_offer` This specifies the flavor of Linux you want to use on your VM. E.G.:
** For Ubuntu 14.04: Use 'UbuntuServer'.
** For Ubuntu 12.04: Use 'UbuntuServer'.
** For CentOS7: Use 'CentOS'.

* `image_reference_sku`  This specifies the version of your Linux OS on virtual machine. E.G.:
** For Ubuntu 14.04: Use '14.04.2-LTS'
** For Ubuntu 12.04.5: Use ' 12.04.5-LTS' 
** For CentOS7: Use ' 7.0' 

*	`client_id` the location where you will find the client id in azure account on the manage.azure.com portal is marked in red in the screenshot below. Defaults to ‘’ (empty string). <br/>
Active Directory->your active directory->Applications->your application->configure->Client ID

![Client ID]({{ site.baseurl }}/guide/images/azure/client_id_screenshot.jpg)

* `tenant_id` the location where you will find the tenant id in azure account on the manage.azure.com portal is marked in red in the screenshot below. Defaults to ‘’ (empty string).
Active Directory->your active directory->Applications->your application->view endpoints->tenant id in the URLs as highlighted below.

![Tenanct]({{ site.baseurl }}/guide/images/azure/tenant_id_screenshot.jpg)

*	`aad_username` is the email address used to login to the Microsoft Azure Active Directory.
* `aad_password` is the corresponding password used with the aad_username.

* `key_data` This is the **public** key data required for the provisioning of VM. 
* 
{%note title=Note%}
For bootstrapping, you need to place the **private** key file in your client VM **(in ~/.ssh)** and run the following command : **chmod 400 ~/.ssh/id_rsa** prior to bootstrapping.
This file should be of format ‘.pem’. 
You will have to invoke this command as a sudoer.
{%endnote%}


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


# Inputs file

{% highlight yaml %}
Add an example here bootstrapping ... 
 ... 
 ...
{% endhighlight %}


# Relationships

A [relationship](reference-terminology.html#relationship) represents a dependency and/or a connection between [nodes](reference-terminology.html#node) in Cloudify For example, a virtaul machine can be created within a Resource Group. Or a NIC can depend on a Public IP.
Oftentimes, a relationship may just require that one node is created before another, because some runtime property of it is required by another node.
However, sometimes, we map relationship behavior to plugin operations. The following plugin relationship operations are defined in the Azure plugin:

* `cloudify.azure.relationships.storage_account_connected_to_resource_group`: 
This connects a storage account to a resource group. The source is the storage account and the target is the resource group. This means that unless the install workflow for resource group is not complete, the creation of storage account will not be initiated since a resource group is required for the further resources such as storage account, vnet, nic, public ip and virtual machine to be created.

* `cloudify.azure.relationships.vnet_connected_to_storage_account`:
This connects a virtual network (vnet) to storage account. Here, the source is vnet and target is storage account which means that unless the install workflow for storage account is not completed, the creation of vnet will not be initiated.

* `cloudify.azure.relationships.public_ip_connected_to_vnet`:
This connects a public ip to vnet. Here, the source is public ip and target is vnet which means that unless the install workflow for vnet is not completed, the creation of vnet will not be initiated.

* `cloudify.azure.relationships.nic_connected_to_public_ip`:
This connects a nic (network interface card) to public ip. Here, the source is nic and target is public ip which means that unless the install workflow for public ip is not completed, the creation of nic will not be initiated.

* `cloudify.azure.relationships.server_connected_to_nic`:
This connects a server i.e. a virtual machine to nic. Here, the source is server and target is nic which means that unless the install workflow for nic is not completed, virtual machine will not be provisioned.

# Tips

* It is highly recommended to **ensure that Azure names are unique.


# Misc

The exact details of the structure of the Azure Provider Context are not documented, because parts may change.

# ARM Authentication
 
ARM authentication requires to create a service principal using Azure CLI or through PowerShell. This is a one-time process required to generate authentication token. The steps to create a service principal are as follows:

*	Install the Azure CLI
*	Connect to the Azure CLI
*	Authenticate to your Service Principal using the Azure CLI 

## How to install the Azure CLI

1. Node.js application: If you don’t have [Node.js](https://nodejs.org/download/) installed on your system.
2. Once node.js is installed, you need to follow [these steps](https://azure.microsoft.com/en-us/documentation/articles/xplat-cli-install/) in order to install Azure CLI.
3. Once you have successfully installed it, you can verify it by typing *“azure”* on your shell or command prompt. It must display the following : 

![Azure Prompt]({{ site.baseurl }}/guide/images/azure/azure_prompt_screenshot.jpg)

## How to connect to Azure CLI

* Login to your azure account using CLI. - You can read more about it in [this Azure document](https://azure.microsoft.com/en-us/documentation/articles/xplat-cli-connect/#use-the-publish-settings-file-method)

## How to authenticate to your Service Principal using the Azure CLI

* In order to authenticate to your service principal using Azure CLI, you need to follow all the steps which are described in the ["Authentication Guide"](https://azure.microsoft.com/en-us/documentation/articles/resource-group-authenticate-service-principal/#authenticate-service-principal-with-password---azure-cli).

## Notes

1.	Make sure the service principal is ‘Owner’ in order to get more access.
Instead of Reader, write ‘Owner’ in the following command while following the steps in the link after it (which steps???)
```PowerShell
azure role assignment create --objectId 47193a0a-63e4-46bd-9bee-6a9f6f9c03cb -o Reader -c /subscriptions/{subscriptionId}/
```
2.	While creating an AAD (Azure Active Directory) application, you need to use the following command format:
```PowerShell
azure ad app create --name "myapp" --home-page "https://myapp.onmicrosoft.com" --identifier-uris "https://myapp.onmicrosoft.com" –password abc123
```
3.	During completion of the authentication using Azure CLI, you will get tenant id, client id (this is the application id which will be given as response on azure CLI) and client secret. 
4.	Please note down the following parameters while following the steps to authenticate via Azure CLI

*	`Application id`: This is the ‘client id’ which will be given as one of the inputs to the token generation code.
* `Tenant id`: Please note down tenant id which will be obtained in the authentication process.
* `Client secret`: This is the password that you set while creating the application on AAD.

