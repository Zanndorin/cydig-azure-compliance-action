import * as core from '@actions/core';
import { SecurityCenter } from '@azure/arm-security';
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
        const octokit = github.getOctokit('github.token');
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    await octokit.request(`POST /repos/${owner}/${repo}/releases`, {
      owner: owner,
      repo: repo,
      tag_name: 'v1.0.0',
      target_commitish: 'master',
      name: 'v1.0.0',
      body: 'Description of the release',
      draft: false,
      prerelease: false,
      generate_release_notes: false,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
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
