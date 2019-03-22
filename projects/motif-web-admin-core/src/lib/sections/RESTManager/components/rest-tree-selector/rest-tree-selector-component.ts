import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { RESTTreeTableModel } from './model/rest-tree-table-model';
import { RESTTreeDataProviderMock } from './rest-tree-data-provider-mock';


const LOG_TAG = '[RESTTreeSelectorComponent]';

@Component({
    selector: 'wa-rest-tree-selector-component',
    styleUrls: ['./rest-tree-selector-component.scss'],
    templateUrl: './rest-tree-selector-component.html'
})
export class RESTTreeSelectorComponent implements OnInit, OnDestroy {

    private _loading:boolean = false;
    private _tableModel: RESTTreeTableModel;

    constructor(private logger: NGXLogger,
        private renderer2: Renderer2,
        private changeDetector: ChangeDetectorRef
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
        let modDataProvider = new RESTTreeDataProviderMock();
        this._tableModel.loadData(modDataProvider.getData());
        this._loading = false;
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
}
