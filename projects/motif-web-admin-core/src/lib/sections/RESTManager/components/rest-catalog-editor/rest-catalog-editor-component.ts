import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { ContextsService, ServiceContext, ServiceContextValue } from '@wa-motif-open-api/rest-context-service';
import { RESTCatalogNode } from '../rest-catalog-commons'
import { WCPropertyEditorModel, WCPropertyEditorItemType, WCPropertyEditorItem, WCPropertyEditorComponent } from 'web-console-ui-kit';

const LOG_TAG = '[RESTTreeEditorComponent]';

@Component({
    selector: 'wa-rest-catalog-editor-component',
    styleUrls: ['./rest-catalog-editor-component.scss'],
    templateUrl: './rest-catalog-editor-component.html'
})
export class RESTCatalogEditorComponent implements OnInit, OnDestroy {

    private _currentNode : RESTCatalogNode;
    private _currentServiceContext: ServiceContext;
    private _title = 'No selection.';
    isBusy: boolean;

    @ViewChild('propertyEditor') _propertyEditor : WCPropertyEditorComponent;

    public propertyModel: WCPropertyEditorModel = {
        items: [
        ]
    };

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
            this.restContextService.getContext(this._currentNode.domain, this._currentNode.application, this._currentNode.name).subscribe( (data:ServiceContext) => {
                this.logger.debug(LOG_TAG, 'reloadData results: ', data);
                this._currentServiceContext = data;
                this.rebuildPropertyModel();
            }, (error) => {
                this.logger.error(LOG_TAG, 'reloadData error: ', error);
    
            });
        }
    }

    private rebuildPropertyModel(): void {
        let items = [];
        let values:Array<ServiceContextValue> = this._currentServiceContext.valuesList;
        for (let i=0;i<values.length;i++){
            let valueItem : ServiceContextValue = values[i];
            let propertyItem = this.buildPropertyItemForValueItem(valueItem);
            items.push(propertyItem);
        }
        this.propertyModel = {
            items : items
        }
    }

    private buildPropertyItemForValueItem(valueItem: ServiceContextValue): WCPropertyEditorItem {
        let valueType = WCPropertyEditorItemType.String;
        let value:any = valueItem.value;
        if (valueItem.attribute.type.toLowerCase()==="boolean"){
            valueType = WCPropertyEditorItemType.Boolean;
            value = (valueItem.value === "true" ? true : false );
        }
        return {
            name : valueItem.attribute.name,
            field: valueItem.attribute.name,
            description: valueItem.attribute.name,
            type: valueType,
            value: value,
            badge: "I",
            allowRemove: true
        }
        //(valueItem.attribute["inherited"] ? 'I' : null)
    }

    onPropertyValueChanged(event:any){
        console.log(">>>>>  onPropertyValueChanged:", event);
        if (event.item.valueChanged){
            event.item.badge = null;
        } else {
            event.item.badge = "I";
        }
    }

    @Input() get namespace(): string {
        if (this._currentNode){
            return this._currentNode.url;
        } else {
            return "";
        }
    }

    onAddPropertyClick(event){
        this._propertyEditor.promptForNewProperty(["uno","due","tre"]);
    }

    onNewPropertyRequired(propertyName:string){
        this._propertyEditor.addProperty({
          field: propertyName,
          name: propertyName,
          type: WCPropertyEditorItemType.String,
          allowRemove: true      
        })
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
        this.reloadData();
    }

    onDataSaved(changes: any) {
        /*
        this.logger.debug(LOG_TAG, 'onDataSaved: ', changes);
        this.changesSaved.emit(changes);
        */
    }
    
}
