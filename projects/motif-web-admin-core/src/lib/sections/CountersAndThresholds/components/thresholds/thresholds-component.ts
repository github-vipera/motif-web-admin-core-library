import { WCGridEditorCommandsConfig, WCGridEditorCommandComponentEvent, WCConfirmationTitleProvider  } from 'web-console-ui-kit';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { CountersService, ThresholdInfoEntityList, ThresholdInfoEntity } from '@wa-motif-open-api/counters-thresholds-service';
import { WCSubscriptionHandler } from 'src/app/components/Commons/wc-subscription-handler';
import { ThresholdsInfosModel } from './data/model'; 
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const LOG_TAG = '[ThresholdsComponent]';

export interface SelectionEvent {
    thresholdName: string;
    data: any
}

export enum EditType {
    Delete = 'Delete',
    Edit = 'Edit',
    StatusChange = 'StatusChange'
}

export interface EditEvent {
    editType: EditType
    dataItem: ThresholdInfoEntity;
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wa-threshols-component',
    styleUrls: ['./thresholds-component.scss'],
    templateUrl: './thresholds-component.html'
})
export class ThresholdsComponent implements OnInit, OnDestroy {


    loading = false;
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    public tableModel: ThresholdsInfosModel;
    faEdit = faEdit;
    private _counterInfo: string;
    selectedThreshold: string;

    @Output() selectionChange : EventEmitter<SelectionEvent> = new EventEmitter();
    @Output() edit: EventEmitter<EditEvent> = new EventEmitter<EditEvent>();

    statusConfirmationTitleProvider: WCConfirmationTitleProvider = {
        getTitle(rowData): string {
            if (rowData.enabled){
                return "Disable ?";
            } else {
                return "Enable ?";
            }
        }
    }
    
    commands: WCGridEditorCommandsConfig = [
        { 
            commandIcon: 'assets/img/icons.svg#ico-edit',
            commandId: EditType.Edit,
            title: 'Edit'
        },
        { 
            commandIcon: 'assets/img/icons.svg#ico-no',
            commandId: EditType.Delete,
            title: 'Delete',
            hasConfirmation: true,
            confirmationTitle: 'Delete ?' 
        }
    ];
    
    constructor(
        private logger: NGXLogger,
        private notificationCenter: WCNotificationCenter,
        private countersService: CountersService
    ) {
        this.tableModel = new ThresholdsInfosModel();
    }

    ngOnInit() {
        this.reloadData();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.tableModel.close();
    }

    reloadData() {
        this.logger.debug(LOG_TAG, 'reloadData called');
        this.loading = true;
        if (this._counterInfo){
            this._subHandler.add(this.countersService.getThresholdInfoList(this._counterInfo).subscribe( (data: ThresholdInfoEntityList) => {
                this.logger.debug(LOG_TAG, 'getThresholdInfoList done: ', data);
                this.tableModel.loadData(data);
                this.loading = false;
                this.clearSelection();
            }, (error) => {
                this.logger.error(LOG_TAG, 'getThresholdInfoList error: ', error);
                this.notificationCenter.post({
                    name: 'GetThresholdsListError',
                    title: 'Get Thresholds List',
                    message: 'Error getting thresholds list:',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
                });
                this.clearSelection();
                this.loading = false;
            }));
        } else {
            this.tableModel.close();
            this.loading = false;
            this.clearSelection();
        }

    }

    private clearSelection(){
        this.selectedThreshold = null;
        this.selectionChange.emit({
            thresholdName: this.selectedThreshold,
            data: null
        });
    }

    @Input() public set counterInfo(counterInfo: string) {
        this.logger.debug(LOG_TAG, 'set counterInfo:', counterInfo);
        this._counterInfo = counterInfo;
        this.reloadData();
    }

    public get counterInfo(): string {
        return this._counterInfo;
    }

    onStatusTogglePressed(dataItem): void {
        this.logger.debug(LOG_TAG, 'onStatusTogglePressed dataItem: ', dataItem);
        this.edit.emit({
            editType: EditType.StatusChange,
            dataItem: dataItem
        })
    }

    onCommandConfirm(event: WCGridEditorCommandComponentEvent) {
        this.logger.debug(LOG_TAG, 'onCommandConfirm event: ', event);
        this.edit.emit({
            editType: EditType[event.id],
            dataItem: event.rowData.dataItem
        })
    }

    onCommandClick(event: WCGridEditorCommandComponentEvent){
        this.logger.debug(LOG_TAG, 'onCommandClick event: ', event);
        this.edit.emit({
            editType: EditType[event.id],
            dataItem: event.rowData.dataItem
        })
    }

    onSelectionChange(event) {
        this.logger.debug(LOG_TAG, 'onSelectionChange event: ', event);
        let data = null;
        if (event.selectedRows.length>0){
            this.selectedThreshold = event.selectedRows[0].dataItem.name;
            data = event.selectedRows[0].dataItem;
        } else {
            this.selectedThreshold = null;
        }
        this.selectionChange.emit({
            thresholdName: this.selectedThreshold,
            data: data
        });
    }

}
