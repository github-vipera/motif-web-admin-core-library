import { WCGridEditorCommandsConfig, WCGridEditorCommandComponentEvent, WCConfirmationTitleProvider } from 'web-console-ui-kit';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { CountersService, CounterInfoEntityList, CounterInfoEntity } from '@wa-motif-open-api/counters-thresholds-service';
import { WCSubscriptionHandler } from '../../../../components/Commons/wc-subscription-handler';
import { CounterInfosModel } from './data/model';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { SelectableSettings } from '@progress/kendo-angular-grid';

export { CounterInfoEntity }  from '@wa-motif-open-api/counters-thresholds-service';

const LOG_TAG = '[CounterInfosComponent]';

export interface SelectionEvent {
    counterInfoName: string;
    data: any
}

export enum EditType {
    Delete = 'Delete',
    Edit = 'Edit',
    StatusChange = 'StatusChange'
}

export interface EditEvent {
    editType: EditType
    dataItem: CounterInfoEntity;
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wa-counter-infos-component',
    styleUrls: ['./counter-infos-component.scss'],
    templateUrl: './counter-infos-component.html'
})
export class CounterInfosComponent implements OnInit, OnDestroy {

    loading = false;
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    public tableModel: CounterInfosModel;
    faEdit = faEdit;
    selectedCounterInfo: string;

    @Output() selectionChange : EventEmitter<SelectionEvent> = new EventEmitter();
    @Output() edit: EventEmitter<EditEvent> = new EventEmitter<EditEvent>();

    public selectableSettings: SelectableSettings = {
        mode: 'single',
        enabled: true,
        checkboxOnly: false
    }   

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
            commandIcon: 'wa-ico-edit',
            commandId: EditType.Edit,
            title: 'Edit'
        },
        { 
            commandIcon: 'wa-ico-no',
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
    ) {}

    ngOnInit() {
        this.tableModel = new CounterInfosModel();
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
        this._subHandler.add(this.countersService.getCounterInfoList().subscribe( (data: CounterInfoEntityList) => {
            this.logger.debug(LOG_TAG, 'getCounterInfoList done: ', data);
            this.tableModel.loadData(data);
            this.clearSelection();
            this.loading = false;
        }, (error) => {
            this.logger.error(LOG_TAG, 'getCounterInfoList error: ', error);
            this.notificationCenter.post({
                name: 'GetCounterInfosError',
                title: 'Get Counter Infos',
                message: 'Error getting counter infos:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
            this.clearSelection();
            this.loading = false;
        }));
    }

    onSelectionChange(event) {
        this.logger.debug(LOG_TAG, 'onSelectionChange event: ', event);
        let data = null;
        if (event.selectedRows.length>0){
            this.selectedCounterInfo = event.selectedRows[0].dataItem.name;
            data = event.selectedRows[0].dataItem;
        } else {
            this.selectedCounterInfo = null;
        }
        this.selectionChange.emit({
            counterInfoName: this.selectedCounterInfo,
            data: data
        });
    }

    private clearSelection(){
        this.selectedCounterInfo = null;
        this.selectionChange.emit({
            counterInfoName: this.selectedCounterInfo,
            data: null
        });
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


}
 
