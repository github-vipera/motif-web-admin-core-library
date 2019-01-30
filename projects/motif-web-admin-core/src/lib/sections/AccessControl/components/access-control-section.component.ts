import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PluginView } from 'web-console-core'
import { NGXLogger } from 'web-console-core'
import { SelectableSettings, SelectionEvent, RowArgs, PageChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { UsersService, GroupsService, RolesService, ActionsService, PermissionsService, Group, Permission, Action, Role } from '@wa-motif-open-api/auth-access-control-service'
import {
  UsersService as PlatformUsersService, ClientsService as PlatformClientsService, AdminsService as PlatformAdminsService,
  User, AdminUser, ClientUser, Domain, ClientsService, UsersList
} from '@wa-motif-open-api/platform-service'
import * as _ from 'lodash';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit'
import { GridsterPreviewComponent } from 'angular-gridster2/lib/gridsterPreview.component';

const LOG_TAG = "[AccessControlSection]";
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
@PluginView("AccessControl", {
  iconName: "ico-users"
})

export class AccessControlSectionComponent implements OnInit {

  public selectedDomain: string;
  public usersTabSelected: boolean = true;
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
  public actionsPageSize: number = 50;
  public actionsSkip: number = 0;

  public permissionsGridView: GridDataResult;
  public permissionsPageSize: number = 50;
  public permissionsSkip: number = 0;

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

    this.logger.debug(LOG_TAG, "Opening...");
  }

  ngOnInit() {
    this.logger.debug(LOG_TAG, "Initializing...");

    this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);

  }

  public actionsPageChange(event: PageChangeEvent): void {
    this.actionsSkip = event.skip;
    this.loadActions();
  }

  private loadActions(): void {
    this.actionsGridView = {
      data: this.actionsData.slice(this.actionsSkip, this.actionsSkip + this.actionsPageSize),
      total: this.actionsData.length
    };
  }

  public permissionsPageChange(event: PageChangeEvent): void {
    this.permissionsSkip = event.skip;
    this.loadPermissions();
  }

  private loadPermissions(): void {
    this.permissionsGridView = {
      data: this.permissionsData.slice(this.permissionsSkip, this.permissionsSkip + this.permissionsPageSize),
      total: this.permissionsData.length
    };
  }

  public onUserSelectionChange(e: SelectionEvent) {
    if (this.userSelection.length == 1) {
      this.groupSelection = this.roleSelection = this.actionSelection = this.permissionSelection = [];
      this.loadGrids(BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_GROUPS | BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    }
  }

  public onGroupSelectionChange(e: SelectionEvent) {
    if (this.groupSelection.length == 1) {
      this.roleSelection = this.actionSelection = this.permissionSelection = [];
      this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_ROLES | BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    }
  }

  public onRoleSelectionChange(e: SelectionEvent) {
    if (this.roleSelection.length == 1) {
      this.actionSelection = this.permissionSelection = [];
      this.loadGrids(BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    } else {
      this.clearAllGridSelections();
      this.loadGrids(BIT_LOAD_ACTIONS | BIT_LOAD_PERMISSIONS);
    }
  }

  public onActionSelectionChange(e: SelectionEvent) {
    if (this.actionSelection.length == 1) {
      this.permissionSelection = [];
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
  }

  clearAllGridSelections() {
    this.userSelection = this.adminSelection = this.clientSelection = this.groupSelection = this.roleSelection = this.actionSelection = this.permissionSelection = [];
  }

  clearAllGridData() {
    this.usersData = this.adminsData = this.clientsData = this.groupsData = this.rolesData = this.actionsData = this.permissionsData = null;
  }

  loadGrids(gridsToLoadBitfield) {
    let getGroups, getRoles, getActions, getPermissions;
    let selectedUser: string = this.userSelection.length == 1 ? this.userSelection[0] : null;
    let selectedGroup: string = this.groupSelection.length == 1 ? this.groupSelection[0] : null;
    let selectedRole: string = this.roleSelection.length == 1 ? this.roleSelection[0] : null;
    let selectedAction: string = this.actionSelection.length == 1 ? this.actionSelection[0] : null;

    if (!this.selectedDomain) {
      this.userSelection = this.adminSelection = this.clientSelection = this.groupSelection = [];
      this.usersData = this.adminsData = this.clientsData = this.groupsData = [];
    } else {
      // Load users if required
      if (BIT_LOAD_USERS & gridsToLoadBitfield) {
        this.platformUsersService.getUsersList(this.selectedDomain).subscribe(response => {
          this.usersData = response;
        }, error => {
          this.logger.warn(LOG_TAG, "Error loading users: ", error);
        });
        this.platformAdminsService.getAdminUsersList(this.selectedDomain).subscribe(response => {
          this.adminsData = response;
        }, error => {
          this.logger.warn(LOG_TAG, "Error loading admins: ", error);
        });
        this.platformClientsService.getClientUsersList(this.selectedDomain).subscribe(response => {
          this.clientsData = response;
        }, error => {
          this.logger.warn(LOG_TAG, "Error loading clients: ", error);
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
          this.logger.warn(LOG_TAG, "Error loading groups: ", error);
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
}
