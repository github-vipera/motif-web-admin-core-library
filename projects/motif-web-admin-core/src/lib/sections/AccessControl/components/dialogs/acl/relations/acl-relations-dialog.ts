import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { EntityType } from '../../../editors/acl-editor-context';
import { process, State } from '@progress/kendo-data-query';
import { SelectableSettings, SelectionEvent, RowArgs, PageChangeEvent, GridDataResult,
    DataStateChangeEvent, RowClassArgs} from '@progress/kendo-angular-grid';
import { UsersService, GroupsService, RolesService, ActionsService, PermissionsService, Group, Permission,
  Action, Role, GroupCreate, RoleCreate, ActionCreate, GroupUpdate, RoleUpdate,
  ActionUpdate } from '@wa-motif-open-api/auth-access-control-service';
import {
  UsersService as PlatformUsersService, ClientsService as PlatformClientsService, AdminsService as PlatformAdminsService,
  User, AdminUser, ClientUser, Domain, UserCreate, AdminUserCreate, ClientUserCreate, UserUpdate,
  AdminUserUpdate, ClientUserUpdate } from '@wa-motif-open-api/platform-service';
import { forkJoin, throwError, Observable } from 'rxjs';

const LOG_TAG = '[AclRelationsDialogComponent]';

@Component({
    selector: 'wa-platform-section-acl-relations-dialog',
    styleUrls: ['./acl-relations-dialog.scss'],
    templateUrl: './acl-relations-dialog.html'
})
export class AclRelationsDialogComponent implements OnInit {

    _currentEntityType: EntityType;
    dialogTitle = '';
    display: boolean;
    entityName = '';

    public currentSelection: string[] = [];
    public availableSelection: string[] = [];
    public currentGridView: GridDataResult;
    public currentDataState: State = {
      skip: 0,
      take: 10,
      sort: [],
      filter: {
        logic: 'and',
        filters: []
      }
    };
    public availableGridView: GridDataResult;
    public availableDataState: State = {
      skip: 0,
      take: 10,
      sort: [],
      filter: {
        logic: 'and',
        filters: []
      }
    };

    public selectableSettings: SelectableSettings = {
      checkboxOnly: false,
      mode: 'single'
    };

    constructor(private logger: NGXLogger,
        private usersService: UsersService,
        private groupsService: GroupsService,
        private rolesService: RolesService,
        private actionsService: ActionsService,
        private permissionsService: PermissionsService
    ) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(entityType: EntityType, dataItem?: any, selectedDomain?: string): void {
        this.prepare(entityType, dataItem);
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    public get currentEntityType(): EntityType {
        return this._currentEntityType;
    }

    private prepare(entityType: EntityType, dataItem: any) {
        this.logger.debug(LOG_TAG, 'prepare for:', entityType);
        this._currentEntityType = entityType;
        switch (this._currentEntityType) {
            case EntityType.Admin:
                this.dialogTitle = 'Admin Groups';
                this.entityName = dataItem.userId;
                break;
            case EntityType.Client:
                this.dialogTitle = 'Client Groups';
                this.entityName = dataItem.userId;
                break;
            case EntityType.Group:
                this.dialogTitle = 'Group Roles';
                this.entityName = dataItem.name;
                break;
            case EntityType.Role:
                this.dialogTitle = 'Role Actions';
                this.entityName = dataItem.name;
                break;
            case EntityType.Action:
                this.dialogTitle = 'Action Permissions';
                this.entityName = dataItem.name;
                break;
        }
        this.loadGrids(dataItem);
    }

    private loadGrids(dataItem: any): void {
        let getCurrent: Observable<any>;
        let getAvailable: Observable<any>;

        switch (this._currentEntityType) {
            case EntityType.User:
            case EntityType.Admin:
            case EntityType.Client:
                getCurrent = this.usersService.getUserGroups(dataItem.domain, dataItem.userId);
                getAvailable = this.groupsService.getDomainGroups(dataItem.domain);
                break;
            case EntityType.Group:
                getCurrent = this.groupsService.getGroupRoles(dataItem.domain, dataItem.name);
                getAvailable = this.rolesService.getRoles();
                break;
            case EntityType.Role:
                getCurrent = this.rolesService.getRoleActions(dataItem.name);
                getAvailable = this.actionsService.getActions();
                break;
            case EntityType.Action:
                getCurrent = this.actionsService.getActionPermissions(dataItem.name);
                getAvailable = this.permissionsService.getPermissions();
                break;
        }

        forkJoin(getCurrent, getAvailable).subscribe(response => {
            this.currentGridView = process(response[0], this.currentDataState);
            this.availableGridView = process(response[1], this.availableDataState);
        }, error => {
            this.logger.warn(LOG_TAG, 'Error loading data: ', error);
        });
    }

    onConfirm(): void {
        this.display = false;
    }
}
