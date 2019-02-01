import { WCUploadPanelModule } from '../../components/UI/wc-upload-panel-component/WCUploadPanelModule';
import { WebContentUpdateDialogComponent } from './components/dialog/webcontent-update-dialog';
import { CommonSelectorsModule } from './../../components/CommonsSelectorsModule';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { LoggerModule } from 'ngx-logger'
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit'
import { CommonsUIModule } from '../../components/CommonsUIModule'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { InputSwitchModule } from 'primeng/inputswitch';
import { WebContentSectionComponent } from './components/webcontent-section-component';
import { WebContentServiceModule } from '@wa-motif-open-api/web-content-service';
import { DialogModule } from 'primeng/dialog';

@NgModule({
    imports: [
        GridModule, 
        LoggerModule, 
        WCUIKitCoreModule, 
        WCUIKitDataModule, 
        WCUIKitKendoProviderModule,
        CommonsUIModule,
        FontAwesomeModule,
        InputSwitchModule,
        FormsModule,
        CommonSelectorsModule,
        WebContentServiceModule,
        DialogModule,
        WCUploadPanelModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents: [
        WebContentSectionComponent
    ],
    declarations: [
        WebContentSectionComponent, WebContentUpdateDialogComponent
    ],
    exports: [ WebContentSectionComponent ],
    providers: [ 
    ]
    
  })
  export class WebContentSectionModule { }
  


