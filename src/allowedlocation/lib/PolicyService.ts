import { PolicyAssignment, PolicyClient } from '@azure/arm-policy';
import { ComplianceDetail, PolicyInsightsClient, PolicyState, SummarizeResults } from '@azure/arm-policyinsights';
import { PagedAsyncIterableIterator, PageSettings } from '@azure/core-paging';
import { InfoPolicyType } from './types/InfoPolicyType';
import { isLocationAllowed } from './AllowedLocations';
import { enabledPolicyFilter } from './EnabledPolicyFilter';
import * as core from '@actions/core';

export class PolicyService {
  static async getPolicyAssigmentsOfAllowedLocations(client: PolicyClient): Promise<PolicyAssignment[]> {
    const allowedLocationPolicyAssigments: PolicyAssignment[] = [];

    const allPolicyAssigments: PagedAsyncIterableIterator<PolicyAssignment, PolicyAssignment[], PageSettings> =
      await client.policyAssignments.list();

    let policyAssigment: IteratorResult<PolicyAssignment, any> = await allPolicyAssigments.next();

    while (!policyAssigment.done) {
      if (policyAssigment.value.displayName == 'Allowed locations') {
        allowedLocationPolicyAssigments.push(policyAssigment.value);
      }
      policyAssigment = await allPolicyAssigments.next();
    }

    return allowedLocationPolicyAssigments;
  }

  static async managementGroupPolicyCheck(
    policyAssigment: PolicyAssignment[],
    subscriptionId: string,
    policyInsightsClient: PolicyInsightsClient
  ): Promise<boolean> {
    console.log('Checking if there is a policy on management group level');
    const managementGroupAllowedLocationPolicy: InfoPolicyType[] = this.getPolicyOnManagementGroupLevel(
      policyAssigment,
      subscriptionId
    );

    console.log('Checking if the policy is enabled');
    const managementGroupAllowedLocationPolicyEnabled: InfoPolicyType[] = enabledPolicyFilter(
      managementGroupAllowedLocationPolicy
    );

    if (managementGroupAllowedLocationPolicyEnabled.length > 0) {
      const locationsInPolicy: string[] = this.getLocationsInPolicy(managementGroupAllowedLocationPolicyEnabled);

      if (locationsInPolicy.length > 0) {
        console.log('Checking if the policy only contains allowed locations');

        if (isLocationAllowed(locationsInPolicy)) {
          console.log('Getting number of complaint and non compliant resources');
          this.setNumberOfNonAndCompliantResources(policyInsightsClient, managementGroupAllowedLocationPolicyEnabled);
          return true;
        }
      }
    } else {
      return false;
    }
  }

