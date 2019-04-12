import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LogServiceModule } from '@wa-motif-open-api/log-service';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, 
         WCUIKitDataModule, 
         WCUIKitKendoProviderModule, 
         WCUIKitGridsterProviderModule,
         WCUIKitGridModule, 
         WCUIKitDirectivesModule } from 'web-console-ui-kit';
import { ClipboardModule } from 'ngx-clipboard';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PluginRegistryServiceModule } from '@wa-motif-open-api/plugin-registry-service';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { DialogModule } from 'primeng/dialog';
import { MainDashboardSectionComponent } from './components/main-dashboard-section-component';
import { ServerInfoWidgetPanelComponent } from './components/widgets/ServerInfo/server-info-widget-panel';
import { MemoryInfoWidgetPanelComponent } from './components/widgets/MemoryInfo/memory-info-widget-panel';

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
        WCUIKitGridsterProviderModule
    ],
    entryComponents:[
        MainDashboardSectionComponent, ServerInfoWidgetPanelComponent, MemoryInfoWidgetPanelComponent
    ],
    declarations: [
        MainDashboardSectionComponent, ServerInfoWidgetPanelComponent, MemoryInfoWidgetPanelComponent
    ],
    exports: [ MainDashboardSectionComponent, ServerInfoWidgetPanelComponent, MemoryInfoWidgetPanelComponent ],
    providers: [
    ]

})
export class MainDashboardSectionModule { }



