import * as core from '@actions/core';
import { DefaultAzureCredential } from '@azure/identity';
import { SecureScore } from './securescore/SecureScore';
import { DeployedVirtualMachines } from './deployedvirtualmachines/DeployedVirtualMachines';
import { AllowedLocation } from './allowedlocation';
import { UsersInProduction } from './usersinproduction';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const credentials: DefaultAzureCredential = new DefaultAzureCredential();
    const subscriptionId: string = core.getInput('subscription');
    await SecureScore.getSecureScore(credentials, subscriptionId);
    await DeployedVirtualMachines.getDeployedVirtualMachines(credentials, subscriptionId);
    await AllowedLocation.getAllowedLocation(credentials, subscriptionId);
    await UsersInProduction.getUsersInProduction(credentials, subscriptionId);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
