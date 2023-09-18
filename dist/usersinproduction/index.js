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
exports.UsersInProduction = void 0;
const AzureRoleService_1 = require("./lib/AzureRoleService");
const core = __importStar(require("@actions/core"));
class UsersInProduction {
    static async getUsersInProduction(credentials, subscriptionId) {
        // let disablePermissionWarning: string = tl.getVariable('disableWarningUsersInProd');
        let disablePermissionWarning = core.getInput('disableWarningUsersInProd');
        if (!disablePermissionWarning) {
            disablePermissionWarning = 'false';
        }
        const azureRoleService = new AzureRoleService_1.AzureRoleService(subscriptionId, credentials);
        await azureRoleService.setRoleAssignmentForSubscription();
        const highPrivRoleAssignments = await azureRoleService.getHighPrivRoleAssignments();
        const lowPrivRoleAssignments = await azureRoleService.getLowPrivRoleAssignments();
        const mediumPrivRoleAssignments = await azureRoleService.getMediumPrivRoleAssignments();
        const numberOfHighPrivRoleAssignments = await azureRoleService.getNumberOfAssignments(highPrivRoleAssignments);
        const numberOfMediumPrivRoleAssignments = await azureRoleService.getNumberOfAssignments(mediumPrivRoleAssignments);
        const numberOfLowPrivRoleAssignments = await azureRoleService.getNumberOfAssignments(lowPrivRoleAssignments);
        console.log(`Number of high privileged users in Azure: ${numberOfHighPrivRoleAssignments} `);
        await azureRoleService.printRoles(highPrivRoleAssignments);
        console.log(`\nNumber of medium privileged users in Azure: ${numberOfMediumPrivRoleAssignments} `);
        await azureRoleService.printRoles(mediumPrivRoleAssignments);
        console.log(`\nNumber of low privileged users in Azure: ${numberOfLowPrivRoleAssignments} `);
        await azureRoleService.printRoles(lowPrivRoleAssignments);
        core.exportVariable('numUserInProdSeverity1', numberOfLowPrivRoleAssignments.toString());
        core.exportVariable('numUserInProdSeverity2', numberOfMediumPrivRoleAssignments.toString());
        core.exportVariable('numUserInProdSeverity3', numberOfHighPrivRoleAssignments.toString());
        // Refactor the logs to be adjusted to github actions instead of azure devops tasks service connection
        if (azureRoleService.insufficientPermission && disablePermissionWarning && !JSON.parse(disablePermissionWarning)) {
            core.warning(`The pipeline does not have access to view members in a group in your Azure Subscription, therefore the control will add 5 members for each group it finds. 
        Follow these steps to give the pipeline the necessary permission: 
        1. Go to the App Registration connected to your pipeline in the Azure portal.
        2. Go to API permission and press Add a permission.
        3. Press Microsoft Graph --> Application permission.
        4. Choose the permission GroupMember.Read.All and press Add permission.
        5. An admin of your Azure tenant must give admin consent in order for the permission to start working.`);
        }
        else {
            console.log(`The pipeline does not have access to view members in a group in your Azure Subscription, therefore the control will add 5 members for each group it finds. 
        Follow these steps to give the pipeline the necessary permission: 
        1. Go to the App Registration connected to your pipeline in the Azure portal.
        2. Go to API permission and press Add a permission.
        3. Press Microsoft Graph --> Application permission.
        4. Choose the permission GroupMember.Read.All and press Add permission.
        5. An admin of your Azure tenant must give admin consent in order for the permission to start working.`);
        }
        return;
    }
}
exports.UsersInProduction = UsersInProduction;
//# sourceMappingURL=index.js.map