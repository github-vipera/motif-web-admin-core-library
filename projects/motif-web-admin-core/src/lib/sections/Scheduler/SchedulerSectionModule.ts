import { CommonSelectorsModule } from './../../components/CommonsSelectorsModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, 
    WCNotificationCenterModule } from 'web-console-ui-kit';
import { SchedulerServiceModule } from '@wa-motif-open-api/scheduler-service';
import { SchedulerSectionComponent } from './components/scheduler-section.component';
import { ScheduledTaskDetailsComponent } from './components/scheduled-task-details.component';
import { PlatformServiceModule } from '@wa-motif-open-api/platform-service';
import { CommonsUIModule } from '../../components/CommonsUIModule';

@NgModule({
    imports: [
        SchedulerServiceModule,
        PlatformServiceModule,
        GridModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        CommonsUIModule,
        CommonSelectorsModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents: [
        SchedulerSectionComponent
    ],
    declarations: [
        SchedulerSectionComponent, ScheduledTaskDetailsComponent
    ],
    exports: [SchedulerSectionComponent]
})
export class SchedulerSectionModule { }



