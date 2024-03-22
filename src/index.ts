import * as core from '@actions/core';
import { DefaultAzureCredential } from '@azure/identity';
import { SecureScore } from './securescore/SecureScore';
import { DeployedVirtualMachines } from './deployedvirtualmachines/DeployedVirtualMachines';
import { AllowedLocation } from './allowedlocation';
import { UsersInProduction } from './usersinproduction';
import { getContentOfFile } from './helpFunctions/JsonService';
import { CyDigConfig } from './types/CyDigConfig';
import { AWSDeployedEC2 } from './deployedvirtualmachines/AWSDeployedEC2';
import { AwsUsersInProduction } from './usersinproduction/awsUserReport';
import { AWSSecureScore } from './securescore/AWSSecureSecore';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // const cydigConfig: CyDigConfig = getContentOfFile(core.getInput('cydigConfigPath'));
    // if (cydigConfig.usingAWS) {
    if (true) {
      await AWSSecureScore.getScore()
      console.log("#######################################")
      await AWSDeployedEC2.getDeployedEC2s()
      console.log("#######################################")
      await AwsUsersInProduction.getUserReport()
      console.log("#######################################")
    }
    // if (cydigConfig.usingAzure) {
    //   const credentials: DefaultAzureCredential = new DefaultAzureCredential(); //Kommer via github action inloggning
    //   const subscriptionId: string = core.getInput('subscription');
    //   if (!subscriptionId) throw new Error('Could not get subscriptionId');
    //   await SecureScore.getSecureScore(credentials, subscriptionId);
    //   await DeployedVirtualMachines.getDeployedVirtualMachines(credentials, subscriptionId);
    //   await AllowedLocation.getAllowedLocation(credentials, subscriptionId);
    //   await UsersInProduction.getUsersInProduction(credentials, subscriptionId);
    // }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
