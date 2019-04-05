import { Component, OnInit, Renderer2, NgZone, ViewEncapsulation, Input, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { EntityType } from '../../../editors/acl-editor-context';
import { process, State } from '@progress/kendo-data-query';
import {
    SelectableSettings, SelectionEvent, RowArgs, PageChangeEvent, GridDataResult,
    DataStateChangeEvent, RowClassArgs
} from '@progress/kendo-angular-grid';
import {
    UsersService, GroupsService, RolesService, ActionsService,
    PermissionsService,
    GroupAssign,
    RoleAssign,
    ActionAssign,
    Permission
} from '@wa-motif-open-api/auth-access-control-service';
import { forkJoin, throwError, Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators/take';
import { tap } from 'rxjs/operators/tap';
import { fromEvent } from 'rxjs/observable/fromEvent';

const LOG_TAG = '[AclRelationsDialogComponent]';

export enum GridType {
    CURRENT,
    AVAILABLE
}

export interface DragDropGridConfig {
    selector: string;
    grid: any;
    provides: string;
    accepts: Array<string>;
}

export interface DragData {
    source: string;
    data: any;
}

const tableRow = node => node.tagName.toLowerCase() === 'tr';
const closest = (node, predicate) => {
    while (node && !predicate(node)) {
        node = node.parentNode;
    }

    return node;
};

@Component({
    selector: 'wa-platform-section-acl-relations-dialog',
    styleUrls: ['./acl-relations-dialog.scss'],
    templateUrl: './acl-relations-dialog.html'
})
export class AclRelationsDialogComponent implements OnInit, OnDestroy {

    _currentEntityType: EntityType;
    dialogTitle = '';
    display: boolean;
    entityName = '';
    height = '665';

    isAddSelectedDisabled: boolean;
    isAddAllDisabled: boolean;
    isRemoveSelectedDisabled: boolean;
    isRemoveAllDisabled: boolean;

    private dragDropConfigs: Array<DragDropGridConfig> = [
        {
            selector: '#currentGrid',
            grid: 'currentGridView',
            provides: 'current',
            accepts: ['available']
        },
        {
            selector: '#availableGrid',
            grid: 'availableGridView',
            provides: 'available',
            accepts: ['current']
        }
    ];
    private dragDropSubscriptions: Array<Subscription> = new Array(7);
    private currentDragData: DragData;

    private currentItem: any;
    public currentData: any[] = [];
    public availableData: any[] = [];
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
        mode: 'multiple'
    };

    constructor(private logger: NGXLogger,
        private usersService: UsersService,
        private groupsService: GroupsService,
        private rolesService: RolesService,
        private actionsService: ActionsService,
        private permissionsService: PermissionsService,
        private renderer: Renderer2,
        private zone: NgZone
    ) { }

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
        this.adjustGridsHeight();
    }

    public ngOnDestroy(): void {
        for (let idx = 0; idx < this.dragDropSubscriptions.length; idx++) {
            this.unsubscribeDragDrop(idx);
        }
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

    public get isCurrentEntityAction(): boolean {
        return this._currentEntityType === EntityType.Action;
    }

    public permissionKey(context: RowArgs): string {
        return context.dataItem.component + ':' + context.dataItem.action + ':' + context.dataItem.target;
    }

    private prepare(entityType: EntityType, dataItem: any) {
        this.logger.debug(LOG_TAG, 'prepare for:', entityType);
        this._currentEntityType = entityType;
        this.currentItem = dataItem;
        this.isAddAllDisabled = this.isAddSelectedDisabled = this.isRemoveAllDisabled = this.isRemoveSelectedDisabled = true;
        this.currentSelection = [];
        this.availableSelection = [];
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

    private subscribeDragDrop(gridType: GridType): void {
        this.unsubscribeDragDrop(gridType);
        this.zone.onStable.pipe(take(1)).subscribe(() =>
            this.dragDropSubscriptions[gridType] = this.handleDragAndDrop(this.dragDropConfigs[gridType]));
    }

    private unsubscribeDragDrop(gridType: GridType): void {
        if (this.dragDropSubscriptions[gridType]) {
            this.dragDropSubscriptions[gridType].unsubscribe();
        }
    }

    private handleDragAndDrop(dragDropConfig: DragDropGridConfig): Subscription {
        const sub = new Subscription(() => { });

        const container: Element = document.querySelector(dragDropConfig.selector);
        const tableRows = Array.from(container.querySelectorAll('.k-grid tr'));
        tableRows.forEach(item => {
            this.renderer.setAttribute(item, 'draggable', 'true');
            const dragStart = fromEvent<DragEvent>(item, 'dragstart');
            const dragOver = fromEvent(item, 'dragover');
            const drop = fromEvent(item, 'drop');
            const dragEnd = fromEvent(item, 'dragend');

            sub.add(dragStart.pipe(
                tap(({ dataTransfer }) => {
                    try {
                        const dragImgEl = document.createElement('span');
                        dragImgEl.setAttribute('style', 'position: absolute; display: block; top: 0; left: 0; width: 0; height: 0;');
                        document.body.appendChild(dragImgEl);
                        dataTransfer.setDragImage(dragImgEl, 0, 0);
                    } catch (err) {
                        // IE doesn't support setDragImage
                    }
                    try {
                        // Firefox won't drag without setting data
                        dataTransfer.setData('application/json', '');
                    } catch (err) {
                        // IE doesn't support MIME types in setData
                    }
                })
            ).subscribe(({ target }) => {
                const row: HTMLTableRowElement = <HTMLTableRowElement>target;
                const dataItem = this[dragDropConfig.grid].data[row.rowIndex];
                dataItem.dragging = true;
                this.currentDragData = {
                    source: dragDropConfig.provides,
                    data: dataItem
                };
                console.log('drag started for ' + this.currentDragData.source);
            }));

            sub.add(dragOver.subscribe((e: any) => {
                if (dragDropConfig.accepts.includes(this.currentDragData.source)) {
                    e.preventDefault();
                    //        const dataItem = gridData.data.splice(draggedItemIndex, 1)[0];
                    const dropIndex = closest(e.target, tableRow).rowIndex;
                    const dropItem = this[dragDropConfig.grid].data[dropIndex];

                    console.log(this.currentDragData.source + ' to ' + dragDropConfig.provides + ' is valid');
                } else {
                    console.log(this.currentDragData.source + ' to ' + dragDropConfig.provides + ' is NOT valid');
                }
            }));

            sub.add(drop.subscribe((e: any) => {
                if (dragDropConfig.accepts.includes(this.currentDragData.source)) {
                    e.preventDefault();
                    console.log('dropped item from ' + this.currentDragData.source + ' to ' + dragDropConfig.provides);
                } else {
                    console.log('cannot drop item from ' + this.currentDragData.source + ' to ' + dragDropConfig.provides);
                }
            }));

            sub.add(dragEnd.subscribe((e: any) => {
                e.preventDefault();
                this.currentDragData.data.dragging = false;
                console.log('drag ended for ' + this.currentDragData.source);
            }));
        });

        return sub;
    }

    private adjustGridsHeight(): void {
        this.currentDataState.take = this.availableDataState.take = Math.ceil(parseInt(this.height) / 35) + 1;
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
            this.currentData = response[0];
            this.availableData = response[1];
            this.filterAvailable();
            this.refreshCurrent();
            this.refreshAvailable();
        }, error => {
            this.logger.warn(LOG_TAG, 'Error loading data: ', error);
        });
    }

    private filterAvailable(): void {
        // Filter out current records
        const currentDataMap: any = {};
        this.currentData.forEach(r => {
            currentDataMap[this.isCurrentEntityAction ? (r.component + '|' + r.action + '|' + r.target) : r.name] = r;
        }, this);
        this.availableData = this.availableData.filter((value: any, index: number, array: any[]) => {
            const key: string = this.isCurrentEntityAction ? (value.component + '|' + value.action + '|' + value.target) : value.name;
            return currentDataMap[key] ? false : value;
        }, this);
    }

    private refreshCurrent(): void {
        this.currentGridView = process(this.currentData, this.currentDataState);

        this.subscribeDragDrop(GridType.CURRENT);
    }

    private refreshAvailable(): void {
        this.availableGridView = process(this.availableData, this.availableDataState);

        this.subscribeDragDrop(GridType.AVAILABLE);
    }

    onConfirm(): void {
        this.display = false;
    }

    onCurrentSelectionChange(e: SelectionEvent) {
        this.availableSelection = [];
        this.isAddAllDisabled = this.isAddSelectedDisabled = true;
        this.isRemoveAllDisabled = this.isRemoveSelectedDisabled = false;
    }

    onAvailableSelectionChange(e: SelectionEvent) {
        this.currentSelection = [];
        this.isAddAllDisabled = this.isAddSelectedDisabled = false;
        this.isRemoveAllDisabled = this.isRemoveSelectedDisabled = true;
    }

    onCurrentDataStateChange(state: DataStateChangeEvent): void {
        this.currentDataState = state;
        this.refreshCurrent();
    }

    onAvailableDataStateChange(state: DataStateChangeEvent): void {
        this.availableDataState = state;
        this.refreshAvailable();
    }

    onCurrentPageChange(event: PageChangeEvent): void {
        this.currentDataState.skip = event.skip;
        this.refreshCurrent();
    }

    onAvailablePageChange(event: PageChangeEvent): void {
        this.availableDataState.skip = event.skip;
        this.refreshAvailable();
    }

    onAddSelected(): void {
        this.addToCurrent(this.mapSelectionToItems(this.availableSelection));
    }

    onAddAll(): void {
        this.addToCurrent(this.availableData);
    }

    onRemoveSelected(): void {
        this.removeFromCurrent(this.mapSelectionToItems(this.currentSelection));
    }

    onRemoveAll(): void {
        this.removeFromCurrent(this.currentData);
    }

    private mapSelectionToItems(selection: any[]): any[] {
        return selection.map((value: any, index: number, array: any[]) => {
            if (!this.isCurrentEntityAction) {
                return {
                    name: value
                }
            } else {
                const splittedValue: string[] = value.split(':');
                return {
                    component: splittedValue[0],
                    action: splittedValue[1],
                    target: splittedValue[2]
                }
            }
        });
    }

    addToCurrent(itemsToAdd: any[]) {
        const addToCurrent: Observable<any>[] = [];
        switch (this._currentEntityType) {
            case EntityType.User:
            case EntityType.Admin:
            case EntityType.Client:
                itemsToAdd.forEach(i => {
                    const ga: GroupAssign = {
                        name: i.name
                    }
                    addToCurrent.push(this.usersService.assignGroupToUser(this.currentItem.domain, this.currentItem.userId, ga));
                });
                break;
            case EntityType.Group:
                itemsToAdd.forEach(i => {
                    const ra: RoleAssign = {
                        name: i.name
                    }
                    addToCurrent.push(this.groupsService.assignRoleToGroup(this.currentItem.domain, this.currentItem.name, ra));
                });
                break;
            case EntityType.Role:
                itemsToAdd.forEach(i => {
                    const aa: ActionAssign = {
                        name: i.name
                    }
                    addToCurrent.push(this.rolesService.assignActionToRole(this.currentItem.name, aa));
                });
                break;
            case EntityType.Action:
                itemsToAdd.forEach(i => {
                    const p: Permission = {
                        component: i.component,
                        action: i.action,
                        target: i.target
                    }
                    addToCurrent.push(this.actionsService.assignPermissionToAction(this.currentItem.name, p));
                });
                break;
        }

        forkJoin(addToCurrent).subscribe(response => {
            this.loadGrids(this.currentItem);
        }, error => {
            this.logger.warn(LOG_TAG, 'Error writing data: ', error);
        });
    }

    removeFromCurrent(itemsToRemove: any[]) {
        const removeFromCurrent: Observable<any>[] = [];
        switch (this._currentEntityType) {
            case EntityType.User:
            case EntityType.Admin:
            case EntityType.Client:
                itemsToRemove.forEach(i => {
                    removeFromCurrent.push(this.usersService.removeGroupFromUser(this.currentItem.domain, this.currentItem.userId, i.name));
                });
                break;
            case EntityType.Group:
                itemsToRemove.forEach(i => {
                    removeFromCurrent.push(this.groupsService.removeRoleFromGroup(this.currentItem.domain, this.currentItem.name, i.name));
                });
                break;
            case EntityType.Role:
                itemsToRemove.forEach(i => {
                    removeFromCurrent.push(this.rolesService.removeActionFromRole(this.currentItem.name, i.name));
                });
                break;
            case EntityType.Action:
                itemsToRemove.forEach(i => {
                    removeFromCurrent.push(this.actionsService.
                        removePermissionFromAction(this.currentItem.name, i.component, i.action, i.target));
                });
                break;
        }

        forkJoin(removeFromCurrent).subscribe(response => {
            this.loadGrids(this.currentItem);
        }, error => {
            this.logger.warn(LOG_TAG, 'Error writing data: ', error);
        });
    }
}
