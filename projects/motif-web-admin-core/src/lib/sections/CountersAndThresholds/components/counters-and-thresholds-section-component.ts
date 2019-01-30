import { CounterInfoEditDialogComponent, EditType } from './dialogs/counter-info-edit-dialog-component/counter-info-edit-dialog-component';
import { WCNotificationCenter } from 'web-console-ui-kit';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { PluginView } from 'web-console-core';
import { ServiceCatalogSelectorDialogComponent, SelectionEvent } from 'src/app/components/UI/selectors/service-catalog-selector/service-catalog-selector-dialog';
import { SelectionEvent as CounterInfoSelectionEvent } from './counter-infos/counter-infos-component'
import { ThresholdEditDialogComponent } from './dialogs/threshold-edit-dialog-component/threshold-edit-dialog-component';

const LOG_TAG = '[CountersAndThresholdsSection]';

@Component({
    selector: 'wa-counters-and-thresholds-section',
    styleUrls: ['./counters-and-thresholds-section-component.scss'],
    templateUrl: './counters-and-thresholds-section-component.html'
})
@PluginView('Counters & Thresholds', {
    iconName: 'ico-thresholds'
})
export class CountersAndThresholdsSectionComponent implements OnInit {

    @ViewChild('counterInfoDialog') counterInfoDialog: CounterInfoEditDialogComponent;
    @ViewChild('thresoldInfoDialog') thresholdDialog: ThresholdEditDialogComponent;

    selectedCounterInfo: string;

    constructor(private logger: NGXLogger, 
        private notificationCenter: WCNotificationCenter) {}

    @ViewChild('entitySelector') _entitySelector: ServiceCatalogSelectorDialogComponent;

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    ontestClick() {
        this.counterInfoDialog.show(EditType.New, 'testname', 'testdesc', true, 'currentPattern', 'testfunction', 'testparams');
    }

    ontest2Click() {
        this.thresholdDialog.show(EditType.New);
    }

    onEntrySelected(selectionEvent: SelectionEvent) {
        this.logger.debug(LOG_TAG, 'onEntrySelected: ', selectionEvent);
    }

    onCounterInfoSelectionChange(selectionEvent: CounterInfoSelectionEvent){
        this.selectedCounterInfo = selectionEvent.counterInfoName;
    }
}
