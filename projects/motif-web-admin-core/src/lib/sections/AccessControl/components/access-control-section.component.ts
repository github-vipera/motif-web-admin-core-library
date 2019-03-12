import { process, State } from '@progress/kendo-data-query';
import { Component, OnInit, ViewChild, Input, Output } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { SelectableSettings, SelectionEvent, RowArgs, PageChangeEvent, GridDataResult,
  DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { UsersService, GroupsService, RolesService, ActionsService, PermissionsService, Group, Permission,
  Action, Role, GroupCreate, RoleCreate, ActionCreate, GroupUpdate, RoleUpdate,
  ActionUpdate } from '@wa-motif-open-api/auth-access-control-service';
import {
  UsersService as PlatformUsersService, ClientsService as PlatformClientsService, AdminsService as PlatformAdminsService,
  User, AdminUser, ClientUser, Domain, ClientsService, UserCreate, AdminUserCreate, ClientUserCreate, UserUpdate,
  AdminUserUpdate, ClientUserUpdate } from '@wa-motif-open-api/platform-service';
import * as _ from 'lodash';
import { WCNotificationCenter, NotificationType, WCGridEditorCommandsConfig, WCConfirmationTitleProvider } from 'web-console-ui-kit';
import { NewUserDialogComponent, UserDialogResult } from './dialogs/user/new-user-dialog';
import { NewAclEntityDialogComponent, DialogResult as AclDialogResult} from './dialogs/acl/new-acl-entity-dialog';
import { DialogType, EntityType } from './editors/acl-editor-context';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';
import { Observable } from 'rxjs';
import { RowCommandType, UsersListComponent } from './users-list/users-list.component';

const LOG_TAG = '[AccessControlSection]';
const BIT_LOAD_USERS = 1;
const BIT_LOAD_GROUPS = 8;
const BIT_LOAD_ROLES = 16;
const BIT_LOAD_ACTIONS = 32;
const BIT_LOAD_PERMISSIONS = 64;
const BIT_LOAD_ALL = BIT_LOAD_USERS | BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS;

@Component({
  selector: 'wa-access-control-section',
  styleUrls: ['./access-control-section.component.scss'],
  templateUrl: './access-control-section.component.html'
})
@PluginView('AccessControl', {
  iconName: 'wa-ico-users'
})

export class AccessControlSectionComponent implements OnInit {

  public size = '450px';
  public height = '330';

  statusConfirmationTitleProvider: WCConfirmationTitleProvider = {
    getTitle(rowData): string {
      if (rowData.state && rowData.state.toUpperCase() === 'ACTIVE') {
        return 'Suspend?';
      } else if (rowData.state && rowData.state.toUpperCase() === 'PREACTIVE') {
        return 'Activate?';
      } else {
        return '';
      }
    }
  };

  @ViewChild('newAclEntityDialog') _newAclEntityDialog: NewAclEntityDialogComponent;
  @ViewChild('newUserDialog') _newUserDialog: NewUserDialogComponent;
  @ViewChild('usersListGrid') _usersListGrid: UsersListComponent;

  commands: WCGridEditorCommandsConfig = [
    {
      commandIcon: 'wa-ico-edit',
      commandId: RowCommandType.Edit,
      title: 'Edit'
    },
    {
      commandIcon: 'wa-ico-no',
      commandId: RowCommandType.Delete,
      title: 'Delete',
      hasConfirmation: true,
      confirmationTitle: 'Delete?'
    }
  ];

  dropDownButtonItems: Array<any> = [{
    text: 'User',
    disabled: true
  }, {
    text: 'Admin',
    disabled: true
  }, {
    text: 'Client',
    disabled: true
  }, {
    text: 'Group',
    disabled: true
  }, {
    text: 'Role',
    disabled: false
  }, {
    text: 'Action',
    disabled: false
  }];

  public selectedDomain: string;
  public usersTabSelected = true;
  public adminsTabSelected: boolean;
  public clientsTabSelected: boolean;

  public userSelection: string[] = [];
  public adminSelection: string[] = [];
  public clientSelection: string[] = [];
  public groupSelection: string[] = [];
  public roleSelection: string[] = [];
  public actionSelection: string[] = [];
  public permissionSelection: string[] = [];

  public actionsGridView: GridDataResult;
  public actionsDataState: State = {
    skip: 0,
    take: 10,

    sort: [],

    filter: {
      logic: 'and',
      filters: []
    }
  };

  public permissionsGridView: GridDataResult;
  public permissionsDataState: State = {
    skip: 0,
    take: 10,

    sort: [],

    filter: {
      logic: 'and',
      filters: []
    }
  };

  public usersData: User[];
  public adminsData: AdminUser[];
  public clientsData: ClientUser[];
  public groupsData: Group[];
  public rolesData: Role[];
  public actionsData: Action[];
  public permissionsData: Permission[];
  public selectableSettings: SelectableSettings = {
    checkboxOnly: false,
    mode: 'single'
  };

  private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

  public permissionKey(context: RowArgs): string {
    return context.dataItem.component + ':' + context.dataItem.action + ':' + context.dataItem.target;
  }

  constructor(private logger: NGXLogger,
    private platformUsersService: PlatformUsersService,
    private platformAdminsService: PlatformAdminsService,
    private platformClientsService: PlatformClientsService,
    private usersService: UsersService,
    private groupsService: GroupsService,
    private rolesService: RolesService,
    private actionsService: ActionsService,
    private permissionsService: PermissionsService,
    private notificationCenter: WCNotificationCenter
  ) {

    this.logger.debug(LOG_TAG, 'Opening...');
  }

  ngOnInit() {
    this.logger.debug(LOG_TAG, 'Initializing...');

    this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);

  }

  public actionsPageChange(event: PageChangeEvent): void {
    this.actionsDataState.skip = event.skip;
    this.loadActions();
  }

  public onActionsDataStateChange(state: DataStateChangeEvent): void {
    this.actionsDataState = state;
    this.actionsGridView = process(this.actionsData, this.actionsDataState);
  } 

  private loadActions(): void {
    this.actionsGridView = process(this.actionsData, this.actionsDataState);
  }

  public permissionsPageChange(event: PageChangeEvent): void {
    this.permissionsDataState.skip = event.skip;
    this.loadPermissions();
  }

  public onPermissionsDataStateChange(state: DataStateChangeEvent): void {
    this.permissionsDataState = state;
    this.permissionsGridView = process(this.permissionsData, this.permissionsDataState);
  } 

  private loadPermissions(): void {
    this.permissionsGridView = process(this.permissionsData, this.permissionsDataState);
  }

  public onUserSelectionChange(e: SelectionEvent) {
    if (this.userSelection.length === 1) {
      this.groupSelection.length = this.roleSelection.length = this.actionSelection.length = this.permissionSelection.length = 0;
      this.loadGrids(BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    }
  }

  public onGroupSelectionChange(e: SelectionEvent) {
    if (this.groupSelection.length === 1) {
      this.roleSelection.length = this.actionSelection.length = this.permissionSelection.length = 0;
      this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    }
  }

  public onRoleSelectionChange(e: SelectionEvent) {
    if (this.roleSelection.length === 1) {
      this.actionSelection.length = this.permissionSelection.length = 0;
      this.loadGrids(BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    }
  }

  public onActionSelectionChange(e: SelectionEvent) {
    if (this.actionSelection.length === 1) {
      this.permissionSelection.length = 0;
      this.loadGrids(BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_PERMISSIONS);
    }
  }

  public onPermissionSelectionChange(e: SelectionEvent) {
  }

  onDomainSelected(domain: Domain) {
    this.selectedDomain = domain ? domain.name : null;
    this.clearAllGridSelections();
    this.loadGrids(BIT_LOAD_USERS | BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    this.toggleDropDownItem(domain != null, 'User', 'Admin', 'Client', 'Group');
  }

  toggleDropDownItem(enabled: Boolean, ...itemsToToggle: string[]) {
    this.dropDownButtonItems.forEach(item => {
      itemsToToggle.forEach(itemToToggle => {
        if (item.text === itemToToggle) {
          item.disabled = !enabled;
          return;
        }
      })
    });
  }

  clearAllGridSelections() {
    this.userSelection.length = this.adminSelection.length = this.clientSelection.length = this.groupSelection.length =
      this.roleSelection.length = this.actionSelection.length = this.permissionSelection.length = 0;
  }

  clearAllGridData() {
    this.usersData = this.adminsData = this.clientsData = this.groupsData = this.rolesData = this.actionsData = this.permissionsData = null;
  }

  loadGrids(gridsToLoadBitfield: number) {
    let getGroups, getRoles, getActions, getPermissions;
    const selectedUser: string = this.userSelection.length === 1 ? this.userSelection[0] : null;
    const selectedGroup: string = this.groupSelection.length === 1 ? this.groupSelection[0] : null;
    const selectedRole: string = this.roleSelection.length === 1 ? this.roleSelection[0] : null;
    const selectedAction: string = this.actionSelection.length === 1 ? this.actionSelection[0] : null;

    if (!this.selectedDomain) {
      this.userSelection.length = this.adminSelection.length = this.clientSelection.length = this.groupSelection.length = 0;
      this.usersData = this.adminsData = this.clientsData = this.groupsData = null;
    } else {
      // Load users if required
      if (BIT_LOAD_USERS & gridsToLoadBitfield) {
        this._usersListGrid.refreshData();
        this.platformAdminsService.getAdminUsersList(this.selectedDomain).subscribe(response => {
          this.adminsData = response;
        }, error => {
          this.logger.warn(LOG_TAG, 'Error loading admins: ', error);
        });
        this.platformClientsService.getClientUsersList(this.selectedDomain).subscribe(response => {
          this.clientsData = response;
        }, error => {
          this.logger.warn(LOG_TAG, 'Error loading clients: ', error);
        });
      }

      // Groups
      if (selectedUser) {
        getGroups = this.usersService.getUserGroups(this.selectedDomain, selectedUser);
      } else {
        getGroups = this.groupsService.getDomainGroups(this.selectedDomain);
      }

      if (BIT_LOAD_GROUPS & gridsToLoadBitfield) {
        getGroups.subscribe(response => {
          this.groupsData = response;
        }, error => {
          this.logger.warn(LOG_TAG, 'Error loading groups: ', error);
        });
      }
    }

    // Roles
    if (selectedGroup) {
      getRoles = this.groupsService.getGroupRoles(this.selectedDomain, selectedGroup);
    } else if (selectedUser) {
      getRoles = this.usersService.getUserRoles(this.selectedDomain, selectedUser);
    } else {
      getRoles = this.rolesService.getRoles();
    }

    // Actions
    if (selectedRole) {
      getActions = this.rolesService.getRoleActions(selectedRole);
    } else if (selectedGroup) {
      getActions = this.groupsService.getGroupActions(this.selectedDomain, selectedGroup);
    } else if (selectedUser) {
      getActions = this.usersService.getUserActions(this.selectedDomain, selectedUser);
    } else {
      getActions = this.actionsService.getActions();
    }

    // Permissions
    if (selectedAction) {
      getPermissions = this.actionsService.getActionPermissions(selectedAction);
    } else if (selectedRole) {
      getPermissions = this.rolesService.getRolePermissions(selectedRole);
    } else if (selectedGroup) {
      getPermissions = this.groupsService.getGroupPermissions(this.selectedDomain, selectedGroup);
    } else if (selectedUser) {
      getPermissions = this.usersService.getUserPermissions(this.selectedDomain, selectedUser);
    } else {
      getPermissions = this.permissionsService.getPermissions();
    }

    if (BIT_LOAD_ROLES & gridsToLoadBitfield) {
      getRoles.subscribe(response => {
        this.rolesData = response;
      }, error => {
        this.logger.warn(LOG_TAG, "Error loading roles: ", error);
      });
    }

    if (BIT_LOAD_ACTIONS & gridsToLoadBitfield) {
      getActions.subscribe(response => {
        this.actionsData = response;
        this.loadActions();
      }, error => {
        this.logger.warn(LOG_TAG, "Error loading actions: ", error);
      });
    }

    if (BIT_LOAD_PERMISSIONS & gridsToLoadBitfield) {
      getPermissions.subscribe(response => {
        this.permissionsData = response;
        this.loadPermissions();
      }, error => {
        this.logger.warn(LOG_TAG, "Error loading permissions: ", error);
      });
    }
  }

  onSelect({ dataItem, item }): void {
    //    const index = this.gridData.indexOf(dataItem);
    console.log('selected');
  }

  onResetClicked(): void {
    this.clearAllGridSelections();
    this.loadGrids(BIT_LOAD_ALL);
  }

  onLayoutChange(): void {
    console.log('layout changed: ' + this.size);
    const intHeight: number = (parseInt(this.size.replace(/px/, '')) - 120);
    this.height = '' + intHeight;
    this.actionsDataState.take = this.permissionsDataState.take = Math.ceil(intHeight / 35) + 1;
    this.loadActions();
    this.loadPermissions();
  }

  onEditAdminOKPressed(event): void {
    this._newUserDialog.show(DialogType.Edit, EntityType.Admin, event.rowData.dataItem);
  }

  onEditClientOKPressed(event): void {
    this._newUserDialog.show(DialogType.Edit, EntityType.Client, event.rowData.dataItem);
  }

  onEditGroupOKPressed(event): void {
    this._newAclEntityDialog.show(DialogType.Edit, EntityType.Group, event.rowData.dataItem);
  }

  onEditRoleOKPressed(event): void {
    this._newAclEntityDialog.show(DialogType.Edit, EntityType.Role, event.rowData.dataItem);
  }

  onEditActionOKPressed(event): void {
    this._newAclEntityDialog.show(DialogType.Edit, EntityType.Action, event.rowData.dataItem);
  }

  onDeleteAdminOKPressed(dataItem): void {
    this.deleteEntity(EntityType.Admin, dataItem);
  }

  onDeleteClientOKPressed(dataItem): void {
    this.deleteEntity(EntityType.Client, dataItem);
  }

  onDeleteGroupOKPressed(dataItem): void {
    this.deleteEntity(EntityType.Group, dataItem);
  }

  onDeleteRoleOKPressed(dataItem): void {
    this.deleteEntity(EntityType.Role, dataItem);
  }

  onDeleteActionOKPressed(dataItem): void {
    this.deleteEntity(EntityType.Action, dataItem);
  }

  onDeletePermissionOKPressed(dataItem): void {
    this.deleteEntity(EntityType.Permission, dataItem);
  }

  onUserRowCommandClick(event: any): void {
    if (event.commandType === RowCommandType.Edit) {
      this._newUserDialog.show(DialogType.Edit, EntityType.User, event.dataItem);
    } else if (event.commandType === RowCommandType.Delete) {
      this.deleteEntity(EntityType.User, event.dataItem);
    }
  }

  onAddButtonItemClick(event: any): void {
    if (event.text === 'User') {
      this._newUserDialog.show(DialogType.Create, EntityType.User);
    } else if (event.text === 'Admin') {
      this._newUserDialog.show(DialogType.Create, EntityType.Admin);
    } else if (event.text === 'Client') {
      this._newUserDialog.show(DialogType.Create, EntityType.Client);
    } else if (event.text === 'Group') {
      this._newAclEntityDialog.show(DialogType.Create, EntityType.Group);
    } else if (event.text === 'Role') {
      this._newAclEntityDialog.show(DialogType.Create, EntityType.Role);
    } else if (event.text === 'Action') {
      this._newAclEntityDialog.show(DialogType.Create, EntityType.Action);
    }
  }

  onNewAclEntityConfirm(event: AclDialogResult): void {
    this.createOrUpdateEntity(event.dialogType, event.entityType, { name: event.name, description: event.description });
  }

  onNewUserConfirm(event: UserDialogResult): void {
    this.createOrUpdateEntity(event.dialogType, event.entityType, { userId: event.userId, userIdInt: event.userIdInt, state: event.state });
  }

  private deleteEntity(entityType: EntityType, data: any): void {
    let deleteEntity: Observable<any>;
    let whatToReload: number;

    let entity: string;

    switch (entityType) {
      case EntityType.User:
        deleteEntity = this.platformUsersService.deleteUser(this.selectedDomain, data.userId);
        entity = 'User';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Admin:
        deleteEntity = this.platformAdminsService.deleteAdminUser(this.selectedDomain, data.userId);
        entity = 'Admin';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Client:
        deleteEntity = this.platformClientsService.deleteClientUser(this.selectedDomain, data.userId);
        entity = 'Client';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Group:
        deleteEntity = this.groupsService.deleteGroup(this.selectedDomain, data.rowData.dataItem.name);
        entity = 'Group';
        whatToReload = BIT_LOAD_GROUPS;
        break;
      case EntityType.Role:
        deleteEntity = this.rolesService.deleteRole(data.rowData.dataItem.name);
        entity = 'Role';
        whatToReload = BIT_LOAD_ROLES;
        break;
      case EntityType.Action:
        deleteEntity = this.actionsService.deleteAction(data.rowData.dataItem.name);
        entity = 'Action';
        whatToReload = BIT_LOAD_ACTIONS;
        break;
      case EntityType.Permission:
        deleteEntity = this.permissionsService.deletePermission(data.rowData.dataItem.component, data.rowData.dataItem.action,
          data.rowData.dataItem.target);
        entity = 'Permission';
        whatToReload = BIT_LOAD_PERMISSIONS;
        break;
    }

    this._subHandler.add(deleteEntity.subscribe(any => {

      this.logger.debug(LOG_TAG, entity, ' deleted. ');

      this.onResetClicked();

      this.notificationCenter.post({
        name: 'Delete' + entity + 'Entity',
        title: 'Deleted ' + entity + ' Entity',
        message: entity + ' deleted successfully.',
        type: NotificationType.Success
      });

    }, (error) => {

      this.logger.error(LOG_TAG, 'Delete ' + entity + ' error: ', error);

      this.notificationCenter.post({
        name: 'Delete' + entity + 'Error',
        title: 'Delete ' + entity,
        message: 'Error deleting ' + entity + ':',
        type: NotificationType.Error,
        error: error,
        closable: true
      });

    }));
  }

  private createOrUpdateEntity(dialogType: DialogType, entityType: EntityType, data: any): void {
    this.logger.debug(LOG_TAG, 'createOrUpdateAclEntity called for: ', data);

    let whatToReload: number;
    let action: Observable<any>;

    let entity: string;
    switch (entityType) {
      case EntityType.User:
        if (dialogType === DialogType.Create) {
          const uc: UserCreate = {
            userId: data.userId,
            userIdInt:
              (data.userIdInt && data.userIdInt.length) > 0 ? data.userIdInt : undefined,
            state: data.state
          };
          action = this.platformUsersService.createUser(
            this.selectedDomain,
            uc
          );
        } else {
          const uu: UserUpdate = {
            userIdInt:
            (data.userIdInt && data.userIdInt.length) > 0 ? data.userIdInt : undefined,
            state: data.state
          };
          action = this.platformUsersService.updateUser(
            this.selectedDomain,
            data.userId,
            uu
          );
        }
        entity = 'User';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Admin:
        if (dialogType === DialogType.Create) {
          const adc: AdminUserCreate = {
            userId: data.userId
          };
          action = this.platformAdminsService.createAdminUser(
            this.selectedDomain,
            adc
          );
        } else {
          const adu: AdminUserUpdate = {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            state: data.state
          };
          action = this.platformAdminsService.updateAdminUser(
            this.selectedDomain,
            data.userId,
            adu
          );
        }
        entity = 'Admin';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Client:
        if (dialogType === DialogType.Create) {
          const cc: ClientUserCreate = {
            userId: data.userId
          };
          action = this.platformClientsService.createClientUser(
            this.selectedDomain,
            cc
          );
        } else {
          const cu: ClientUserUpdate = {
            state: data.state,
            email: data.email
          };
          action = this.platformClientsService.updateClientUser(
            this.selectedDomain,
            data.userId,
            cu
          );
        }
        entity = 'Client';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Group:
        if (dialogType === DialogType.Create) {
          const gc: GroupCreate = {
            name: data.name,
            description:
              data.description.length > 0 ? data.description : undefined
          };
          action = this.groupsService.createGroup(this.selectedDomain, gc);
        } else {
          const gu: GroupUpdate = {
            description:
              data.description.length > 0 ? data.description : undefined
          };
          action = this.groupsService.updateGroup(
            this.selectedDomain,
            data.name,
            gu
          );
        }
        entity = 'Group';
        whatToReload = BIT_LOAD_GROUPS;
        break;
      case EntityType.Role:
        if (dialogType === DialogType.Create) {
          const rc: RoleCreate = {
            name: data.name,
            description:
              data.description.length > 0 ? data.description : undefined
          };
          action = this.rolesService.createRole(rc);
        } else {
          const ru: RoleUpdate = {
            description:
              data.description.length > 0 ? data.description : undefined
          };
          action = this.rolesService.updateRole(data.name, ru);
        }
        entity = 'Role';
        whatToReload = BIT_LOAD_ROLES;
        break;
      case EntityType.Action:
        if (dialogType === DialogType.Create) {
          const ac: ActionCreate = {
            name: data.name,
            description:
              data.description.length > 0 ? data.description : undefined
          };
          action = this.actionsService.createAction(ac);
        } else {
          const au: ActionUpdate = {
            description:
              data.description.length > 0 ? data.description : undefined
          };
          action = this.actionsService.updateAction(data.name, au);
        }
        entity = 'Action';
        whatToReload = BIT_LOAD_ACTIONS;
        break;
    }

    this._subHandler.add(action.subscribe((newEntity: any) => {

      this.logger.debug(LOG_TAG, dialogType + ' ', entity, ' completed', newEntity ? (': ' + newEntity) : '');

      this.loadGrids(whatToReload);

      this.notificationCenter.post({
        name: dialogType + entity + 'Entity',
        title: dialogType + ' ' + entity + ' Entity',
        message: dialogType + ' ' + entity + ' successful.',
        type: NotificationType.Success
      });

    }, (error) => {

      this.logger.error(LOG_TAG, dialogType + entity + ' error: ', error);

      this.notificationCenter.post({
        name: dialogType + entity + 'Error',
        title: dialogType + ' ' + entity,
        message: 'Error during ' + dialogType + ' of entity:',
        type: NotificationType.Error,
        error: error,
        closable: true
      });

    }));
  }
}
