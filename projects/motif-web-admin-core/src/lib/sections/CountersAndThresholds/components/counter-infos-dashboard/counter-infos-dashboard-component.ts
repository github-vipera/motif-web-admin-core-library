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
        //TODO!!
        alert("TODO!! Add New Counter Info");
    }

    onAddNewThresholdClicked(): void {
        //TODO!!
        alert("TODO!! Add New Threshold");
    }

    onRefreshClicked(): void {
        //TODO!!
        alert("TODO!! Refresh");
    }

    onExportClicked(): void {
        //TODO!!
        alert("TODO!! Export");
    }

    onImportClicked(): void {
        //TODO!!
        alert("TODO!! Import");
    }

    onCounterInfoSelectionChange(selectionEvent: CounterInfoSelectionEvent){
        this.selectedCounterInfo = selectionEvent.counterInfoName;
    }

}
