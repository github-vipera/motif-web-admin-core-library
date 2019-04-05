import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { ContextsService, ServiceContext, ServiceContextValue, RestContextUpdate } from '@wa-motif-open-api/rest-content-service';
import { ValuesService, ValueCreate, Value } from '@wa-motif-open-api/context-service';
import { RESTCatalogNode } from '../rest-catalog-commons'
import { WCPropertyEditorModel, WCPropertyEditorItemType, WCPropertyEditorItem, WCPropertyEditorComponent, WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ServiceContextAttribute } from '@wa-motif-open-api/web-content-service';
import { WCSubscriptionHandler } from '../../../../components/Commons/wc-subscription-handler';
import * as _ from 'lodash'
import { Observable, forkJoin } from 'rxjs'

const LOG_TAG = '[RESTTreeEditorComponent]';

const DEFAULT_TITLE = 'No selection.';

@Component({
    selector: 'wa-rest-catalog-editor-component',
    styleUrls: ['./rest-catalog-editor-component.scss'],
    templateUrl: './rest-catalog-editor-component.html'
})
export class RESTCatalogEditorComponent implements OnInit, OnDestroy {


    private _currentNode : RESTCatalogNode;
    private _currentServiceContext: ServiceContext;
    private _title = DEFAULT_TITLE;
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
        private restContextService: ContextsService,
        private valuesService: ValuesService,
        private notificationCenter: WCNotificationCenter
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

    public clear(){
        this._currentNode = null;
        this.setTitle(DEFAULT_TITLE);
        this.propertyModel= {
            items: [
            ]
        };
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
        let valueType = this.propertyTypeForAttribute(valueItem.attribute);
        let value:any = valueItem.value;
        if (valueItem.attribute.type.toLowerCase()==="boolean"){
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
        let attr:ServiceContextAttribute = _.find(this._supportedAttributes, (attribute:ServiceContextAttribute)=>{
            return (attribute.name===propertyName);
        });
        this._propertyEditor.addProperty({
          field: attr.name,
          name: attr.name,
          type: this.propertyTypeForAttribute(attr),
          allowRemove: true      
        })
      }
    
      propertyTypeForAttribute(attr:ServiceContextAttribute):WCPropertyEditorItemType {
        let valueType = WCPropertyEditorItemType.String;
        if (attr.type.toLowerCase()==="boolean"){
            valueType = WCPropertyEditorItemType.Boolean;
        }
        return valueType;
      }

    saveChanges(){
        this.logger.debug(LOG_TAG, 'saveChanges called for:', this.propertyModel);
        let restContextUpdate:RestContextUpdate = {
            
        };

        // get removed properties
        const removedProperties = _.filter(this.propertyModel.items, (o:WCPropertyEditorItem) => {
            if (o.removed) return o;
        });

        // get changed properties
        const changedProperties = _.filter(this.propertyModel.items, (o:WCPropertyEditorItem) => {
            if (o.valueChanged) return o;
        });
        
        const filtered = this.filterProperties(changedProperties);
        const newProperties = filtered.newProps;
        const updatedProperties = filtered.updatedProps;

        this.logger.debug(LOG_TAG, "saveChanges REMOVED PROPS:", removedProperties);
        this.logger.debug(LOG_TAG, "saveChanges CHANGED PROPS:", changedProperties);
        this.logger.debug(LOG_TAG, "saveChanges NEW PROPS:", newProperties);
        this.logger.debug(LOG_TAG, "saveChanges UPDATED PROPS:", updatedProperties);

        let requests = [];

        newProperties.forEach( (element:WCPropertyEditorItem) => {
            let valueCreate:ValueCreate = {
                attribute: element.field,
                value: this.toAttributeValue(element).value
            };
            const o:Observable<any> = this.valuesService.createValue(this._currentNode.domain, this._currentNode.application, this._currentNode.name, valueCreate);
            requests.push(o);
        });

        updatedProperties.forEach((element:WCPropertyEditorItem) => {
            let attrValue:Value = this.toAttributeValue(element);
            const o:Observable<any> = this.valuesService.updateValue(this._currentNode.domain, this._currentNode.application, this._currentNode.name, element.field, attrValue);
            requests.push(o);
        });

        removedProperties.forEach((element:WCPropertyEditorItem) => {
            const o:Observable<any> = this.valuesService.deleteValue(this._currentNode.domain, this._currentNode.application, this._currentNode.name, element.field);
            requests.push(o);
        });

        this._subHandler.add(forkJoin(requests).subscribe((results) => {
            this.logger.debug(LOG_TAG, "saveChanges results:", results);
            this.notificationCenter.post({
                name: 'UpdateRESTContextAttributes',
                title: 'REST Context Attributes Update',
                message: 'REST Context attributes updated successfully.',
                type: NotificationType.Success
            });

            this.reloadData();

        }, (errors) => {
            this.logger.error(LOG_TAG, 'UpdateRESTContextAttributesError error: ', errors);
            this.notificationCenter.post({
                name: 'UpdateRESTContextAttributesError',
                title: 'REST Context Attributes Update',
                message: 'Error updating REST context attributes:',
                type: NotificationType.Error,
                error: errors,
                closable: true
            });

        }));

    }

    toAttributeValue(prop:WCPropertyEditorItem): Value {
        if (prop.type==WCPropertyEditorItemType.String){
            return { value: prop.value };
        } else if (prop.type==WCPropertyEditorItemType.Boolean){
            return (prop.value ? { value: "true" } : {value : "false" });
        } else {
            return { value: prop.value };            
        }
    }

    private filterProperties(props:Array<WCPropertyEditorItem>): any {
        this.logger.debug(LOG_TAG, 'filterNewProperties called for:', props, this._currentServiceContext);
        let updatedProps: Array<WCPropertyEditorItem> = [];
        let newProps: Array<WCPropertyEditorItem> = [];
        props.forEach(property => {
           const attr:ServiceContextValue = _.find(this._currentServiceContext.valuesList, (item:ServiceContextValue)=>{
                return (item.attribute.name === property.field)
           });
           if (attr && !this.isValueInherited(attr)){
            updatedProps.push(property);
           } else {
            newProps.push(property);
           }  
        });
        return { "newProps": newProps, "updatedProps": updatedProps };
    }

    private filterUpdatedProperties(props:Array<WCPropertyEditorItem>):Array<WCPropertyEditorItem>{
        return [];
    }

    onSaveButtonClick(event) {
        this.logger.debug(LOG_TAG, 'onSaveButtonClick called');
        this.saveChanges();
    }

    onReloadButtonClick(event) {
        this.logger.debug(LOG_TAG, 'onReloadButtonClick called');
        this.reloadData();
    }


}
