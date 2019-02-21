import { CommonSelectorsModule } from './../../components/CommonsSelectorsModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LoggerModule } from 'ngx-logger'
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule, WCNotificationCenterModule } from 'web-console-ui-kit'
import { OAuth2ServiceModule } from '@wa-motif-open-api/oauth2-service'
import { OAuth2SectionComponent } from './components/oauth2-section.component'
import { RefreshTokenDetailsComponent } from './components/refresh-token-details.component'
import { PlatformServiceModule } from '@wa-motif-open-api/platform-service'
import { CommonsUIModule } from '../../components/CommonsUIModule'

@NgModule({
    imports: [
        OAuth2ServiceModule, 
        PlatformServiceModule, 
        GridModule, 
        LoggerModule, 
        WCUIKitCoreModule, 
        WCUIKitDataModule, 
        WCUIKitKendoProviderModule,
        CommonsUIModule,
        CommonSelectorsModule,
        WCUIKitGridModule,
        WCNotificationCenterModule
    ],
    entryComponents:[
        OAuth2SectionComponent
    ],
    declarations: [
        OAuth2SectionComponent, RefreshTokenDetailsComponent
    ],
    exports: [ OAuth2SectionComponent ]
  })
  export class OAuth2SectionModule { }
  


