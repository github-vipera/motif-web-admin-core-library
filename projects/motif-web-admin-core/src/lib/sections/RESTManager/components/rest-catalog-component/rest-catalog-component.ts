import { Component, OnInit, Output, ChangeDetectorRef, Renderer2, OnDestroy, EventEmitter } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { RESTTreeTableModel , RESTEntryStatus } from './model/rest-tree-table-model';
import { RESTContextCatalogService } from '../../../../services/RESTContextCatalogService';
import { TreeNode } from 'primeng/api';
import { RESTCatalogNode } from '../rest-catalog-commons'
import { WCGridEditorCommandsConfig, WCConfirmationTitleProvider, WCGridEditorCommandComponentEvent } from 'web-console-ui-kit';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { WCSubscriptionHandler } from '../../../../components/Commons/wc-subscription-handler';
import { Observable } from 'rxjs';

const LOG_TAG = '[RESTCatalogComponent]'; 

export enum GridCommandType {
    Delete = "Delete",
    Edit = "Edit",
    PublishToggle = "PublishToggle"
} 

export interface RESTCatalogDataEvent {
    component: RESTCatalogComponent;
}

export interface RESTCatalogDataErrorEvent {
    component: RESTCatalogComponent;
    error: any;
}

export interface RESTCatalogNodeSelectionEvent {
    node: RESTCatalogNode
}

export interface RESTCatalogNodeCommandEvent {
    node: RESTCatalogNode,
    command: GridCommandType
}

@Component({
    selector: 'wa-rest-catalog-component',
    styleUrls: ['./rest-catalog-component.scss'],
    templateUrl: './rest-catalog-component.html'
})
export class RESTCatalogComponent implements OnInit, OnDestroy {

    columns = [
        { field: 'URL', header: 'URL', width: '30%' },
        { field: 'name', header: 'Name', width: '30%' },
        { field: 'domain', header: 'Domain', width: '10%' },
        { field: 'application', header: 'Application', width: '10%' },
        { field: 'status', header: 'Status', width: '80px' },
        { field: 'cmd', header: '', width: '80px' }
    ];

    private _loading:boolean = false;
    private _tableModel: RESTTreeTableModel;
    private _subHandler: WCSubscriptionHandler= new WCSubscriptionHandler();

    @Output() nodeSelection: EventEmitter<RESTCatalogNodeSelectionEvent> = new EventEmitter();
    @Output() nodeCommand: EventEmitter<RESTCatalogNodeCommandEvent> = new EventEmitter();
    @Output() dataReload: EventEmitter<RESTCatalogDataEvent> = new EventEmitter();
    @Output() dataReloadError: EventEmitter<RESTCatalogDataErrorEvent> = new EventEmitter();


    statusConfirmationTitleProvider: WCConfirmationTitleProvider = {
        getTitle(rowData): string {
            if (rowData.enabled){
                return "Disable ?";
            } else {
                return "Enable ?";
            } 
        }
    }


    _selectedNode: TreeNode;

    commands: WCGridEditorCommandsConfig = [
        { 
            commandIcon: 'wa-ico-no',
            commandId: GridCommandType.Delete,
            title: 'Delete',
            hasConfirmation: true,
            confirmationTitle: 'Delete ?' 
        },
        { 
            commandIcon: 'wa-ico-edit',
            commandId: GridCommandType.Edit,
            title: 'Edit'
        },
    ];



    constructor(private logger: NGXLogger,
        private renderer2: Renderer2,
        private notificationCenter: WCNotificationCenter,
        private changeDetector: ChangeDetectorRef,
        private restCatalogService: RESTContextCatalogService
        ) {
        this.logger.debug(LOG_TAG, 'Opening...');

    }

        /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
        this._tableModel = new RESTTreeTableModel();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this._tableModel.close();
        this._subHandler.unsubscribe();
        this._subHandler = null;
   }

    public reloadData(domain:string, application:string){
        this.logger.debug(LOG_TAG, 'reloadData called');
        if (!domain || !application){
            this._tableModel.loadData([]);
            this.dataReload.emit({ component: this });
            return;
        }
        this._loading = true;
        this._subHandler.add(this.restCatalogService.getRESTContextCatalogFor(domain, application).subscribe((catalog) => {
            this._tableModel.loadData(catalog);
            this._loading = false;
            this.logger.debug(LOG_TAG, 'reloadData results:', catalog);
            this.dataReload.emit({ component: this });
        }, (error) => {
            this._loading = false;
            this.dataReloadError.emit( {component: this, error: error} );
        }));
    }

    public clear() {
        this.logger.debug(LOG_TAG, 'Clear invoked');
        this._tableModel.close();
    }

    public get loading() : boolean {
        return this._loading; 
    }
    
    public get tableModel(): RESTTreeTableModel {
        return this._tableModel;
    }

    public setFilter(value:string){
        this.logger.debug(LOG_TAG, 'onFilterChange called for ',value);
        this._tableModel.setFilter(value);
    }

    set selectedNode(node: TreeNode) {
        this._selectedNode = node;
        this.nodeSelect(node);
    }

    nodeUnselect(event: any) {
        this.logger.debug(LOG_TAG, 'Node unselected: ', event.node.data);
        this._selectedNode = null;
    }

    nodeSelect(node: TreeNode) {
        this.logger.debug(LOG_TAG, 'Node selected: ', node);

        let selectionEvent:RESTCatalogNodeSelectionEvent = null;
        selectionEvent =  { node: {
            url: node.data.url,
            name: node.data.name,
            domain: node.data.domain,
            application: node.data.application,
            data: node.data
        } };
        

        this.nodeSelection.emit(selectionEvent);
    }
    
    onGridCommandConfirm(event:any){
        this.logger.debug(LOG_TAG, 'onGridCommandConfirm : ', event);
        this.nodeCommand.emit({
            node: event.rowData.dataItem,
            command: event.id
        })
    }

    onGridCommandClick(event:any){
        this.logger.debug(LOG_TAG, 'onGridCommandClick : ', event);
        this.nodeCommand.emit({
            node: event.rowData.dataItem,
            command: event.id
        })
    }

    doToggleContextStatus(data){
        this.logger.debug(LOG_TAG, 'doToggleContextStatus : ', data);
        this.nodeCommand.emit({
            node: data,
            command: GridCommandType.PublishToggle
        })
    }

}
