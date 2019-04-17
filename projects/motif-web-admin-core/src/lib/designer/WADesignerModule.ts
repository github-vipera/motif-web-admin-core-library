import { CommonsUIModule } from './../components/CommonsUIModule';
import { WADesignerComponent } from './component/wa-designer-component';
import { NgModule } from '@angular/core';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule,
    WCNotificationCenterModule } from 'web-console-ui-kit';
import { WebConsoleCoreModule } from 'web-console-core'

@NgModule({
    imports: [
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        CommonsUIModule,
        WCUIKitGridModule,
        WCNotificationCenterModule,
        WebConsoleCoreModule
    ],
    declarations: [
        WADesignerComponent
    ],
    exports: [ WADesignerComponent ],
    providers: [
    ]
  })
  export class WADesignerModule { }

