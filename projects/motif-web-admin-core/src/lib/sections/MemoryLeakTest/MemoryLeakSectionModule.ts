import { DroppableModule } from '@ctrl/ngx-droppable';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCNotificationCenterModule } from 'web-console-ui-kit';
import { ClipboardModule } from 'ngx-clipboard';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PluginRegistryServiceModule } from '@wa-motif-open-api/plugin-registry-service';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { FooASectionComponent } from './components/a/foo-a-section-component';
import { FooBSectionComponent } from './components/b/foo-b-section-component';
import { FooCSectionComponent } from './components/c/foo-c-section-component';
import { ServiceCatalogSelectorModule } from '../../components/UI/selectors/service-catalog-selector/ServiceCatalogSelectorModule';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DragDropModule } from '@angular/cdk/drag-drop'

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
        ServiceCatalogSelectorModule,
        ContextMenuModule,
        DragDropModule,
        WCNotificationCenterModule
    ],
    entryComponents:[
        FooASectionComponent, FooBSectionComponent, FooCSectionComponent
    ],
    declarations: [
        FooASectionComponent, FooBSectionComponent, FooCSectionComponent
    ],
    exports: [ FooASectionComponent, FooBSectionComponent, FooCSectionComponent ],
    providers: [
    ]

})
export class MemoryLeakSectionModule { }



