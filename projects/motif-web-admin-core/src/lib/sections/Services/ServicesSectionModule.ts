import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service'
import { LoggerModule } from 'ngx-logger'
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit'
import { ClipboardModule } from 'ngx-clipboard';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { PluginRegistryServiceModule } from '@wa-motif-open-api/plugin-registry-service'
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { ServicesSectionComponent } from './components/services-section-component'
import { WebAdminCommonServicesModule } from '../../services/WebAdminCommonServicesModule'
import { TreeTableModule } from 'primeng/treetable';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ServiceCataglogEditorComponent } from './components/editors/service-catalog-editor-component';
import { DomainEditorComponent } from './components/editors/domain/domain-editor-component';
import { ApplicationEditorComponent } from './components/editors/application/application-editor-component';
import { ServiceEditorComponent } from './components/editors/service/service-editor-component';
import { OperationEditorComponent } from './components/editors/operation/operation-editor-component';
import { DialogModule } from 'primeng/dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenubarModule } from 'primeng/menubar';
import { NewItemDialogComponent } from './components/dialogs/generic/new-item-dialog';
import { NewOperationDialogComponent } from './components/dialogs/service-operation/new-operation-dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageCategoriesDialogComponent } from './components/dialogs/message-categories/message-categories-dialog';
import { MessageCategoriesModule } from '../../components/MessageCategoriesModule';
import { ServiceCatalogSelectorModule } from '../../components/UI/selectors/service-catalog-selector/ServiceCatalogSelectorModule';


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
        WebAdminCommonServicesModule,
        TreeTableModule,
        LayoutModule,
        DialogModule,
        ButtonsModule,
        ContextMenuModule,
        MenubarModule,
        DropdownModule,
        InputSwitchModule,
        ConfirmDialogModule,
        MessageCategoriesModule,
        ServiceCatalogSelectorModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents: [
        ServicesSectionComponent
    ],
    declarations: [
        ServicesSectionComponent,
        ServiceCataglogEditorComponent,
        DomainEditorComponent,
        ApplicationEditorComponent,
        ServiceEditorComponent,
        OperationEditorComponent,
        NewItemDialogComponent,
        NewOperationDialogComponent,
        MessageCategoriesDialogComponent
    ],
    exports: [ ServicesSectionComponent ],
    providers: [ ConfirmationService  ]
  })
  export class ServicesSectionModule { }



