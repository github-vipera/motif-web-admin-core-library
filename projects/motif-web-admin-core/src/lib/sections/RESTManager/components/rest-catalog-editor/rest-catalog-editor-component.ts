import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { ContextsService, ServiceContext } from '@wa-motif-open-api/rest-context-service';
import { RESTCatalogNode } from '../rest-catalog-commons'

const LOG_TAG = '[RESTTreeEditorComponent]';

@Component({
    selector: 'wa-rest-catalog-editor-component',
    styleUrls: ['./rest-catalog-editor-component.scss'],
    templateUrl: './rest-catalog-editor-component.html'
})
export class RESTCatalogEditorComponent implements OnInit, OnDestroy {

    private _currentNode : RESTCatalogNode;

    constructor(private logger: NGXLogger,
        private renderer2: Renderer2,
        private changeDetector: ChangeDetectorRef,
        private restContextService: ContextsService
        ) {
        this.logger.debug(LOG_TAG, 'Opening...');

    }

        /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
    }
    
    public startEdit(node: RESTCatalogNode){
        this._currentNode = node;
        this.reloadData();
    }

    public get currentEditingNode():RESTCatalogNode {
        return this._currentNode;
    }

    
    public reloadData():void {
        if (this._currentNode){
            this.restContextService.getContext(this._currentNode.domain, this._currentNode.application, this._currentNode.name).subscribe( (data) => {
                this.logger.debug(LOG_TAG, 'reloadData results: ', data);

            }, (error) => {
                this.logger.error(LOG_TAG, 'reloadData error: ', error);
    
            });
        }
    }
    
}