  static async subscriptionLevelPolicyCheck(
    policyAssigment: PolicyAssignment[],
    subscriptionId: string,
    policyInsightsClient: PolicyInsightsClient
  ): Promise<boolean> {
    console.log('\nChecking if there is a policy on subscription level');
    const subscriptionAllowedLocationPolicy: InfoPolicyType[] = this.getPolicyOnSubscriptionLevel(
      policyAssigment,
      subscriptionId
    );

    console.log('Checking if the policy is enabled');
    const subscriptionAllowedLocationPolicyEnabled: InfoPolicyType[] = enabledPolicyFilter(
      subscriptionAllowedLocationPolicy
    );
    if (subscriptionAllowedLocationPolicyEnabled.length > 0) {
      const locationsInPolicy: string[] = this.getLocationsInPolicy(subscriptionAllowedLocationPolicyEnabled);

      console.log('Checking if the policy only contains allowed locations');
      if (isLocationAllowed(locationsInPolicy)) {
        console.log('Getting number of complaint and non compliant resources');
        const policyResult: SummarizeResults =
          await policyInsightsClient.policyStates.summarizeForSubscriptionLevelPolicyAssignment(
            subscriptionId,
            subscriptionAllowedLocationPolicyEnabled[0].name
          );

        let numCompliantResources: number = 0;
        let numNonCompliantResources: number = 0;

        if (
          policyResult.value[0].results.resourceDetails.length == 1 &&
          policyResult.value[0].results.resourceDetails.find(
            (item: ComplianceDetail) => item.complianceState == 'compliant'
          )
        ) {
          numCompliantResources = policyResult.value[0].results.resourceDetails.find(
            (item: ComplianceDetail) => item.complianceState == 'compliant'
          ).count;
        } else if (
          policyResult.value[0].results.resourceDetails.length == 1 &&
          policyResult.value[0].results.resourceDetails.find(
            (item: ComplianceDetail) => item.complianceState == 'noncompliant'
          ).count
        ) {
          numNonCompliantResources = policyResult.value[0].results.resourceDetails.find(
            (item: ComplianceDetail) => item.complianceState == 'noncompliant'
          ).count;
        } else if (policyResult.value[0].results.resourceDetails.length > 1) {
          numCompliantResources = policyResult.value[0].results.resourceDetails.find(
            (item: ComplianceDetail) => item.complianceState == 'compliant'
          ).count;
          numNonCompliantResources = policyResult.value[0].results.resourceDetails.find(
            (item: ComplianceDetail) => item.complianceState == 'noncompliant'
          ).count;
        }

        console.log(`NUMBER OF COMPLIANT RESOURCES: ${numCompliantResources.toString()}`);
        console.log(`NUMBER OF NON-COMPLIANT RESOURCES: ${numNonCompliantResources.toString()}`);

        core.setOutput('compliantResources', numCompliantResources.toString());
        core.setOutput('nonCompliantResources', numNonCompliantResources.toString());
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  static getPolicyOnManagementGroupLevel(
    policyAssigment: PolicyAssignment[],
    subscriptionId: string
  ): InfoPolicyType[] {
    const policies: InfoPolicyType[] = [];
    for (let i: number = 0; i < policyAssigment.length; i++) {
      if (policyAssigment[i].scope.startsWith('/providers/Microsoft.Management/managementGroups/')) {
        const policy: InfoPolicyType = {
          name: policyAssigment[i].name,
          subscriptionId: subscriptionId,
          managementGroup: policyAssigment[i].scope,
          allowedLocations: policyAssigment[i].parameters.listOfAllowedLocations.value,
          enforcementMode: policyAssigment[i].enforcementMode,
        };
        policies.push(policy);
      }
    }
    return policies;
  }

  static getPolicyOnSubscriptionLevel(policyAssigment: PolicyAssignment[], subscriptionId: string): InfoPolicyType[] {
    const policies: InfoPolicyType[] = [];
    for (let i: number = 0; i < policyAssigment.length; i++) {
      if (policyAssigment[i].scope == `/subscriptions/${subscriptionId}`) {
        const policy: InfoPolicyType = {
          name: policyAssigment[i].name,
          subscriptionId: subscriptionId,
          managementGroup: policyAssigment[i].scope,
          allowedLocations: policyAssigment[i].parameters.listOfAllowedLocations.value,
          enforcementMode: policyAssigment[i].enforcementMode,
        };
        policies.push(policy);
      }
    }
    return policies;
  }

  static getLocationsInPolicy(allowedLocationPolicyEnabled: InfoPolicyType[]): string[] {
    let locations: string[] = [];
    for (let i: number = 0; i < allowedLocationPolicyEnabled.length; i++) {
      locations = locations.concat(allowedLocationPolicyEnabled[i].allowedLocations);
    }
    return locations;
  }

  static async setNumberOfNonAndCompliantResources(
    policyInsightsClient: PolicyInsightsClient,
    managementGroupAllowedLocationPolicy: InfoPolicyType[]
  ): Promise<void> {
    const listOfResourcesInSub: PagedAsyncIterableIterator<PolicyState, PolicyState[], PageSettings> =
      policyInsightsClient.policyStates.listQueryResultsForManagementGroup(
        'latest',
        managementGroupAllowedLocationPolicy[0].managementGroup?.split('/').pop(),
        {
          queryOptions: {
            filter: `policyDefinitionName eq 'e56962a6-4747-49cd-b67b-bf8b01975c4c'`,
          },
        }
      );
    let resourceState: PolicyState = await listOfResourcesInSub.next();

    let numCompliantResources: number = 0;
    let totalNumResources: number = 0;
    while (!resourceState.done) {
      if (
        resourceState.value.resourceId.startsWith(
          `/subscriptions/${managementGroupAllowedLocationPolicy[0].subscriptionId}`
        )
      ) {
        if (resourceState.value.isCompliant) {
          numCompliantResources++;
        }
        totalNumResources++;
      }
      resourceState = await listOfResourcesInSub.next();
    }

    console.log(`NUMBER OF COMPLIANT RESOURCES: ${numCompliantResources.toString()}`);
    console.log(`NUMBER OF NON-COMPLIANT RESOURCES: ${(totalNumResources - numCompliantResources).toString()}`);
    core.setOutput('compliantResources', numCompliantResources.toString());
    core.setOutput('nonCompliantResources', (totalNumResources - numCompliantResources).toString());
    return;
  }
}
