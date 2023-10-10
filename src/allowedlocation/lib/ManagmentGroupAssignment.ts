import { PolicyAssignment } from '@azure/arm-policy';
import {
  ComplianceDetail,
  PolicyAssignmentSummary,
  PolicyInsightsClient,
  SummarizeResults,
} from '@azure/arm-policyinsights';
import { InfoPolicyType } from './types/InfoPolicyType';
import { PolicyService } from './PolicyService';
import { enabledPolicyFilter } from './EnabledPolicyFilter';
import { TokenCredential } from '@azure/identity';
import * as core from '@actions/core';

export class ManagementGroupAssignment {
  policyService: PolicyService;
  policyInsightClient: PolicyInsightsClient;
  subscriptionId: string;
  credentials: TokenCredential;

  constructor(
    policyService: PolicyService,
    policyInsightClient: PolicyInsightsClient,
    subscriptionId: string,
    credentials: TokenCredential
  ) {
    this.policyService = policyService;
    this.policyInsightClient = policyInsightClient;
    this.subscriptionId = subscriptionId;
    this.credentials = credentials;
  }

  async policyCheck(policyAssignment: PolicyAssignment[]): Promise<boolean> {
    console.log('Checking if there is a policy on management group level');
    const managementGroupAllowedLocationPolicy: InfoPolicyType[] = this.getPolicy(policyAssignment);
    const allowedLocationPolicyEnabled: InfoPolicyType[] = enabledPolicyFilter(managementGroupAllowedLocationPolicy);
    if (await this.policyService.isPolicyValid(allowedLocationPolicyEnabled)) {
      await this.setNumberOfNonAndCompliantResources(allowedLocationPolicyEnabled);
      return true;
    }
    return false;
  }

  getPolicy(policyAssignment: PolicyAssignment[]): InfoPolicyType[] {
    const policies: InfoPolicyType[] = [];
    for (let i: number = 0; i < policyAssignment.length; i++) {
      if (policyAssignment[i].scope?.startsWith('/providers/Microsoft.Management/managementGroups/')) {
        const policy: InfoPolicyType = {
          name: policyAssignment[i]?.name as string,
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

  async setNumberOfNonAndCompliantResources(managementGroupAllowedLocationPolicy: InfoPolicyType[]): Promise<void> {
    const result: SummarizeResults = await this.policyInsightClient.policyStates.summarizeForManagementGroup(
      managementGroupAllowedLocationPolicy[0].managementGroup?.split('/').pop() as string,
      {
        queryOptions: {
          filter: `policyDefinitionName eq 'e56962a6-4747-49cd-b67b-bf8b01975c4c' and contains(resourceId,'/subscriptions/${managementGroupAllowedLocationPolicy[0].subscriptionId}')`,
        },
      }
    );

    let numCompliantResources: number = 0;
    let numNonCompliantResources: number = 0;

    result.value?.[0].policyAssignments?.forEach((policyAssignment: PolicyAssignmentSummary) => {
      if (
        policyAssignment.policyAssignmentId?.startsWith(
          managementGroupAllowedLocationPolicy[0].managementGroup?.toLowerCase() as string
        )
      ) {
        policyAssignment.results?.resourceDetails?.forEach((state: ComplianceDetail) => {
          if (state.complianceState == 'compliant') {
            numCompliantResources = state.count || 0;
          }
          if (state.complianceState == 'noncompliant') {
            numNonCompliantResources = state.count || 0;
          }
        });
      }
    });

    console.log(`NUMBER OF COMPLIANT RESOURCES: ${numCompliantResources.toString()}`);
    core.exportVariable('compliantResources', numCompliantResources.toString());
    console.log(`NUMBER OF NON-COMPLIANT RESOURCES: ${numNonCompliantResources.toString()}`);
    core.exportVariable('nonCompliantResources', numNonCompliantResources.toString());
    return;
  }
}
