import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ServiceCatalogSelectorDialogComponent, SelectionEvent } from '../../../../components/UI/selectors/service-catalog-selector/service-catalog-selector-dialog';
import { SelectionEvent as CounterInfoSelectionEvent } from '../counter-infos/counter-infos-component'
import { faFileImport, faDownload } from '@fortawesome/free-solid-svg-icons';

const LOG_TAG = '[CounterInfosDashboard]';

export interface SelectionEvent {
    counterInfoName: string;
    data: any
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wa-counter-infos-dashboard-component',
    styleUrls: ['./counter-infos-dashboard-component.scss'],
    templateUrl: './counter-infos-dashboard-component.html'
})
export class CounterInfosDashboardComponent implements OnInit, OnDestroy {

    faDownload = faDownload;
    faFileImport = faFileImport;
    selectedCounterInfo: any;

    constructor(
        private logger: NGXLogger,
        private notificationCenter: WCNotificationCenter
    ) {}

    ngOnInit() {
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
    }

    onAddNewCounterInfoClicked(): void {
        this.notificationCenter.post({
            name: 'NewCounterInfoWarn',
            title: 'New Counter Info',
            message: 'This functionality is not yet implemented.',
            type: NotificationType.Warning,
            closable: false
        });

        //TODO!!
        //alert("TODO!! Add New Counter Info");
    }

    onAddNewThresholdClicked(): void {
        //TODO!!
        //alert("TODO!! Add New Threshold");
        this.notificationCenter.post({
            name: 'NewThresholdWarn',
            title: 'New Threshold',
            message: 'This functionality is not yet implemented.',
            type: NotificationType.Warning,
            closable: false
        });
    }

    onRefreshClicked(): void {
        //TODO!!
        //alert("TODO!! Refresh");
        this.notificationCenter.post({
            name: 'CounterInfoRefreshWarn',
            title: 'Refresh',
            message: 'This functionality is not yet implemented.',
            type: NotificationType.Warning,
            closable: false
        });
    }

    onExportClicked(): void {
        //TODO!!
        //alert("TODO!! Export");
        this.notificationCenter.post({
            name: 'CounterInfoExportWarn',
            title: 'Export',
            message: 'This functionality is not yet implemented.',
            type: NotificationType.Warning,
            closable: false
        });
    }

    onImportClicked(): void {
        //TODO!!
        //alert("TODO!! Import");
        this.notificationCenter.post({
            name: 'CounterInfoImportWarn',
            title: 'Import',
            message: 'This functionality is not yet implemented.',
            type: NotificationType.Warning,
            closable: false
        });
    }

    onCounterInfoSelectionChange(selectionEvent: CounterInfoSelectionEvent){
        this.selectedCounterInfo = selectionEvent.counterInfoName;
    }

}
