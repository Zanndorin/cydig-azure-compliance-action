"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureRoleService = void 0;
const arm_authorization_1 = require("@azure/arm-authorization");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
const azureTokenCredentials_1 = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
class AzureRoleService {
    scope;
    authManagementClient;
    client;
    roleAssignments;
    roleDefinitionsHighPriv;
    roleDefinitionsLowPriv;
    insufficientPermission = false;
    constructor(subscriptionId, credentials) {
        this.scope = `/subscriptions/${subscriptionId}`;
        this.authManagementClient = new arm_authorization_1.AuthorizationManagementClient(credentials, subscriptionId);
        this.client = this.getClient(credentials);
    }
    getClient(credentials) {
        const scopes = 'https://graph.microsoft.com/.default';
        const authProvider = new azureTokenCredentials_1.TokenCredentialAuthenticationProvider(credentials, {
            scopes: [scopes],
        });
        const client = microsoft_graph_client_1.Client.initWithMiddleware({
            debugLogging: true,
            authProvider,
        });
        return client;
    }
    async setRoleAssignmentForSubscription() {
        // Convert the iterator to an array
        // eslint-disable-next-line @typescript-eslint/typedef
        const roleAssignmentsArray = [];
        for await (const roleAssignment of this.authManagementClient.roleAssignments.listForScope(this.scope)) {
            roleAssignmentsArray.push(roleAssignment);
        }
        // Now, you can apply the filter on the array
        this.roleAssignments = roleAssignmentsArray.filter((roleAssignment) => {
            return ((roleAssignment.principalType === 'User' || roleAssignment.principalType === 'Group') &&
                (roleAssignment.scope === this.scope ||
                    roleAssignment.scope === '/' ||
                    roleAssignment.scope.startsWith('/providers/Microsoft.Management/managementGroups/')));
        });
    }
    // public async setRoleAssignmentForSubscription(): Promise<void> {
    //   this.roleAssignments = this.authManagementClient.roleAssignments.listForScope(this.scope)
    //     .filter((roleAssignment: RoleAssignment) => {
    //       return (
    //         (roleAssignment.principalType === 'User' ||
    //           roleAssignment.principalType === 'Group') &&
    //         (roleAssignment.scope === this.scope ||
    //           roleAssignment.scope === '/' ||
    //           roleAssignment.scope.startsWith(
    //             '/providers/Microsoft.Management/managementGroups/'
    //           ))
    //       )
    //     })
    // }
    async getHighPrivRoleAssignments() {
        // Convert the iterator to an array
        const roleDefinitionsArray = [];
        for await (const roleDefinition of this.authManagementClient.roleDefinitions.list(this.scope)) {
            roleDefinitionsArray.push(roleDefinition);
        }
        // Filter the role definitions
        this.roleDefinitionsHighPriv = roleDefinitionsArray.filter((roleDefinition) => roleDefinition.roleName.includes('Owner') || roleDefinition.roleName.includes('Admin'));
        // Filter the role assignments based on filtered role definitions
        const highPrivRoleAssignments = this.roleAssignments.filter((roleAssignment) => this.filterArray(this.roleDefinitionsHighPriv, roleAssignment));
        return highPrivRoleAssignments;
    }
    // public async getHighPrivRoleAssignments(): Promise<RoleAssignment[]> {
    //   this.roleDefinitionsHighPriv = (
    //     await this.authManagementClient.roleDefinitions.list(this.scope)
    //   ).filter(
    //     (roleDefinition: RoleDefinition) =>
    //       roleDefinition.roleName.includes('Owner') ||
    //       roleDefinition.roleName.includes('Admin')
    //   )
    //   const highPrivRoleAssignments: RoleAssignment[] =
    //     this.roleAssignments.filter((roleAssignment: RoleAssignment) =>
    //       this.filterArray(this.roleDefinitionsHighPriv, roleAssignment)
    //     )
    //   return highPrivRoleAssignments
    // }
    async getLowPrivRoleAssignments() {
        // Convert the iterator to an array
        const roleDefinitionsArray = [];
        for await (const roleDefinition of this.authManagementClient.roleDefinitions.list(this.scope)) {
            roleDefinitionsArray.push(roleDefinition);
        }
        // Filter the role definitions
        this.roleDefinitionsLowPriv = roleDefinitionsArray.filter((roleDefinition) => roleDefinition.roleName.includes('Reader'));
        // Filter the role assignments based on filtered role definitions
        const lowPrivRoleAssignments = this.roleAssignments.filter((roleAssignment) => this.filterArray(this.roleDefinitionsLowPriv, roleAssignment));
        return lowPrivRoleAssignments;
    }
    // public async getLowPrivRoleAssignments(): Promise<RoleAssignment[]> {
    //   this.roleDefinitionsLowPriv = (
    //     await this.authManagementClient.roleDefinitions.list(this.scope)
    //   ).filter((roleDefinition: RoleDefinition) =>
    //     roleDefinition.roleName.includes('Reader')
    //   )
    //   const lowPrivRoleAssignments: RoleAssignment[] =
    //     this.roleAssignments.filter((roleAssignment: RoleAssignment) =>
    //       this.filterArray(this.roleDefinitionsLowPriv, roleAssignment)
    //     )
    //   return lowPrivRoleAssignments
    // }
    async getMediumPrivRoleAssignments() {
        const mediumPrivRoleAssignments = this.roleAssignments.filter((roleAssignment) => !(this.filterArray(this.roleDefinitionsLowPriv, roleAssignment) ||
            this.filterArray(this.roleDefinitionsHighPriv, roleAssignment)));
        return mediumPrivRoleAssignments;
    }
    async getNumberOfAssignments(roleAssignments) {
        let numberOfAssignments = 0;
        for (let i = 0; i < roleAssignments.length; i++) {
            if (roleAssignments[i].principalType === 'Group') {
                try {
                    const numberOfMembers = await this.getCountMembersOfGroup(roleAssignments[i].principalId);
                    numberOfAssignments += numberOfMembers;
                }
                catch (err) {
                    if (err.code === 'Authorization_RequestDenied') {
                        this.insufficientPermission = true;
                        console.log('Found a group and your pipeline does not have access to count the members. Will add 5 users to the count.');
                        numberOfAssignments += 5;
                    }
                    else {
                        throw err;
                    }
                }
            }
            else {
                numberOfAssignments++;
            }
        }
        return numberOfAssignments;
    }
    filterArray(roleDefinitions, roleAssignment) {
        return roleDefinitions.some((roleDefinition) => roleDefinition.id == roleAssignment.roleDefinitionId);
    }
    async getCountMembersOfGroup(groupId) {
        // eslint-disable-next-line @typescript-eslint/typedef
        const members = await this.client.api(`/groups/${groupId}/members`).get();
        let numberOfMembers = 0;
        for (let i = 0; i < members.value.length; i++) {
            if (members.value[i]['@odata.type'] === '#microsoft.graph.group') {
                const numberOfMembersInGroupInGroup = await this.getCountMembersOfGroup(members.value[i].id);
                numberOfMembers += numberOfMembersInGroupInGroup;
            }
            else {
                numberOfMembers++;
            }
        }
        return numberOfMembers;
    }
    async printRoles(roleAssignments) {
        const roleDefinitionIds = [
            ...new Set(roleAssignments.map((roleAssignment) => roleAssignment.roleDefinitionId)),
        ];
        console.log('Roles:');
        for (let i = 0; i < roleDefinitionIds.length; i++) {
            console.log((await this.authManagementClient.roleDefinitions.getById(roleDefinitionIds[i])).roleName);
        }
    }
}
exports.AzureRoleService = AzureRoleService;
//# sourceMappingURL=AzureRoleService.js.map