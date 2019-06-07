import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, 
         WCUIKitDataModule, 
         WCUIKitKendoProviderModule, 
         WCUIKitGridModule, 
         WCUIKitDirectivesModule } from 'web-console-ui-kit';
import { ClipboardModule } from 'ngx-clipboard';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PluginsSectionComponent } from './components/plugins-section-component';
import { PluginRegistryServiceModule } from '@wa-motif-open-api/plugin-registry-service';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { DialogModule } from 'primeng/dialog';
import { UninstallConfirmationDialogComponent } from './dialogs/uninstall-confirmation-dialog-component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { WCUploadPanelModule } from '../../components/UI/wc-upload-panel-component/WCUploadPanelModule';
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
        PluginRegistryServiceModule,
        CommonsUIModule,
        WCUIKitGridModule,
        WCUIKitDirectivesModule,
        DialogModule,
        InputSwitchModule,
        WCUploadPanelModule,
        MotifACLModule
    ],
    entryComponents:[
        PluginsSectionComponent
    ],
    declarations: [
        PluginsSectionComponent, UninstallConfirmationDialogComponent
    ],
    exports: [ PluginsSectionComponent ],
    providers: [
    ]

})
export class PluginsSectionModule { }



