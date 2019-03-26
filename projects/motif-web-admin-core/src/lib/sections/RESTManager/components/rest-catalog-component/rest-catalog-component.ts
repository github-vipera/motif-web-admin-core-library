import { Component, OnInit, Output, ChangeDetectorRef, Renderer2, OnDestroy, EventEmitter } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { RESTTreeTableModel , RESTEntryStatus } from './model/rest-tree-table-model';
import { RESTContextCatalogService } from '../../../../services/RESTContextCatalogService';
import { TreeNode } from 'primeng/api';
import { RESTCatalogNode } from '../rest-catalog-commons'

const LOG_TAG = '[RESTCatalogComponent]';


export interface RESTCatalogNodeSelectionEvent {
    node: RESTCatalogNode
}

@Component({
    selector: 'wa-rest-catalog-component',
    styleUrls: ['./rest-catalog-component.scss'],
    templateUrl: './rest-catalog-component.html'
})
export class RESTCatalogComponent implements OnInit, OnDestroy {

    private _loading:boolean = false;
    private _tableModel: RESTTreeTableModel;

    @Output() nodeSelection: EventEmitter<RESTCatalogNodeSelectionEvent> = new EventEmitter();
    _selectedNode: TreeNode;

    constructor(private logger: NGXLogger,
        private renderer2: Renderer2,
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
        this.reloadData();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this._tableModel.close();
    }

    public reloadData() {
        this.logger.debug(LOG_TAG, 'reloadData called');
        this._loading = true;
        this.restCatalogService.getRESTContextCatalog().subscribe((catalog) => {
            this._tableModel.loadData(catalog);
            this._loading = false;
            this.logger.debug(LOG_TAG, 'reloadData results:', catalog);
        }, (error) => {
            this._loading = false;
            
        });
        /*
        let modDataProvider = new RESTTreeDataProviderMock();
        this._tableModel.loadData(modDataProvider.getData());
        */
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
    

}
