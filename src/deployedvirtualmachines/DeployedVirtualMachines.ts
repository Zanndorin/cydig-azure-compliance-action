import { ComputeManagementClient, VirtualMachine } from '@azure/arm-compute';
import { DefaultAzureCredential } from '@azure/identity';
import * as core from '@actions/core';
export class DeployedVirtualMachines {
  static async getDeployedVirtualMachines(credentials: DefaultAzureCredential, subscriptionId: string): Promise<void> {
    console.log('Getting number of deployed virtual machines');
    const computeManagementClient: ComputeManagementClient = new ComputeManagementClient(credentials, subscriptionId);
    const allVirtualMachines: VirtualMachine[] = [];
    for await (const virtualMachine of computeManagementClient.virtualMachines.listAll()) {
      allVirtualMachines.push(virtualMachine);
    }

    console.log(`NUMBER OF DEPLOYED VIRTUAL MACHINES: ${allVirtualMachines.length}`);
    core.exportVariable('numberOfDeployedVMs', allVirtualMachines.length.toString());
  }
}
