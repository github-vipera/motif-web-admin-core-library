import { Component, OnInit, OnDestroy,  ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ServiceCatalogSelectorDialogComponent, SelectionEvent } from '../../../../components/UI/selectors/service-catalog-selector/service-catalog-selector-dialog';
import { SelectionEvent as CounterInfoSelectionEvent } from '../counter-infos/counter-infos-component'
import { saveAs } from '@progress/kendo-file-saver';
import { WCUploadPanelEvent } from '../../../../components/UI/wc-upload-panel-component';
import { faFileImport, faDownload } from '@fortawesome/free-solid-svg-icons';
import { CounterInfoEntity, CountersService, CounterInfo, CounterInfoUpdatableFields } from '@wa-motif-open-api/counters-thresholds-service';
import { WCSubscriptionHandler } from '../../../../components/Commons/wc-subscription-handler';
import { CounterInfosPaneComponent } from './panes/counter-infos-panes/counter-infos-pane-component';
import { ThresholdsPaneComponent } from './panes/thresholds-panes/thresholds-pane-component';

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

    @ViewChild('countersPane') _countersPane: CounterInfosPaneComponent;
    @ViewChild('thresholdsPane') _thresholdsPane: ThresholdsPaneComponent;

    faDownload = faDownload;
    faFileImport = faFileImport;

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    selectedCounterInfo: any;

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
    }

    onCounterInfoSelectionChange(selectionEvent: CounterInfoSelectionEvent){
        this.selectedCounterInfo = selectionEvent.counterInfoName;
    }

    onExportClicked(): void {
        this.notificationCenter.post({
            name: 'CTExport',
            title: 'Counters & Thresholds Export',
            message: 'Exporting Counters & Thresholds...',
            type: NotificationType.Info
        });

        this._subHandler.add(this.countersService.downloadXml().subscribe((data) => {
            this.logger.debug(LOG_TAG , 'Export done.', data);

            const blob = new Blob([data], {type: 'application/zip'});

            const fileName = 'counters_thresholds_' + new Date().getTime() + '.xml';

            this.logger.debug(LOG_TAG , 'Saving to: ', blob);

            saveAs(blob, fileName);
            // FileSaver.saveAs(blob, fileName);
            this.logger.debug(LOG_TAG , 'Log saved: ', fileName);

            this.notificationCenter.post({
                name: 'CTExport',
                title: 'Counters & Thresholds Export',
                message: 'Counter & Thresholds Exported.',
                type: NotificationType.Success
            });

        }, (error) => {
            this.logger.error(LOG_TAG , 'Counters & Thresholds export error:', error);

            this.notificationCenter.post({
                name: 'CTExportError',
                title: 'Counters & Thresholds Export',
                message: 'Error exporting Counters & Thresholds:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    onUploadCTError(error){
        this.notificationCenter.post({
            name: 'ImportCTError',
            title: 'Import Counters & Thresholds Error',
            message: 'Error importing Counters & Thresholds:',
            type: NotificationType.Error,
            error: error,
            closable: true
        });
    }

    uploadCT(event: WCUploadPanelEvent): void {
        this.logger.debug(LOG_TAG, 'uploadAssetBundle : ', event);

        this.notificationCenter.post({
            name: 'ImportCTProgress',
            title: 'Import Counters & Thresholds',
            message: 'Importing Counters & Thresholds...',
            type: NotificationType.Info
        });

        this._subHandler.add(this.countersService.uploadXml(event.file).subscribe((result) => {
            this._countersPane.onRefreshClicked();
            this.logger.debug(LOG_TAG, 'Bundle uploaded successfully: ', result);

            this.notificationCenter.post({
                name: 'UploadBundleSuccess',
                title: 'Upload Bundle',
                message: 'The bundle has been successfully uploaded.',
                type: NotificationType.Success
            });

        }, (error) => {
            this.logger.error(LOG_TAG, 'Error uploading bundle: ', error);

            this.notificationCenter.post({
                name: 'UploadBundleError',
                title: 'Upload Bundle',
                message: 'Error uploading bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }
}
