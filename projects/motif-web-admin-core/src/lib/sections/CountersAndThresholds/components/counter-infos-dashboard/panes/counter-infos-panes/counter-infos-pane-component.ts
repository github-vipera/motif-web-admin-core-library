import { CountersAndThresholdUtils } from './../../../../commons/CountersAndThresholdUtils';
import { EditEvent, EditType } from './../../../counter-infos/counter-infos-component';
import { CounterInfoEditDialogComponent, EditType as DialogEditType, CounterInfoDialogResult } from './../../../dialogs/counter-info-edit-dialog-component/counter-info-edit-dialog-component';
import { CounterInfoEntity, CountersService, CounterInfo, CounterInfoUpdatableFields } from '@wa-motif-open-api/counters-thresholds-service';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Input, forwardRef, ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { SelectionEvent, CounterInfosComponent } from '../../../counter-infos/counter-infos-component'
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { WCSubscriptionHandler } from '../../../../../../components/Commons/wc-subscription-handler';

const LOG_TAG = '[CounterInfosPaneComponent]';

export const WC_COUNTER_INFO_PANE_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CounterInfosPaneComponent),
    multi: true
};


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wa-counter-infos-pane-component',
    styleUrls: ['./counter-infos-pane-component.scss'],
    templateUrl: './counter-infos-pane-component.html',
    providers: [WC_COUNTER_INFO_PANE_CONTROL_VALUE_ACCESSOR]
})
export class CounterInfosPaneComponent implements OnInit, OnDestroy {

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    faPlusCircle = faPlusCircle;
    private _selectedCounterInfo: CounterInfoEntity;
    @ViewChild('counterInfosComponent') _counterInfosComponent: CounterInfosComponent;
    @ViewChild('editDialog') _editDialog: CounterInfoEditDialogComponent;

    @Output() selectionChange:EventEmitter<CounterInfoEntity> = new EventEmitter<CounterInfoEntity>();

    constructor(
        private logger: NGXLogger,
        private notificationCenter: WCNotificationCenter,
        private countersService: CountersService
    ) {}

    ngOnInit() {
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this._subHandler.unsubscribe();
        this._selectedCounterInfo = null;
        this._editDialog = null;
        this._counterInfosComponent = null;
    }

    onCounterInfoSelectionChange(selectionEvent: SelectionEvent){
        this.logger.debug(LOG_TAG , 'onCounterInfoSelectionChange ', selectionEvent);
        this._selectedCounterInfo = selectionEvent.data;
        this.propagateChange(this._selectedCounterInfo);
        this.selectionChange.emit(selectionEvent.data);
    }

    public get selectedCounterInfo(): CounterInfoEntity {
        return this._selectedCounterInfo;
    }
    
    onAddNewCounterInfoClicked(): void {
        this.logger.debug(LOG_TAG , 'onAddNewCounterInfoClicked ');
        this._editDialog.show(DialogEditType.New);
    }

    onRefreshClicked(): void {
        this.logger.debug(LOG_TAG , 'onRefreshClicked');
        this._counterInfosComponent.reloadData(); 
    }

    onEditConfirm(event: CounterInfoDialogResult) {
        this.logger.debug(LOG_TAG , 'onEditConfirm:', event);
        if (event.editType === DialogEditType.New) {
            this.addNewCounterInfo(event);            
        } else if (event.editType === DialogEditType.Update) {
            this.updateCounterInfo(event);            
        }
    }

    private addNewCounterInfo(event: CounterInfoDialogResult){
        const counterInfo: CounterInfo = {
            name: event.name,
            description: event.description,
            enabled: event.enabled,
            channel: event.channel,
            domain: event.domain,
            application: event.application,
            operation: event.operation,
            service: event.service,
            fn: event.fn,
            fnParams: event.fnParams
        }
        this._subHandler.add(this.countersService.createCounterInfo(counterInfo).subscribe( (data: CounterInfoEntity) => {
                this.logger.debug(LOG_TAG , 'addNewCounterInfo done: ', data);

                this.notificationCenter.post({
                    name: 'NewCounterInfoSuccess',
                    title: 'New Counter Info',
                    message: 'The new Counter Info has been successfuly create.',
                    type: NotificationType.Success,
                    closable: false
                });

                this._counterInfosComponent.reloadData();
            }, (error) => {
                this.logger.error(LOG_TAG , 'addNewCounterInfo error: ', error);

                this.notificationCenter.post({
                    name: 'NewCounterInfoError',
                    title: 'New Counter Info',
                    message: 'Error creating the new Counter Info:',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
            });
        }));
    }

