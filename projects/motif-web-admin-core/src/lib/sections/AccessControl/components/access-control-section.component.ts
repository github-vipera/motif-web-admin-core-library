import { process, State } from '@progress/kendo-data-query';
import { Component, OnInit, ViewChild, Renderer2, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { SelectableSettings, SelectionEvent, RowArgs, PageChangeEvent, GridDataResult,
  DataStateChangeEvent,
  RowClassArgs} from '@progress/kendo-angular-grid';
import { UsersService, GroupsService, RolesService, PermissionsService, Group, Permission,
  Role, GroupCreate, RoleCreate, GroupUpdate, RoleUpdate } from '@wa-motif-open-api/auth-access-control-service';
import { Domain } from '@wa-motif-open-api/platform-service';
import { UsersService as PlatformUsersService, AdminsService as PlatformAdminsService,
  ClientsService as PlatformClientsService, User, AdminUser, ClientUser, UserCreate, AdminUserCreate, ClientUserCreate, UserUpdate,
  AdminUserUpdate, ClientUserUpdate, CredentialsCreate } from '@wa-motif-open-api/user-mgr-service';
import * as _ from 'lodash';
import { WCNotificationCenter, NotificationType, WCGridEditorCommandsConfig, WCConfirmationTitleProvider } from 'web-console-ui-kit';
import { NewUserDialogComponent, UserDialogResult } from './dialogs/user/new-user-dialog';
import { NewAclEntityDialogComponent, DialogResult as AclDialogResult} from './dialogs/acl/entities/new-acl-entity-dialog';
import { DialogType, EntityType } from './editors/acl-editor-context';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';
import { Observable, Subscription, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersListComponent } from './users-list/users-list.component';
import { AclRelationsDialogComponent } from './dialogs/acl/relations/acl-relations-dialog';
import { RowCommandType } from './editors/acl-editor-context';
import { PasswordChangeDialogResult, PasswordChangeDialogComponent } from './dialogs/password/password-change-dialog';

const LOG_TAG = '[AccessControlSection]';
const BIT_LOAD_USERS = 1;
const BIT_LOAD_GROUPS = 8;
const BIT_LOAD_ROLES = 16;
const BIT_LOAD_PERMISSIONS = 32;
const BIT_LOAD_ALL = BIT_LOAD_USERS | BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_PERMISSIONS;

@Component({
  selector: 'wa-access-control-section',
  styleUrls: ['./access-control-section.component.scss'],
  templateUrl: './access-control-section.component.html'
})
@PluginView('AccessControl', {
  iconName: 'wa-ico-users'
})
export class AccessControlSectionComponent implements OnInit, AfterViewInit, OnDestroy  {

  public adminsLoading = false;
  public clientsLoading = false;
  public groupsLoading = false;
  public rolesLoading = false;
  public permissionsLoading = false;

  public size = '450px';
  public height = '330';

  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);

  @ViewChild('newAclEntityDialog') _newAclEntityDialog: NewAclEntityDialogComponent;
  @ViewChild('newUserDialog') _newUserDialog: NewUserDialogComponent;
  @ViewChild('aclRelationsDialog') _aclRelationsDialog: AclRelationsDialogComponent;
  @ViewChild('passwordChangeDialog') _passwordChangeDialog: PasswordChangeDialogComponent;
  @ViewChild('usersListGrid') _usersListGrid: UsersListComponent;

  userCommands: WCGridEditorCommandsConfig = [
    {
      cssClass: 'k-icon',
      commandIcon: 'wa-ico-house-key',
      commandId: RowCommandType.ChangePassword,
      title: 'Change Password'
    },
    {
      cssClass: 'k-icon',
      commandIcon: 'wa-ico-relations-links',
      commandId: RowCommandType.Relations,
      title: 'Relations'
    },
    {
      cssClass: 'k-icon',
      commandIcon: 'wa-ico-edit',
      commandId: RowCommandType.Edit,
      title: 'Edit'
    },
    {
      cssClass: 'k-icon',
      commandIcon: 'wa-ico-no',
      commandId: RowCommandType.Delete,
      title: 'Delete',
      hasConfirmation: true,
      confirmationTitle: 'Delete?'
    }
  ];

  commands: WCGridEditorCommandsConfig = [
    {
      cssClass: 'k-icon',
      commandIcon: 'wa-ico-relations-links',
      commandId: RowCommandType.Relations,
      title: 'Relations'
    },
    {
      cssClass: 'k-icon',
      commandIcon: 'wa-ico-edit',
      commandId: RowCommandType.Edit,
      title: 'Edit'
    },
    {
      cssClass: 'k-icon',
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
  }];

  public selectedDomain: string;
  public selectedEntity: string;
  public usersTabSelected = true;
  public adminsTabSelected: boolean;
  public clientsTabSelected: boolean;

  public userSelection: string[] = [];
  public adminSelection: string[] = [];
  public clientSelection: string[] = [];
  public groupSelection: string[] = [];
  public roleSelection: string[] = [];

  public rolesGridView: GridDataResult;
  public rolesDataState: State = {
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
  public permissionsData: Permission[];
  public selectableSettings: SelectableSettings = {
    checkboxOnly: false,
    mode: 'single'
  };

  constructor(private logger: NGXLogger,
    private platformUsersService: PlatformUsersService,
    private platformAdminsService: PlatformAdminsService,
    private platformClientsService: PlatformClientsService,
    private usersService: UsersService,
    private groupsService: GroupsService,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private notificationCenter: WCNotificationCenter,
    private renderer: Renderer2,
    private zone: NgZone
  ) {

    this.logger.debug(LOG_TAG, 'Opening...');
  }

  ngOnInit() {
    this.logger.debug(LOG_TAG, 'Initializing...');

    this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_PERMISSIONS);

  }

  ngOnDestroy() {
    this.logger.debug(LOG_TAG , 'ngOnDestroy');
    this.destroy.next(null);
  }

  public ngAfterViewInit(): void {
  }

  public onRolesDataStateChange(state: DataStateChangeEvent): void {
    this.rolesDataState = state;
    this.loadRoles();
  }

  private loadRoles(): void {
    this.rolesGridView = process(this.rolesData, this.rolesDataState);
  }

  public permissionsPageChange(event: PageChangeEvent): void {
    this.permissionsDataState.skip = event.skip;
    this.loadPermissions();
  }

  public onPermissionsDataStateChange(state: DataStateChangeEvent): void {
    this.permissionsDataState = state;
    this.loadPermissions();
  }

  private loadPermissions(): void {
    this.permissionsGridView = process(this.permissionsData, this.permissionsDataState);
  }

  public onUserSelectionChange(e: SelectionEvent) {
    if (this.userSelection.length === 1 || this.adminSelection.length === 1 || this.clientSelection.length === 1) {
      this.groupSelection.length = this.roleSelection.length = 0;
      this.loadGrids(BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_PERMISSIONS);
    }
  }

  public onGroupSelectionChange(e: SelectionEvent) {
    if (this.groupSelection.length === 1) {
      this.roleSelection.length = 0;
      this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_PERMISSIONS);
    }
  }

  public onRoleSelectionChange(e: SelectionEvent) {
    if (this.roleSelection.length === 1) {
      this.loadGrids(BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_PERMISSIONS);
    }
  }

  onDomainSelected(domain: Domain) {
    this.selectedDomain = domain ? domain.name : null;
    this.clearAllGridSelections();
    this.loadGrids(BIT_LOAD_USERS | BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_PERMISSIONS);
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
      this.roleSelection.length = 0;
  }

  clearAllGridData() {
    this.usersData = this.adminsData = this.clientsData = this.groupsData = this.rolesData = this.permissionsData = null;
  }

  loadGrids(gridsToLoadBitfield: number) {
    let getGroups, getRoles, getPermissions;
    let selectedUser: string = this.userSelection.length === 1 ? this.userSelection[0] : null;
    if (!selectedUser) {
      selectedUser = this.adminSelection.length === 1 ? this.adminSelection[0] : null;
    }
    if (!selectedUser) {
      selectedUser = this.clientSelection.length === 1 ? this.clientSelection[0] : null;
    }

    const selectedGroup: string = this.groupSelection.length === 1 ? this.groupSelection[0] : null;
    const selectedRole: string = this.roleSelection.length === 1 ? this.roleSelection[0] : null;

    if (!this.selectedDomain) {
      this.userSelection.length = this.adminSelection.length = this.clientSelection.length = this.groupSelection.length = 0;
      this.usersData = this.adminsData = this.clientsData = this.groupsData = null;
    } else {
      // Load users if required
      if (BIT_LOAD_USERS & gridsToLoadBitfield) {
        this._usersListGrid.refreshData();
        this.adminsLoading = true;
        this.platformAdminsService.getAdminUsersList(this.selectedDomain).pipe(takeUntil(this.destroy)).subscribe(response => {
          this.adminsData = response;
          _.forEach(this.adminsData, function(element) {
            element.created = new Date(element.created);
            element.lastLogin = new Date(element.lastLogin);
          });
          this.adminsLoading = false;
        }, error => {
          this.logger.warn(LOG_TAG, 'Error loading admins: ', error);
          this.adminsLoading = false;
        });
        this.clientsLoading = true;
        this.platformClientsService.getClientUsersList(this.selectedDomain).pipe(takeUntil(this.destroy)).subscribe(response => {
          this.clientsData = response;
          _.forEach(this.clientsData, function(element) {
            element.created = new Date(element.created);
            element.lastLogin = new Date(element.lastLogin);
          });
          this.clientsLoading = false;
        }, error => {
          this.logger.warn(LOG_TAG, 'Error loading clients: ', error);
          this.clientsLoading = false;
        });
      }

      // Groups
      if (selectedUser) {
        getGroups = this.usersService.getUserGroups(this.selectedDomain, selectedUser);
      } else {
        getGroups = this.groupsService.getDomainGroups(this.selectedDomain);
      }

      if (BIT_LOAD_GROUPS & gridsToLoadBitfield) {
        this.groupsLoading = true;
        getGroups.pipe(takeUntil(this.destroy)).subscribe(response => {
          this.groupsData = response;
          this.groupsLoading = false;
        }, error => {
          this.logger.warn(LOG_TAG, 'Error loading groups: ', error);
          this.groupsLoading = false;
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

    // Permissions
    if (selectedRole) {
      getPermissions = this.rolesService.getRolePermissions(selectedRole);
    } else if (selectedGroup) {
      getPermissions = this.groupsService.getGroupPermissions(this.selectedDomain, selectedGroup);
    } else if (selectedUser) {
      getPermissions = this.usersService.getUserPermissions(this.selectedDomain, selectedUser);
    } else {
      getPermissions = this.permissionsService.getPermissions();
    }

    if (BIT_LOAD_ROLES & gridsToLoadBitfield) {
      this.rolesLoading = true;
      getRoles.pipe(takeUntil(this.destroy)).subscribe(response => {
        this.rolesData = response;
        this.loadRoles();
        this.rolesLoading = false;
      }, error => {
        this.logger.warn(LOG_TAG, 'Error loading roles: ', error);
        this.rolesLoading = false;
      });
    }

    if (BIT_LOAD_PERMISSIONS & gridsToLoadBitfield) {
      this.permissionsLoading = true;
      getPermissions.pipe(takeUntil(this.destroy)).subscribe(response => {
        this.permissionsData = response;
        this.loadPermissions();
        this.permissionsLoading = false;
      }, error => {
        this.logger.warn(LOG_TAG, 'Error loading permissions: ', error);
        this.permissionsLoading = false;
      });
    }
  }

  onResetClicked(): void {
    this.clearAllGridSelections();
    this.loadGrids(BIT_LOAD_ALL);
  }

  onLayoutChange(): void {
    console.log('layout changed: ' + this.size);
    const intHeight: number = (parseInt(this.size.replace(/px/, '')) - 120);
    this.height = '' + intHeight;
    this.permissionsDataState.take = Math.ceil(intHeight / 35) * 3;
    this.loadPermissions();
  }

  onDialogClose(touched: Boolean): void {
    if (touched) {
      this.loadGrids(BIT_LOAD_ALL);
    }
  }

  onAdminCommandClick(event): void {
    if (event.id === RowCommandType.ChangePassword) {
      this._passwordChangeDialog.show(EntityType.Admin, event.rowData.dataItem);
    } else if (event.id === RowCommandType.Edit) {
      this._newUserDialog.show(DialogType.Edit, EntityType.Admin, event.rowData.dataItem);
    } else {
      this.selectedEntity = this.adminSelection[0];
      this._aclRelationsDialog.show(EntityType.Admin, event.rowData.dataItem);
    }
  }

  onClientCommandClick(event): void {
    if (event.id === RowCommandType.ChangePassword) {
      this._passwordChangeDialog.show(EntityType.Client, event.rowData.dataItem);
    } else if (event.id === RowCommandType.Edit) {
      this._newUserDialog.show(DialogType.Edit, EntityType.Client, event.rowData.dataItem);
    } else {
      this.selectedEntity = this.clientSelection[0];
      this._aclRelationsDialog.show(EntityType.Client, event.rowData.dataItem);
    }
  }

  onGroupCommandClick(event): void {
    if (event.id === RowCommandType.Edit) {
      this._newAclEntityDialog.show(DialogType.Edit, EntityType.Group, event.rowData.dataItem);
    } else {
      this.selectedEntity = this.groupSelection[0];
      this._aclRelationsDialog.show(EntityType.Group, event.rowData.dataItem);
    }
  }

  onRoleCommandClick(event): void {
    if (event.id === RowCommandType.Edit) {
      this._newAclEntityDialog.show(DialogType.Edit, EntityType.Role, event.rowData.dataItem);
    } else {
      this.selectedEntity = this.roleSelection[0];
      this._aclRelationsDialog.show(EntityType.Role, event.rowData.dataItem);
    }
  }

  onAdminCommandConfirm(dataItem): void {
    this.deleteEntity(EntityType.Admin, dataItem);
  }

  onClientCommandConfirm(dataItem): void {
    this.deleteEntity(EntityType.Client, dataItem);
  }

  onGroupCommandConfirm(dataItem): void {
    this.deleteEntity(EntityType.Group, dataItem);
  }

  onRoleCommandConfirm(dataItem): void {
    this.deleteEntity(EntityType.Role, dataItem);
  }

  onPermissionCommandConfirm(dataItem): void {
    this.deleteEntity(EntityType.Permission, dataItem);
  }

  onUserRowCommandClick(event: any): void {
    if (event.commandType === RowCommandType.ChangePassword) {
      this._passwordChangeDialog.show(EntityType.User, event.dataItem);
    } else if (event.commandType === RowCommandType.Relations) {
      this._aclRelationsDialog.show(EntityType.User, event.dataItem);
    } if (event.commandType === RowCommandType.Edit) {
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
    }
  }

  onNewAclEntityConfirm(event: AclDialogResult): void {
    this.createOrUpdateEntity(event.dialogType, event.entityType, { name: event.name, description: event.description });
  }

  onNewUserConfirm(event: UserDialogResult): void {
    this.createOrUpdateEntity(event.dialogType, event.entityType, { userId: event.userId, userIdInt: event.userIdInt, state: event.state });
  }

  onPasswordChangeConfirm(event: PasswordChangeDialogResult): void {
    this.changePassword(event.entityType, event.userId, event.newPassword, event.verifyPassword);
  }

  onTabChange(): void {
    this.onResetClicked();
  }

  private deleteEntity(entityType: EntityType, data: any): void {
    let deleteEntity: Observable<any>;
    let whatToReload: number;

    let entity: string;

    switch (entityType) {
      case EntityType.User:
        deleteEntity = this.platformUsersService.deleteUser(this.selectedDomain, data.rowData.dataItem.userId);
        entity = 'User';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Admin:
        deleteEntity = this.platformAdminsService.deleteAdminUser(this.selectedDomain, data.rowData.dataItem.userId);
        entity = 'Admin';
        whatToReload = BIT_LOAD_USERS;
        break;
      case EntityType.Client:
        deleteEntity = this.platformClientsService.deleteClientUser(this.selectedDomain, data.rowData.dataItem.userId);
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
      case EntityType.Permission:
        deleteEntity = this.permissionsService.deletePermission(data.rowData.dataItem.component, data.rowData.dataItem.action,
          data.rowData.dataItem.target);
        entity = 'Permission';
        whatToReload = BIT_LOAD_PERMISSIONS;
        break;
    }

    deleteEntity.pipe(takeUntil(this.destroy)).subscribe(any => {

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

    });
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
    }

    action.pipe(takeUntil(this.destroy)).subscribe((newEntity: any) => {

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

    });
  }

  private changePassword(entityType: EntityType, userId: string, newPassword: string, verifyPassword: string): void {
    const cc: CredentialsCreate = {
      password: newPassword,
      passwordVerify: verifyPassword
    };
    switch (entityType) {
      case EntityType.User:
        this.platformUsersService.createUserCredentials(this.selectedDomain, userId, cc)
            .pipe(takeUntil(this.destroy)).subscribe(
              result => this.passwordChangeSuccessHandler(result),
              error => this.passwordChangeErrorHandler(error));
        break;
      case EntityType.Admin:
        this.platformAdminsService.createAdminUserCredentials(this.selectedDomain, userId, cc)
            .pipe(takeUntil(this.destroy)).subscribe(
              result => this.passwordChangeSuccessHandler(result),
              error => this.passwordChangeErrorHandler(error));
        break;
      case EntityType.Client:
        this.platformClientsService.createClientUserCredentials(this.selectedDomain, userId, cc)
            .pipe(takeUntil(this.destroy)).subscribe(
              result => this.passwordChangeSuccessHandler(result),
              error => this.passwordChangeErrorHandler(error));
        break;
    }
  }

  private passwordChangeSuccessHandler(error: any): void {
    this.notificationCenter.post({
      name: 'PasswordChanged',
      title: 'Password Changed',
      message: 'Password changed successfully.',
      type: NotificationType.Success
    });
  }

  private passwordChangeErrorHandler(error: any): void {
    this.logger.error(LOG_TAG, 'Error changing password: ', error);
    this.notificationCenter.post({
      name: 'PasswordChangeError',
      title: 'Password Change Error',
      message: 'Error setting new password:',
      type: NotificationType.Error,
      error: error,
      closable: true
    });
  }
}
