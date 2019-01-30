import { Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { NGXLogger } from 'web-console-core';
import { WCPropertyEditorModel, WCPropertyEditorItem } from 'web-console-ui-kit';
import { WCNotificationCenter } from 'web-console-ui-kit';
import { EditorContext, ServiceCatalogEditorChangesEvent } from './service-catalog-editor-context';

const LOG_TAG = '[BaseEditorComponent]';

export abstract class BaseEditorComponent  {

    private _currentEditorContext: EditorContext;

    public propertyModel: WCPropertyEditorModel;

    @Output() public startLoading: EventEmitter<any> = new EventEmitter();
    @Output() public endLoading: EventEmitter<any> = new EventEmitter();

    @Output() public startSaving: EventEmitter<any> = new EventEmitter();
    @Output() public endSaving: EventEmitter<ServiceCatalogEditorChangesEvent> = new EventEmitter();
    @Output() public endSavingWithError: EventEmitter<any> = new EventEmitter();

    constructor(public logger: NGXLogger,
        public notificationCenter: WCNotificationCenter) {
    }

    protected setModel(model: WCPropertyEditorModel) {
        this.propertyModel = model;
    }

    @Input()
    public set editorContext(editorContext: EditorContext) {
        this._currentEditorContext = editorContext;
        this.startLoading.emit();
        this.doRefreshData(this._currentEditorContext).subscribe((event) => {
            this.endLoading.emit();
        }, (error) => {
            this.endLoading.emit();
        });
    }

    public get editorContext(): EditorContext {
        return this._currentEditorContext;
    }

    public saveChanges() {
        this.startSaving.emit();
        this.doSaveChanges(this._currentEditorContext).subscribe(() => {
            this.endSaving.emit({
                context: this._currentEditorContext,
                model: this.propertyModel
            });
        }, (error) => {
            this.endSavingWithError.emit(error);
        });
    }

    public discardChanges() {
        this.logger.debug(LOG_TAG, 'discardChanges called.');
        this.startLoading.emit();
        this.doRefreshData(this._currentEditorContext).subscribe((data) => {
            this.endLoading.emit();
        }, (error) => {
            this.endLoading.emit();
        });
    }

    protected getPropertyItem(field: string): WCPropertyEditorItem {
        const items: WCPropertyEditorItem[] = this.propertyModel.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].field === field) {
                return items[i];
            }
        }
        return null;
    }

    protected applyValueToModel(field: string, value: any) {
        this.getPropertyItem(field).value = value;
        this.getPropertyItem(field).valueChanged = false;
      }


    protected getChangedProperties(): WCPropertyEditorItem[] {
        const ret = [];
        for (let i = 0; i < this.propertyModel.items.length; i++) {
            if (this.propertyModel.items[i].valueChanged) {
                ret.push(this.propertyModel.items[i]);
            }
        }
        return ret;
    }

    protected commitAllChanges(): void {
        const items = this.propertyModel.items;
        for (let i = 0; i < items.length; i++) {
            items[i].valueChanged = false;
        }
    }

    abstract doRefreshData(editorContext: EditorContext): Observable<any>;

    abstract doSaveChanges(editorContext: EditorContext): Observable<any>;

}
