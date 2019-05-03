import { MotifACLModule } from 'ngx-motif-acl';
import { CommonSelectorsModule } from './../../components/CommonsSelectorsModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service'
import { LoggerModule } from 'ngx-logger'
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule, WCUIKitDirectivesModule } from 'web-console-ui-kit'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { RESTManagerSectionComponent } from './components/rest-manager-section-component';
import { RESTCatalogComponent } from './components/rest-catalog-component/rest-catalog-component';
import { RESTCatalogEditorComponent } from './components/rest-catalog-editor/rest-catalog-editor-component';
import { RESTContextDialogComponent } from './components/dialogs/new-context-dialog/rest-context-dialog-component';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';


@NgModule({
    imports: [
        LogServiceModule,
        GridModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        FontAwesomeModule,
        CommonsUIModule,
        WCUIKitGridModule,
        WCNotificationCenterModule,
        TreeTableModule,
        WCUIKitDirectivesModule,
        DialogModule,
        CommonSelectorsModule,
        InputSwitchModule,
        MotifACLModule
    ],
    entryComponents: [
        RESTManagerSectionComponent
    ],
    declarations: [
        RESTManagerSectionComponent, RESTCatalogComponent, RESTCatalogEditorComponent , RESTContextDialogComponent
    ],
    exports: [ RESTManagerSectionComponent ],
    providers: [  ]
  })
  export class RESTManagerSectionModule { }



