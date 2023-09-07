import { InfoPolicyType } from './types/InfoPolicyType';

export function enabledPolicyFilter(allowedLocationPolicy: InfoPolicyType[]): InfoPolicyType[] {
  return allowedLocationPolicy.filter((x: InfoPolicyType) => checkIfPolicyIsEnabled(x));
}
function checkIfPolicyIsEnabled(policyAssigment: InfoPolicyType): boolean {
  return policyAssigment.enforcementMode !== 'DoNotEnforce';
}
