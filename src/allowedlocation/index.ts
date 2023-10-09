import { TokenCredential } from '@azure/identity';
import { PolicyClient, PolicyAssignment } from '@azure/arm-policy';
import { PolicyInsightsClient } from '@azure/arm-policyinsights';
import { PolicyService } from './lib/PolicyService';
import { ManagementGroupAssignment } from './lib/ManagmentGroupAssignment';
import { SubscriptionAssignment } from './lib/SubscriptionAssignment';
import * as core from '@actions/core';

export class AllowedLocation {
  static async getAllowedLocation(credentials: TokenCredential, subscriptionId: string): Promise<void> {
    const policyService: PolicyService = new PolicyService(new PolicyClient(credentials, subscriptionId));
    const policyInsightsClient: PolicyInsightsClient = new PolicyInsightsClient(credentials, subscriptionId);
    const managementGroupAssignment: ManagementGroupAssignment = new ManagementGroupAssignment(
      policyService,
      policyInsightsClient,
      subscriptionId,
      credentials
    );
    const subscriptionAssignment: SubscriptionAssignment = new SubscriptionAssignment(
      policyService,
      policyInsightsClient,
      subscriptionId
    );

    console.log('Getting policy assignments of allowed locations');
    const allowedLocationPolicyAssignments: PolicyAssignment[] =
      await policyService.getPolicyAssignmentsOfAllowedLocations();

    if (await managementGroupAssignment.policyCheck(allowedLocationPolicyAssignments)) {
      console.log(`ALLOWED LOCATION POLICY IN PLACE: true`);
      core.exportVariable('allowedLocationPolicy', 'true');
      return;
    } else {
      const isSubscriptionLevelPolicyCheckPassed: boolean = await subscriptionAssignment.policyCheck(
        allowedLocationPolicyAssignments
      );

      console.log(`ALLOWED LOCATION POLICY IN PLACE: ${isSubscriptionLevelPolicyCheckPassed.toString()}`);
      core.exportVariable('allowedLocationPolicy', isSubscriptionLevelPolicyCheckPassed.toString());
      return;
    }
  }
}
