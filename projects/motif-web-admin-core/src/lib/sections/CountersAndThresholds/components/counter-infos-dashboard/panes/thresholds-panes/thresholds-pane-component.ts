import { EditEvent, EditType } from './../../../thresholds/thresholds-component';
import { CounterInfoEntity, ThresholdInfoEntity, ThresholdsService, ThresholdInfo } from '@wa-motif-open-api/counters-thresholds-service';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { ThresholdsComponent } from '../../../thresholds/thresholds-component';
import { ThresholdDialogResult, ThresholdEditDialogComponent, EditType as DialogEditType } from '../../../dialogs/threshold-edit-dialog-component/threshold-edit-dialog-component';
import { WCSubscriptionHandler } from 'src/app/components/Commons/wc-subscription-handler';

const LOG_TAG = '[ThresholdsPaneComponent]';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wa-thresholds-pane-component',
    styleUrls: ['./thresholds-pane-component.scss'],
    templateUrl: './thresholds-pane-component.html'
})
export class ThresholdsPaneComponent implements OnInit, OnDestroy {

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    faPlusCircle = faPlusCircle;    
    @ViewChild('thresholdsComponent') _thresholdsComponent: ThresholdsComponent;
    @ViewChild('editDialog') _editDialog: ThresholdEditDialogComponent;

    @Input() counterInfo: CounterInfoEntity;

    constructor(
        private logger: NGXLogger,
        private notificationCenter: WCNotificationCenter,
        private thresholdsService: ThresholdsService
    ) {}

    ngOnInit() {
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
    }

    onAddNewThresholdClicked(): void {
        this.logger.debug(LOG_TAG , 'onAddNewThresholdClicked');
        this._editDialog.show(DialogEditType.New);
    }

    onRefreshClicked(): void {
        this.logger.debug(LOG_TAG , 'onRefreshClicked');
        this._thresholdsComponent.reloadData();
    }

    onGridEdit(event: EditEvent){
        this.logger.debug(LOG_TAG , 'onGridEdit:', event);
        if (event.editType === EditType.Edit){
            this.onEditItem(event.dataItem);
        }
        else if (event.editType === EditType.Delete ) {
            this.onDeleteItem(event.dataItem);
        } else if (event.editType === EditType.StatusChange ) {
            this.onChangeStatusItem(event.dataItem);
        }
    }

    private onEditItem(item: ThresholdInfoEntity){
        this._editDialog.show(DialogEditType.Update, item.name, 
            item.description, 
            item.enabled, 
            item.deny,
            item.type,
            item.fn,
            item.fnParams, 
            item.action, 
            item.actionParams);
    }

    private onDeleteItem(item: ThresholdInfoEntity){
        this.deleteThreshold(item);
    }

    private onChangeStatusItem(item: ThresholdInfoEntity){
        this.toggleThresholdStatus(item);
    }

    onEditConfirm(event: ThresholdDialogResult) {
        this.logger.debug(LOG_TAG , 'onEditConfirm:', event);
        if (event.editType === DialogEditType.New) {
            this.addNewThreshold(event);            
        } else if (event.editType === DialogEditType.Update) {
            this.updateThreshold(event);            
        }
    }

    private addNewThreshold(event: ThresholdDialogResult) {
        const thresholdInfo: ThresholdInfo = {
            name: event.name,
            description: event.description,
            enabled: event.enabled,
            deny: event.deny,
            type: event.type,
            counterInfoName: this.counterInfo.name,
            fn: event.fn,
            fnParams: event.fnParams,
            action: event.action,
            actionParams: event.actionParams,
            userId: null,
            domain: null
        };
        this._subHandler.add(this.thresholdsService.createThresholdInfo(thresholdInfo).subscribe( (data: ThresholdInfoEntity) => {
            this.logger.debug(LOG_TAG , 'addNewThreshold done: ', data);

            this.notificationCenter.post({
                name: 'NewThresholdSuccess',
                title: 'New Threshold',
                message: 'The new Threshold has been successfuly create.',
                type: NotificationType.Success,
                closable: false
            });

            this._thresholdsComponent.reloadData();
        }, (error) => {
            this.logger.error(LOG_TAG , 'addNewThreshold error: ', error);

            this.notificationCenter.post({
                name: 'NewThresholdError',
                title: 'New Threshold',
                message: 'Error creating the new Threshold:',
                type: NotificationType.Error,
                error: error,
                closable: true
        });
    }));
    }

