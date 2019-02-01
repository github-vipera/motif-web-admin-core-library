import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LicenseManagementServiceModule } from '@wa-motif-open-api/license-management-service';
import { LicenseManagerSectionComponent } from './components/license-manager-section-component';
import { LicenseDetailsComponent } from './components/details/license-details-components';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit';
import { ClipboardModule } from 'ngx-clipboard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { WCUploadPanelModule } from '../../components/UI/wc-upload-panel-component/WCUploadPanelModule';

@NgModule({
    imports: [
        LicenseManagementServiceModule,
        GridModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        ClipboardModule,
        FontAwesomeModule,
        CommonsUIModule,
        WCUploadPanelModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents: [
        LicenseManagerSectionComponent
    ],
    declarations: [
        LicenseManagerSectionComponent, LicenseDetailsComponent
    ],
    exports: [ LicenseManagerSectionComponent ],
    providers: [
    ]

  })
  export class LicenseManagerSectionModule { }



