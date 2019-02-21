import { CommonSelectorsModule } from '../../components/CommonsSelectorsModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { SecurityServiceModule } from '@wa-motif-open-api/security-service';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { UtilitiesSectionComponent } from './components/utilities-section-component';
import { OTPUtilityComponent } from './components/tabs/otp/utilities-otp-tab-component';
import { NewOtpDialogComponent } from './components/tabs/otp/dialog/new-otp-dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogModule } from 'primeng/dialog';

@NgModule({
    imports: [
        SecurityServiceModule,
        GridModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        CommonsUIModule,
        FontAwesomeModule,
        DialogModule,
        CommonSelectorsModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents: [
        UtilitiesSectionComponent
    ],
    declarations: [
        UtilitiesSectionComponent, OTPUtilityComponent, NewOtpDialogComponent
    ],
    exports: [ UtilitiesSectionComponent ],
    providers: [
    ]

})
export class UtilitiesSectionModule { }



