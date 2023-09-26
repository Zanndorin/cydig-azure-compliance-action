import { InfoPolicyType } from '../src/allowedlocation/lib/types/InfoPolicyType';

const name: string = 'testPolicy';
const subscriptionId: string = 'testSubscriptionId';
const managementGroup: string = 'testmanagementGroup';
const allowedLocations: string[] = ['sweden', 'europe'];
const enforcementModeOn: string = 'Enabled';
const enforcementModeOff: string = 'DoNotEnforce';

export const policyEnabled: InfoPolicyType = {
  name: name,
  subscriptionId: subscriptionId,
  managementGroup: managementGroup,
  allowedLocations: allowedLocations,
  enforcementMode: enforcementModeOn,
};

export const policyNotEnabled: InfoPolicyType = {
  name: name,
  subscriptionId: subscriptionId,
  managementGroup: managementGroup,
  allowedLocations: allowedLocations,
  enforcementMode: enforcementModeOff,
};

export const policyTypes: InfoPolicyType[] = [policyEnabled, policyNotEnabled];
