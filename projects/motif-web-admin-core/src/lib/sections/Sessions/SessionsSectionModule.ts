import { CommonSelectorsModule } from '../../components/CommonsSelectorsModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { SecurityServiceModule } from '@wa-motif-open-api/security-service';
import { SessionsSectionComponent } from './components/sessions-section-component';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit';
import { CommonsUIModule } from '../../components/CommonsUIModule';

@NgModule({
    imports: [
        SecurityServiceModule,
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
    entryComponents:[
        SessionsSectionComponent
    ],
    declarations: [
        SessionsSectionComponent
    ],
    exports: [ SessionsSectionComponent ],
    providers: [
    ]

})
export class SessionsSectionModule { }



