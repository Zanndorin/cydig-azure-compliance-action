export type InfoPolicyType = {
  name: string;
  subscriptionId: string;
  managementGroup?: string;
  allowedLocations: string[];
  enforcementMode: string;
};
