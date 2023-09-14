"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enabledPolicyFilter = void 0;
function enabledPolicyFilter(allowedLocationPolicy) {
    return allowedLocationPolicy.filter((x) => checkIfPolicyIsEnabled(x));
}
exports.enabledPolicyFilter = enabledPolicyFilter;
function checkIfPolicyIsEnabled(policyAssigment) {
    return policyAssigment.enforcementMode !== 'DoNotEnforce';
}
//# sourceMappingURL=EnabledPolicyFilter.js.map