    private updateThreshold(event: ThresholdDialogResult) {
        const thresholdInfo: ThresholdInfo = {
            name: event.name,
            description: event.description,
            enabled: event.enabled,
            deny: event.deny,
            type: event.type,
            counterInfoName: this.counterInfo.name,
            fn: event.fn,
            fnParams: event.fnParams,
            action: event.action,
            actionParams: event.actionParams,
            userId: null,
            domain: null
        };
        this._subHandler.add(this.thresholdsService.updateThresholdInfo(event.name, thresholdInfo).subscribe( (data) => {
            this.logger.debug(LOG_TAG , 'updateThreshold done: ', data);

            this.notificationCenter.post({
                name: 'UpdateThresholdSuccess',
                title: 'Update Threshold',
                message: 'The Threshold has been successfuly updated.',
                type: NotificationType.Success,
                closable: false
            });

            this._thresholdsComponent.reloadData();
        }, (error) => {
            this.logger.error(LOG_TAG , 'updateThreshold error: ', error);

            this.notificationCenter.post({
                name: 'UpdateThresholdError',
                title: 'Update Threshold',
                message: 'Error updating the Threshold:',
                type: NotificationType.Error,
                error: error,
                closable: true
        });
        }));
    }

    private toggleThresholdStatus(item: ThresholdInfoEntity) {
        const thresholdInfo: ThresholdInfo = {
            name: item.name,
            description: item.description,
            enabled: !item.enabled,
            deny: item.deny,
            type: item.type,
            counterInfoName: this.counterInfo.name,
            fn: item.fn,
            fnParams: item.fnParams,
            action: item.action,
            actionParams: item.actionParams,
            userId: null,
            domain: null
        };
        this._subHandler.add(this.thresholdsService.updateThresholdInfo(item.name, thresholdInfo).subscribe( (data) => {
            this.logger.debug(LOG_TAG , 'toggleThresholdStatus done: ', data);

            this.notificationCenter.post({
                name: 'UpdateThresholdSuccess',
                title: 'Update Threshold',
                message: 'The Threshold has been successfuly updated.',
                type: NotificationType.Success,
                closable: false
            });

            this._thresholdsComponent.reloadData();
        }, (error) => {
            this.logger.error(LOG_TAG , 'toggleThresholdStatus error: ', error);

            this.notificationCenter.post({
                name: 'UpdateThresholdError',
                title: 'Update Threshold',
                message: 'Error updating the Threshold:',
                type: NotificationType.Error,
                error: error,
                closable: true
        });
        }));
    }

    private deleteThreshold(item: ThresholdInfoEntity) {
        this._subHandler.add(this.thresholdsService.deleteThresholdInfo(item.name).subscribe( (data) => {
            this.logger.debug(LOG_TAG , 'deleteThreshold done: ', data);

            this.notificationCenter.post({
                name: 'DeleteThresholdSuccess',
                title: 'Delete Threshold',
                message: 'The Threshold has been successfuly deleted.',
                type: NotificationType.Success,
                closable: false
            });

            this._thresholdsComponent.reloadData();
        }, (error) => {
            this.logger.error(LOG_TAG , 'deleteThreshold error: ', error);

            this.notificationCenter.post({
                name: 'DeleteThresholdError',
                title: 'Delete Threshold',
                message: 'Error deleting the Threshold:',
                type: NotificationType.Error,
                error: error,
                closable: true
        });
        }));
    }
}
