import { AuthorizationManagementClient, RoleAssignment, RoleDefinition } from '@azure/arm-authorization';
import { TokenCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

export class AzureRoleService {
  private scope: string;
  private authManagementClient: AuthorizationManagementClient;
  private client: Client;
  private roleAssignments: RoleAssignment[];
  private roleDefinitionsHighPriv: RoleDefinition[];
  private roleDefinitionsLowPriv: RoleDefinition[];
  public insufficientPermission: boolean = false;

  constructor(subscriptionId: string, credentials: TokenCredential) {
    this.scope = `/subscriptions/${subscriptionId}`;
    this.authManagementClient = new AuthorizationManagementClient(credentials, subscriptionId);
    this.client = this.getClient(credentials);
  }

  private getClient(credentials: TokenCredential): Client {
    const scopes: string = 'https://graph.microsoft.com/.default';
    const authProvider: TokenCredentialAuthenticationProvider = new TokenCredentialAuthenticationProvider(credentials, {
      scopes: [scopes],
    });

    const client: Client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider,
    });
    return client;
  }
  public async setRoleAssignmentForSubscription(): Promise<void> {
    // Convert the iterator to an array
    const roleAssignmentsArray = [];
    for await (const roleAssignment of this.authManagementClient.roleAssignments.listForScope(this.scope)) {
      roleAssignmentsArray.push(roleAssignment);
    }

    // Now, you can apply the filter on the array
    this.roleAssignments = roleAssignmentsArray.filter((roleAssignment: RoleAssignment) => {
      return (
        (roleAssignment.principalType === 'User' || roleAssignment.principalType === 'Group') &&
        (roleAssignment.scope === this.scope ||
          roleAssignment.scope === '/' ||
          roleAssignment.scope.startsWith('/providers/Microsoft.Management/managementGroups/'))
      );
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
  public async getHighPrivRoleAssignments(): Promise<RoleAssignment[]> {
    // Convert the iterator to an array
    const roleDefinitionsArray = [];
    for await (const roleDefinition of this.authManagementClient.roleDefinitions.list(this.scope)) {
      roleDefinitionsArray.push(roleDefinition);
    }

    // Filter the role definitions
    this.roleDefinitionsHighPriv = roleDefinitionsArray.filter(
      (roleDefinition: RoleDefinition) =>
        roleDefinition.roleName.includes('Owner') || roleDefinition.roleName.includes('Admin'),
    );

    // Filter the role assignments based on filtered role definitions
    const highPrivRoleAssignments: RoleAssignment[] = this.roleAssignments.filter((roleAssignment: RoleAssignment) =>
      this.filterArray(this.roleDefinitionsHighPriv, roleAssignment),
    );

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

  public async getLowPrivRoleAssignments(): Promise<RoleAssignment[]> {
    // Convert the iterator to an array
    const roleDefinitionsArray = [];
    for await (const roleDefinition of this.authManagementClient.roleDefinitions.list(this.scope)) {
      roleDefinitionsArray.push(roleDefinition);
    }

    // Filter the role definitions
    this.roleDefinitionsLowPriv = roleDefinitionsArray.filter((roleDefinition: RoleDefinition) =>
      roleDefinition.roleName.includes('Reader'),
    );

    // Filter the role assignments based on filtered role definitions
    const lowPrivRoleAssignments: RoleAssignment[] = this.roleAssignments.filter((roleAssignment: RoleAssignment) =>
      this.filterArray(this.roleDefinitionsLowPriv, roleAssignment),
    );

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

  public async getMediumPrivRoleAssignments(): Promise<RoleAssignment[]> {
    const mediumPrivRoleAssignments: RoleAssignment[] = this.roleAssignments.filter(
      (roleAssignment: RoleAssignment) =>
        !(
          this.filterArray(this.roleDefinitionsLowPriv, roleAssignment) ||
          this.filterArray(this.roleDefinitionsHighPriv, roleAssignment)
        ),
    );

    return mediumPrivRoleAssignments;
  }

  public async getNumberOfAssignments(roleAssignments: RoleAssignment[]): Promise<number> {
    let numberOfAssignments: number = 0;
    for (let i: number = 0; i < roleAssignments.length; i++) {
      if (roleAssignments[i].principalType === 'Group') {
        try {
          const numberOfMembers: number = await this.getCountMembersOfGroup(roleAssignments[i].principalId);
          numberOfAssignments += numberOfMembers;
        } catch (err) {
          if (err.code === 'Authorization_RequestDenied') {
            this.insufficientPermission = true;
            console.log(
              'Found a group and your pipeline does not have access to count the members. Will add 5 users to the count.',
            );
            numberOfAssignments += 5;
          } else {
            throw err;
          }
        }
      } else {
        numberOfAssignments++;
      }
    }
    return numberOfAssignments;
  }

  private filterArray(roleDefinitions: RoleDefinition[], roleAssignment: RoleAssignment): boolean {
    return roleDefinitions.some(
      (roleDefinition: RoleDefinition) => roleDefinition.id == roleAssignment.roleDefinitionId,
    );
  }

  public async getCountMembersOfGroup(groupId: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/typedef
    const members = await this.client.api(`/groups/${groupId}/members`).get();
    let numberOfMembers: number = 0;
    for (let i: number = 0; i < members.value.length; i++) {
      if (members.value[i]['@odata.type'] === '#microsoft.graph.group') {
        const numberOfMembersInGroupInGroup: number = await this.getCountMembersOfGroup(members.value[i].id);
        numberOfMembers += numberOfMembersInGroupInGroup;
      } else {
        numberOfMembers++;
      }
    }
    return numberOfMembers;
  }

  public async printRoles(roleAssignments: RoleAssignment[]): Promise<void> {
    const roleDefinitionIds: string[] = [
      ...new Set(roleAssignments.map((roleAssignment: RoleAssignment) => roleAssignment.roleDefinitionId)),
    ];
    console.log('Roles:');
    for (let i: number = 0; i < roleDefinitionIds.length; i++) {
      console.log((await this.authManagementClient.roleDefinitions.getById(roleDefinitionIds[i])).roleName);
    }
  }
}
