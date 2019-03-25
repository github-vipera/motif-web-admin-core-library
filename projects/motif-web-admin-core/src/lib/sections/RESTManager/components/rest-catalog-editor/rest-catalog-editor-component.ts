import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy, Input } from '@angular/core';
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
    private _title = 'No selection.';
    isBusy: boolean;

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

    @Input() get title(): string {
        return this._title;
    }

    private setTitle(title: string): void {
        this._title = title;
    }

    
    public startEdit(node: RESTCatalogNode){
        this._currentNode = node;
        if (node){
            this.setTitle('Context ' + node.name);
            this.reloadData();
        }
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

    @Input() get namespace(): string {
        if (this._currentNode){
            return this._currentNode.url;
        } else {
            return "";
        }
    }

    onSaveButtonClick(event) {
        /*        
        if (this.editorContext.editingType === EditingType.Domain) {
            this._domainEditor.saveChanges();
        } else if (this.editorContext.editingType === EditingType.Application) {
            this._applicationEditor.saveChanges();
        } else if (this.editorContext.editingType === EditingType.Service) {
            this._serviceEditor.saveChanges();
        } else if (this.editorContext.editingType === EditingType.Operation) {
            this._operationEditor.saveChanges();
           }*/
    }

    onReloadButtonClick(event) {
        /*
        if (this.editorContext.editingType === EditingType.Domain) {
            this._domainEditor.discardChanges();
        } else if (this.editorContext.editingType === EditingType.Application) {
            this._applicationEditor.discardChanges();
        } else if (this.editorContext.editingType === EditingType.Service) {
            this._serviceEditor.discardChanges();
        } else if (this.editorContext.editingType === EditingType.Operation) {
            this._operationEditor.discardChanges();
        }
        */
    }

    onDataSaved(changes: any) {
        /*
        this.logger.debug(LOG_TAG, 'onDataSaved: ', changes);
        this.changesSaved.emit(changes);
        */
    }
    
}
