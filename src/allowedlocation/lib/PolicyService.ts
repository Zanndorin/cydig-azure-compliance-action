import { PolicyAssignment, PolicyClient } from '@azure/arm-policy';
import { PagedAsyncIterableIterator, PageSettings } from '@azure/core-paging';
import { InfoPolicyType } from './types/InfoPolicyType';
import { isLocationAllowed } from './AllowedLocations';

export class PolicyService {
  policyClient: PolicyClient;

  constructor(policyClient: PolicyClient) {
    this.policyClient = policyClient;
  }

  async getPolicyAssignmentsOfAllowedLocations(): Promise<PolicyAssignment[]> {
    const allowedLocationPolicyAssignments: PolicyAssignment[] = [];

    const allPolicyAssignments: PagedAsyncIterableIterator<PolicyAssignment, PolicyAssignment[], PageSettings> =
      this.policyClient.policyAssignments.list();

    // eslint-disable-next-line
    let policyAssignment: IteratorResult<PolicyAssignment, any> = await allPolicyAssignments.next();

    while (!policyAssignment.done) {
      if (policyAssignment.value.displayName == 'Allowed locations') {
        allowedLocationPolicyAssignments.push(policyAssignment.value);
      }
      policyAssignment = await allPolicyAssignments.next();
    }
    return allowedLocationPolicyAssignments;
  }

  async isPolicyValid(allowedLocationPolicyEnabled: InfoPolicyType[]): Promise<boolean> {
    console.log('Checking if the policy is enabled');

    if (allowedLocationPolicyEnabled.length > 0) {
      const locationsInPolicy: string[] = this.getLocationsInPolicy(allowedLocationPolicyEnabled);

      if (locationsInPolicy.length > 0) {
        console.log('Checking if the policy only contains allowed locations');
        return isLocationAllowed(locationsInPolicy);
      }
    }
    return false;
  }

  getLocationsInPolicy(allowedLocationPolicyEnabled: InfoPolicyType[]): string[] {
    let locations: string[] = [];
    for (let i: number = 0; i < allowedLocationPolicyEnabled.length; i++) {
      locations = locations.concat(allowedLocationPolicyEnabled[i].allowedLocations);
    }
    return locations;
  }
}
