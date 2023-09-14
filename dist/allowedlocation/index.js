"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowedLocation = void 0;
const arm_policy_1 = require("@azure/arm-policy");
const arm_policyinsights_1 = require("@azure/arm-policyinsights");
const PolicyService_1 = require("./lib/PolicyService");
const core = __importStar(require("@actions/core"));
class AllowedLocation {
    static async getAllowedLocation(credentials, subscriptionId) {
        const policyClient = new arm_policy_1.PolicyClient(credentials, subscriptionId);
        const policyInsightsClient = new arm_policyinsights_1.PolicyInsightsClient(credentials, subscriptionId);
        console.log('Getting policy assignments of allowed locations');
        const allowedLocationPolicyAssigments = await PolicyService_1.PolicyService.getPolicyAssigmentsOfAllowedLocations(policyClient);
        if (await PolicyService_1.PolicyService.managementGroupPolicyCheck(allowedLocationPolicyAssigments, subscriptionId, policyInsightsClient)) {
            console.log(`ALLOWED LOCATION POLICY IN PLACE: true`);
            core.exportVariable('allowedLocationPolicy', 'true');
            return;
        }
        else {
            const isSubscriptionLevelPolicyCheckPassed = await PolicyService_1.PolicyService.subscriptionLevelPolicyCheck(allowedLocationPolicyAssigments, subscriptionId, policyInsightsClient);
            console.log(`ALLOWED LOCATION POLICY IN PLACE: ${isSubscriptionLevelPolicyCheckPassed.toString()}`);
            core.exportVariable('allowedLocationPolicy', isSubscriptionLevelPolicyCheckPassed.toString());
            console.log("core.exportVariable('allowedLocationPolicy')" + core.getInput('allowedLocationPolicy'));
            return;
        }
    }
}
exports.AllowedLocation = AllowedLocation;
//# sourceMappingURL=index.js.map