    private updateCounterInfo(event: CounterInfoDialogResult){
        const fields: CounterInfoUpdatableFields = {
            description: event.description,
            enabled: event.enabled,
            fn: event.fn,
            fnParams: event.fnParams
        };
        this._subHandler.add(this.countersService.updateCounterInfo(event.name, fields).subscribe( (data) => {
            this.logger.debug(LOG_TAG , 'updateCounterInfo done: ', data);

            this.notificationCenter.post({
                name: 'UpdateCounterInfoSuccess',
                title: 'Update Counter Info',
                message: 'The Counter Info has been successfuly updated.',
                type: NotificationType.Success,
                closable: false
            });

            this._counterInfosComponent.reloadData();
        }, (error) => {
            this.logger.error(LOG_TAG , 'UpdateCounterInfoSuccess error: ', error);

            this.notificationCenter.post({
                name: 'UpdateCounterInfoError',
                title: 'Update Counter Info',
                message: 'Error updating the Counter Info:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }


    onGridEdit(event: EditEvent){
        this.logger.debug(LOG_TAG , 'onGridEdit:', event);
        if (event.editType === EditType.Edit){
            this.onEditItem(event.dataItem);
        }
        else if (event.editType === EditType.Delete ) {
            this.onDeleteItem(event.dataItem);
        } else if (event.editType === EditType.StatusChange ) {
            this.onChaneStatusItem(event.dataItem);
        }
    }

    private onEditItem(item: CounterInfoEntity){
        this._editDialog.show(DialogEditType.Update, item.name, 
            item.description, 
            item.enabled, 
            this.buildPattern(item), 
            item.fn, item. fnParams);
    }

    private onDeleteItem(item: CounterInfoEntity){
        this.logger.debug(LOG_TAG , 'onDeleteItem:', event);
        this._subHandler.add(this.countersService.deleteCounterInfo(item.name).subscribe( (data) => {
            this.logger.debug(LOG_TAG , 'onDeleteItem done: ', data);

            this.notificationCenter.post({
                name: 'DeleteCounterInfoSuccess',
                title: 'Delete Counter Info',
                message: 'The Counter Info has been successfuly deleted.',
                type: NotificationType.Success,
                closable: false
            });

            this._counterInfosComponent.reloadData();
        }, (error) => {
            this.logger.error(LOG_TAG , 'UpdateCounterInfoSuccess error: ', error);

            this.notificationCenter.post({
                name: 'DeleteCounterInfoError',
                title: 'Delete Counter Info',
                message: 'Error deleting the Counter Info:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    private onChaneStatusItem(item: CounterInfoEntity){
        const fields: CounterInfoUpdatableFields = {
            description: item.description,
            enabled: !item.enabled,
            fn: item.fn,
            fnParams: item.fnParams
        };
        this._subHandler.add(this.countersService.updateCounterInfo(item.name, fields).subscribe( (data) => {
            this.logger.debug(LOG_TAG , 'updateCounterInfo done: ', data);

            this.notificationCenter.post({
                name: 'UpdateCounterInfoSuccess',
                title: 'Update Counter Info',
                message: 'The Counter Info has been successfuly updated.',
                type: NotificationType.Success,
                closable: false
            });

            this._counterInfosComponent.reloadData();
        }, (error) => {
            this.logger.error(LOG_TAG , 'UpdateCounterInfoSuccess error: ', error);

            this.notificationCenter.post({
                name: 'UpdateCounterInfoError',
                title: 'Update Counter Info',
                message: 'Error updating the Counter Info:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    private buildPattern(item: CounterInfoEntity): string {
        return CountersAndThresholdUtils.buildServiceCatalogEntryPattern(item.channel, 
            item.domain, item.application, item.service, item.operation);
    }

    propagateChange: any = () => {};

    writeValue(value: any) {
        if ( value ) {
         this._selectedCounterInfo = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: () => void): void { }

}
