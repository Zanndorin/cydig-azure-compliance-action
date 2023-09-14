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
exports.PolicyService = void 0;
const AllowedLocations_1 = require("./AllowedLocations");
const EnabledPolicyFilter_1 = require("./EnabledPolicyFilter");
const core = __importStar(require("@actions/core"));
class PolicyService {
    static async getPolicyAssigmentsOfAllowedLocations(client) {
        const allowedLocationPolicyAssigments = [];
        const allPolicyAssigments = await client.policyAssignments.list();
        let policyAssigment = await allPolicyAssigments.next();
        while (!policyAssigment.done) {
            if (policyAssigment.value.displayName == 'Allowed locations') {
                allowedLocationPolicyAssigments.push(policyAssigment.value);
            }
            policyAssigment = await allPolicyAssigments.next();
        }
        return allowedLocationPolicyAssigments;
    }
    static async managementGroupPolicyCheck(policyAssigment, subscriptionId, policyInsightsClient) {
        console.log('Checking if there is a policy on management group level');
        const managementGroupAllowedLocationPolicy = this.getPolicyOnManagementGroupLevel(policyAssigment, subscriptionId);
        console.log('Checking if the policy is enabled');
        const managementGroupAllowedLocationPolicyEnabled = (0, EnabledPolicyFilter_1.enabledPolicyFilter)(managementGroupAllowedLocationPolicy);
        if (managementGroupAllowedLocationPolicyEnabled.length > 0) {
            const locationsInPolicy = this.getLocationsInPolicy(managementGroupAllowedLocationPolicyEnabled);
            if (locationsInPolicy.length > 0) {
                console.log('Checking if the policy only contains allowed locations');
                if ((0, AllowedLocations_1.isLocationAllowed)(locationsInPolicy)) {
                    console.log('Getting number of complaint and non compliant resources');
                    this.setNumberOfNonAndCompliantResources(policyInsightsClient, managementGroupAllowedLocationPolicyEnabled);
                    return true;
                }
            }
        }
        else {
            return false;
        }
    }
    static async subscriptionLevelPolicyCheck(policyAssigment, subscriptionId, policyInsightsClient) {
        console.log('\nChecking if there is a policy on subscription level');
        const subscriptionAllowedLocationPolicy = this.getPolicyOnSubscriptionLevel(policyAssigment, subscriptionId);
        console.log('Checking if the policy is enabled');
        const subscriptionAllowedLocationPolicyEnabled = (0, EnabledPolicyFilter_1.enabledPolicyFilter)(subscriptionAllowedLocationPolicy);
        if (subscriptionAllowedLocationPolicyEnabled.length > 0) {
            const locationsInPolicy = this.getLocationsInPolicy(subscriptionAllowedLocationPolicyEnabled);
            console.log('Checking if the policy only contains allowed locations');
            if ((0, AllowedLocations_1.isLocationAllowed)(locationsInPolicy)) {
                console.log('Getting number of complaint and non compliant resources');
                const policyResult = await policyInsightsClient.policyStates.summarizeForSubscriptionLevelPolicyAssignment(subscriptionId, subscriptionAllowedLocationPolicyEnabled[0].name);
                let numCompliantResources = 0;
                let numNonCompliantResources = 0;
                if (policyResult.value[0].results.resourceDetails.length == 1 &&
                    policyResult.value[0].results.resourceDetails.find((item) => item.complianceState == 'compliant')) {
                    numCompliantResources = policyResult.value[0].results.resourceDetails.find((item) => item.complianceState == 'compliant').count;
                }
                else if (policyResult.value[0].results.resourceDetails.length == 1 &&
                    policyResult.value[0].results.resourceDetails.find((item) => item.complianceState == 'noncompliant').count) {
                    numNonCompliantResources = policyResult.value[0].results.resourceDetails.find((item) => item.complianceState == 'noncompliant').count;
                }
                else if (policyResult.value[0].results.resourceDetails.length > 1) {
                    numCompliantResources = policyResult.value[0].results.resourceDetails.find((item) => item.complianceState == 'compliant').count;
                    numNonCompliantResources = policyResult.value[0].results.resourceDetails.find((item) => item.complianceState == 'noncompliant').count;
                }
                console.log(`NUMBER OF COMPLIANT RESOURCES: ${numCompliantResources.toString()}`);
                console.log(`NUMBER OF NON-COMPLIANT RESOURCES: ${numNonCompliantResources.toString()}`);
                core.exportVariable('compliantResources', numCompliantResources.toString());
                core.exportVariable('nonCompliantResources', numNonCompliantResources.toString());
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    static getPolicyOnManagementGroupLevel(policyAssigment, subscriptionId) {
        const policies = [];
        for (let i = 0; i < policyAssigment.length; i++) {
            if (policyAssigment[i].scope.startsWith('/providers/Microsoft.Management/managementGroups/')) {
                const policy = {
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
    static getPolicyOnSubscriptionLevel(policyAssigment, subscriptionId) {
        const policies = [];
        for (let i = 0; i < policyAssigment.length; i++) {
            if (policyAssigment[i].scope == `/subscriptions/${subscriptionId}`) {
                const policy = {
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
    static getLocationsInPolicy(allowedLocationPolicyEnabled) {
        let locations = [];
        for (let i = 0; i < allowedLocationPolicyEnabled.length; i++) {
            locations = locations.concat(allowedLocationPolicyEnabled[i].allowedLocations);
        }
        return locations;
    }
    static async setNumberOfNonAndCompliantResources(policyInsightsClient, managementGroupAllowedLocationPolicy) {
        const listOfResourcesInSub = policyInsightsClient.policyStates.listQueryResultsForManagementGroup('latest', managementGroupAllowedLocationPolicy[0].managementGroup?.split('/').pop(), {
            queryOptions: {
                filter: `policyDefinitionName eq 'e56962a6-4747-49cd-b67b-bf8b01975c4c'`,
            },
        });
        let resourceState = await listOfResourcesInSub.next();
        let numCompliantResources = 0;
        let totalNumResources = 0;
        while (!resourceState.done) {
            if (resourceState.value.resourceId.startsWith(`/subscriptions/${managementGroupAllowedLocationPolicy[0].subscriptionId}`)) {
                if (resourceState.value.isCompliant) {
                    numCompliantResources++;
                }
                totalNumResources++;
            }
            resourceState = await listOfResourcesInSub.next();
        }
        console.log(`NUMBER OF COMPLIANT RESOURCES: ${numCompliantResources.toString()}`);
        console.log(`NUMBER OF NON-COMPLIANT RESOURCES: ${(totalNumResources - numCompliantResources).toString()}`);
        core.exportVariable('compliantResources', numCompliantResources.toString());
        core.exportVariable('nonCompliantResources', (totalNumResources - numCompliantResources).toString());
        return;
    }
}
exports.PolicyService = PolicyService;
//# sourceMappingURL=PolicyService.js.map