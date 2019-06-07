import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit';
import { LogSectionComponent } from './components/log-section-component';
import { ClipboardModule } from 'ngx-clipboard';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { MotifACLModule } from 'web-console-motif-acl';

@NgModule({
    imports: [
        LogServiceModule,
        GridModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        ClipboardModule,
        DateInputsModule,
        FontAwesomeModule,
        CommonsUIModule,
        WCUIKitGridModule,
        WCNotificationCenterModule,
        MotifACLModule
    ],
    entryComponents: [
        LogSectionComponent
    ],
    declarations: [
        LogSectionComponent
    ],
    exports: [ LogSectionComponent ],
    providers: [
    ]

})
export class LogSectionModule { }



