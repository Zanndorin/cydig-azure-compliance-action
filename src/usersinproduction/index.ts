import { TokenCredential } from '@azure/identity';
import { AzureRoleService } from './lib/AzureRoleService';
import * as core from '@actions/core';
import { RoleAssignment } from '@azure/arm-authorization';

export class UsersInProduction {
  static async getUsersInProduction(credentials: TokenCredential, subscriptionId: string): Promise<void> {
    // let disablePermissionWarning: string = tl.getVariable('disableWarningUsersInProd');
    let disablePermissionWarning: string = core.getInput('disableWarningUsersInProd');
    if (!disablePermissionWarning) {
      disablePermissionWarning = 'false';
    }

    const azureRoleService: AzureRoleService = new AzureRoleService(subscriptionId, credentials);

    await azureRoleService.setRoleAssignmentForSubscription();

    const highPrivRoleAssignments: RoleAssignment[] = await azureRoleService.getHighPrivRoleAssignments();
    const lowPrivRoleAssignments: RoleAssignment[] = await azureRoleService.getLowPrivRoleAssignments();
    const mediumPrivRoleAssignments: RoleAssignment[] = await azureRoleService.getMediumPrivRoleAssignments();

    const numberOfHighPrivRoleAssignments: number = await azureRoleService.getNumberOfAssignments(
      highPrivRoleAssignments
    );
    const numberOfMediumPrivRoleAssignments: number = await azureRoleService.getNumberOfAssignments(
      mediumPrivRoleAssignments
    );
    const numberOfLowPrivRoleAssignments: number = await azureRoleService.getNumberOfAssignments(
      lowPrivRoleAssignments
    );

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
      core.warning(
        `The workflow does not have access to view members in a group in your Azure Subscription, therefore the control will add 5 members for each group it finds. 
        Follow these steps to give the workflow the necessary permission: 
        1. Go to the App Registration connected to your workflow in the Azure portal.
        2. Go to API permission and press Add a permission.
        3. Press Microsoft Graph --> Application permission.
        4. Choose the permission GroupMember.Read.All and press Add permission.
        5. An admin of your Azure tenant must give admin consent in order for the permission to start working.`
      );
    } else {
      console.log(
        `The workflow does not have access to view members in a group in your Azure Subscription, therefore the control will add 5 members for each group it finds. 
        Follow these steps to give the workflow the necessary permission: 
        1. Go to the App Registration connected to your workflow in the Azure portal.
        2. Go to API permission and press Add a permission.
        3. Press Microsoft Graph --> Application permission.
        4. Choose the permission GroupMember.Read.All and press Add permission.
        5. An admin of your Azure tenant must give admin consent in order for the permission to start working.`
      );
    }
    return;
  }
}
