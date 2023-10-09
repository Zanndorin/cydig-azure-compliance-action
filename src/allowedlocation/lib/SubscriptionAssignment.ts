import { PolicyAssignment } from '@azure/arm-policy';
import { PolicyInsightsClient, PolicyState } from '@azure/arm-policyinsights';
import { InfoPolicyType } from './types/InfoPolicyType';
import { PolicyService } from './PolicyService';
import { PageSettings, PagedAsyncIterableIterator } from '@azure/core-paging';
import { enabledPolicyFilter } from './EnabledPolicyFilter';
import * as core from '@actions/core';

export class SubscriptionAssignment {
  policyService: PolicyService;
  policyInsightClient: PolicyInsightsClient;
  subscriptionId: string;

  constructor(policyService: PolicyService, policyInsightClient: PolicyInsightsClient, subscriptionId: string) {
    this.policyService = policyService;
    this.policyInsightClient = policyInsightClient;
    this.subscriptionId = subscriptionId;
  }

  async policyCheck(policyAssigment: PolicyAssignment[]): Promise<boolean> {
    console.log('\nChecking if there is a policy on subscription level');
    const subscriptionAllowedLocationPolicy: InfoPolicyType[] = this.getPolicy(policyAssigment);

    const allowedLocationPolicyEnabled: InfoPolicyType[] = enabledPolicyFilter(subscriptionAllowedLocationPolicy);

    if (await this.policyService.isPolicyValid(allowedLocationPolicyEnabled)) {
      await this.setNumberOfNonAndCompliantResources(allowedLocationPolicyEnabled);
      return true;
    }
    return false;
  }

  getPolicy(policyAssignment: PolicyAssignment[]): InfoPolicyType[] {
    const policies: InfoPolicyType[] = [];
    for (let i: number = 0; i < policyAssignment.length; i++) {
      if (policyAssignment[i].scope == `/subscriptions/${this.subscriptionId}`) {
        const policy: InfoPolicyType = {
          name: policyAssignment[i].name as string,
          subscriptionId: this.subscriptionId,
          managementGroup: policyAssignment[i].scope,
          allowedLocations: policyAssignment[i].parameters?.listOfAllowedLocations.value,
          enforcementMode: policyAssignment[i]?.enforcementMode as string,
        };
        policies.push(policy);
      }
    }
    return policies;
  }

  async setNumberOfNonAndCompliantResources(allowedLocationPolicyEnabled: InfoPolicyType[]): Promise<void> {
    const policyResult: PagedAsyncIterableIterator<PolicyState, PolicyState[], PageSettings> =
      this.policyInsightClient.policyStates.listQueryResultsForSubscriptionLevelPolicyAssignment(
        'latest',
        this.subscriptionId,
        allowedLocationPolicyEnabled[0].name
      );

    // eslint-disable-next-line
    let policy: IteratorResult<PolicyState, any> = await policyResult.next();

    let numCompliantResources: number = 0;
    let numNonCompliantResources: number = 0;
    while (!policy.done) {
      if (policy.value.isCompliant) {
        numCompliantResources++;
      } else {
        numNonCompliantResources++;
        console.debug(`Resource outside of EU: ${policy.value.resourceId?.split('/').pop()}`);
      }
      policy = await policyResult.next();
    }

    console.log(`NUMBER OF COMPLIANT RESOURCES: ${numCompliantResources.toString()}`);
    console.log(`NUMBER OF NON-COMPLIANT RESOURCES: ${numNonCompliantResources.toString()}`);
    core.exportVariable('compliantResources', numCompliantResources.toString());
    core.exportVariable('nonCompliantResources', numNonCompliantResources.toString());
  }
}
