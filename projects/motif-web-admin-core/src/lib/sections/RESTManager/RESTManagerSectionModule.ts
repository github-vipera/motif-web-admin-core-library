import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service'
import { LoggerModule } from 'ngx-logger'
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { RESTManagerSectionComponent } from './components/rest-manager-section-component';
import { RESTTreeSelectorComponent } from './components/rest-tree-selector/rest-tree-selector-component';
import { RESTTreeEditorComponent } from './components/rest-tree-editor/rest-tree-editor-component';
import { TreeTableModule } from 'primeng/treetable';


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
        TreeTableModule
    ],
    entryComponents: [
        RESTManagerSectionComponent
    ],
    declarations: [
        RESTManagerSectionComponent, RESTTreeSelectorComponent, RESTTreeEditorComponent 
    ],
    exports: [ RESTManagerSectionComponent ],
    providers: [  ]
  })
  export class RESTManagerSectionModule { }



