import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { RESTTreeTableModel } from './model/rest-tree-table-model';
//import { RESTTreeDataProviderMock } from './rest-tree-data-provider-mock';
import { RESTContextCatalogService } from '../../../../services/RESTContextCatalogService';

const LOG_TAG = '[RESTCatalogComponent]';

@Component({
    selector: 'wa-rest-catalog-component',
    styleUrls: ['./rest-catalog-component.scss'],
    templateUrl: './rest-catalog-component.html'
})
export class RESTCatalogComponent implements OnInit, OnDestroy {

    private _loading:boolean = false;
    private _tableModel: RESTTreeTableModel;

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


}
