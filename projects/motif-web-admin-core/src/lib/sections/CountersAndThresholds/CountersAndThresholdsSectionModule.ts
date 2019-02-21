import { CommonSelectorsModule } from './../../components/CommonsSelectorsModule';
import { CountersListComponent } from './components/counters-list/counters-list-component';
import { CounterInfosPaneComponent } from './components/counter-infos-dashboard/panes/counter-infos-panes/counter-infos-pane-component';
import { ThresholdsPaneComponent } from './components/counter-infos-dashboard/panes/thresholds-panes/thresholds-pane-component';
import { CounterInfosDashboardComponent } from './components/counter-infos-dashboard/counter-infos-dashboard-component';
import { ThresholdEditDialogComponent } from './components/dialogs/threshold-edit-dialog-component/threshold-edit-dialog-component';
import { CounterInfoEditDialogComponent } from './components/dialogs/counter-info-edit-dialog-component/counter-info-edit-dialog-component';
import { ThresholdDetailsComponent } from './components/thresholds/details/threshold-details-component';
import { ThresholdsComponent } from './components/thresholds/thresholds-component';
import { ServiceCatalogSelectorModule } from './../../components/UI/selectors/service-catalog-selector/ServiceCatalogSelectorModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { CountersAndThresholdsSectionComponent } from './components/counters-and-thresholds-section-component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogModule } from 'primeng/dialog';
import { CounterInfosComponent } from './components/counter-infos/counter-infos-component';
import { CountersThresholdsServiceModule } from '@wa-motif-open-api/counters-thresholds-service';
import { CounterInfoDetailsComponent } from './components/counter-infos/details/counter-info-details-component';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
    imports: [
        CountersThresholdsServiceModule,
        InputSwitchModule,
        GridModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        CommonsUIModule,
        FontAwesomeModule,
        DialogModule,
        ServiceCatalogSelectorModule,
        CommonSelectorsModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents: [
        CountersAndThresholdsSectionComponent
    ],
    declarations: [
        CountersAndThresholdsSectionComponent, 
        CounterInfosComponent, 
        CounterInfoDetailsComponent, 
        ThresholdDetailsComponent,
        CounterInfoEditDialogComponent,
        ThresholdEditDialogComponent,
        ThresholdsComponent,
        CounterInfosDashboardComponent,
        ThresholdsPaneComponent,
        CounterInfosPaneComponent,
        CountersListComponent

    ],
    exports: [ CountersAndThresholdsSectionComponent ],
    providers: [
    ]

})
export class CountersAndThresholdsSectionModule { }



