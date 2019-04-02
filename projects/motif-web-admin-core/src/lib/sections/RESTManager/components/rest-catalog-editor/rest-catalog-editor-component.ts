import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { ContextsService, ServiceContext, ServiceContextValue } from '@wa-motif-open-api/rest-content-service';
import { RESTCatalogNode } from '../rest-catalog-commons'
import { WCPropertyEditorModel, WCPropertyEditorItemType, WCPropertyEditorItem, WCPropertyEditorComponent } from 'web-console-ui-kit';
import { ServiceContextAttribute } from '@wa-motif-open-api/web-content-service';
import { WCSubscriptionHandler } from '../../../../components/Commons/wc-subscription-handler';
import * as _ from 'lodash'


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
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    private _supportedAttributes: Array<ServiceContextAttribute>;

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
        this._subHandler.unsubscribe();
        this._subHandler = null;
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
        this.logger.debug(LOG_TAG, 'reloadData called.');
        this._propertyEditor.cancelNewPropertyPrompt();
        if (this._currentNode){

            this._subHandler.add(this.restContextService.getContext(this._currentNode.domain, this._currentNode.application, this._currentNode.name).subscribe( (data:ServiceContext) => {
                this.logger.debug(LOG_TAG, 'reloadData results: ', data);
                this._currentServiceContext = data;
                this.rebuildPropertyModel();
            }, (error) => {
                this.logger.error(LOG_TAG, 'reloadData [context] error: ', error);
    
            }));

            this._subHandler.add(this.restContextService.getSupportedAttributes().subscribe((results:Array<ServiceContextAttribute>)=>{
                this.logger.debug(LOG_TAG, 'getSupportedAttributes results: ', results);
                this._supportedAttributes = results;
            }, (error)=>{
                this.logger.error(LOG_TAG, 'reloadData [supportedAttributes] error: ', error);

            }));
        }
    }

    private rebuildPropertyModel(): void {
        this.logger.debug(LOG_TAG, 'rebuildPropertyModel called.');
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
        this.logger.debug(LOG_TAG, 'buildPropertyItemForValueItem called for:', valueItem);
        let valueType = WCPropertyEditorItemType.String;
        let value:any = valueItem.value;
        if (valueItem.attribute.type.toLowerCase()==="boolean"){
            valueType = WCPropertyEditorItemType.Boolean;
            value = (valueItem.value === "true" ? true : false );
        }
        let isInherited = this.isValueInherited(valueItem);
        return {
            name : valueItem.attribute.name,
            field: valueItem.attribute.name,
            description: valueItem.attribute.name,
            type: valueType,
            value: value,
            badge: (isInherited? "I" : null),
            allowRemove: (isInherited? false:true)
        }
        //(valueItem.attribute["inherited"] ? 'I' : null)
    }

    isValueInherited(valueItem: ServiceContextValue):boolean {
        if (valueItem.properties){
            for (let i=0;i<valueItem.properties.length;i++){
                if (valueItem.properties[i].key === "inherited"){
                    return this.stringToBool(valueItem.properties[i].value);
                }
            }
        }
        return false;
    }

    stringToBool(value:string):boolean {
        return (value.toUpperCase()==="TRUE");
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
        let availableProperties = this.buildAvailableAttributes();
        let avaliablePropertyNames = _.map(availableProperties, 'name'); 
        this._propertyEditor.promptForNewProperty(avaliablePropertyNames);
    }

    private buildAvailableAttributes():Array<ServiceContextAttribute> {
        const ret : Array<ServiceContextAttribute> = [];
        for (let i=0;i<this._supportedAttributes.length;i++){
            if (!this.isAttributeConfigured(this._supportedAttributes[i].name)){
                ret.push(this._supportedAttributes[i]);
            }
        }
        return ret;
    }

    private isAttributeConfigured(attributeName: string):boolean {
        return (this.getConfiguredAttribute(attributeName)!=null);
    }

    private getConfiguredAttribute(attributeName:string):WCPropertyEditorItem {
        return _.find(this.propertyModel.items, (obj:WCPropertyEditorItem)=>{
            return (obj.field === attributeName && !obj.removed);
        });
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
