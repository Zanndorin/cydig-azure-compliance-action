import { TokenCredential } from '@azure/identity';
import { PolicyClient, PolicyAssignment } from '@azure/arm-policy';
import { PolicyInsightsClient } from '@azure/arm-policyinsights';
import { PolicyService } from './lib/PolicyService';
import * as core from '@actions/core';
export class AllowedLocation {
  static async getAllowedLocation(credentials: TokenCredential, subscriptionId: string): Promise<void> {
    const policyClient: PolicyClient = new PolicyClient(credentials, subscriptionId);
    const policyInsightsClient: PolicyInsightsClient = new PolicyInsightsClient(credentials, subscriptionId);

    console.log('Getting policy assignments of allowed locations');
    const allowedLocationPolicyAssigments: PolicyAssignment[] =
      await PolicyService.getPolicyAssigmentsOfAllowedLocations(policyClient);

    if (
      await PolicyService.managementGroupPolicyCheck(
        allowedLocationPolicyAssigments,
        subscriptionId,
        policyInsightsClient
      )
    ) {
      console.log(`ALLOWED LOCATION POLICY IN PLACE: true`);
      core.exportVariable('allowedLocationPolicy', 'true');
      return;
    } else {
      const isSubscriptionLevelPolicyCheckPassed: boolean = await PolicyService.subscriptionLevelPolicyCheck(
        allowedLocationPolicyAssigments,
        subscriptionId,
        policyInsightsClient
      );

      console.log(`ALLOWED LOCATION POLICY IN PLACE: ${isSubscriptionLevelPolicyCheckPassed.toString()}`);

      core.exportVariable('allowedLocationPolicy', isSubscriptionLevelPolicyCheckPassed.toString());
      console.log("core.exportVariable('allowedLocationPolicy')"+ core.getInput('allowedLocationPolicy'));
      return;
    }
  }
}
