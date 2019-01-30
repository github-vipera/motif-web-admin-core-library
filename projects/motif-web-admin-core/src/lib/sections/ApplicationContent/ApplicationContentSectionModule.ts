import { NewAppDialogComponent } from './components/tabs/applications/dialog/new-app-dialog';
import { WCUploadPanelModule } from '../../components/UI/wc-upload-panel-component/WCUploadPanelModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit';
import { AppContentSectionComponent } from './components/appcontent-section-component';
import { ClipboardModule } from 'ngx-clipboard';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ApplicationsTabComponent } from './components/tabs/applications/applications-appcontent-tab-component';
import { AssetsTabComponent } from './components/tabs/assets/assets-appcontent-tab-component';
import { AppContentServiceModule } from '@wa-motif-open-api/app-content-service';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DroppableModule } from '@ctrl/ngx-droppable';
import { CommonSelectorsModule } from 'src/app/components/CommonsSelectorsModule';
import { DialogModule } from 'primeng/dialog';

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
        AppContentServiceModule,
        CommonsUIModule,
        FontAwesomeModule,
        TooltipModule,
        DroppableModule,
        CommonSelectorsModule,
        WCUploadPanelModule,
        DialogModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents: [
        AppContentSectionComponent, ApplicationsTabComponent, AssetsTabComponent
    ],
    declarations: [
        AppContentSectionComponent, ApplicationsTabComponent, AssetsTabComponent, NewAppDialogComponent
    ],
    exports: [ AppContentSectionComponent, ApplicationsTabComponent, AssetsTabComponent ],
    providers: [
    ]

  })
  export class ApplicationContentSectionModule { }



