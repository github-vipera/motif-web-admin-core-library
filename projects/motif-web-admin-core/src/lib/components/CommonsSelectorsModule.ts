import { NgModule } from '@angular/core';
import { LogServiceModule } from '@wa-motif-open-api/log-service';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule } from 'web-console-ui-kit';
import { DomainSelectorComboBoxComponent } from './UI/selectors/domain-selector-combobox-component';
import { ApplicationSelectorComboBoxComponent } from './UI/selectors/application-selector-combobox-component';
import { UsersSelectorComboBoxComponent } from './UI/selectors/users-selector-combobox-component';
import { ServicesSelectorComboBoxComponent } from './UI/selectors/services-selector-combobox-component';
import { DialogModule } from 'primeng/dialog';

@NgModule({
    imports: [
        DialogModule,
        LogServiceModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule
    ],
    entryComponents: [
    ],
    declarations: [
        DomainSelectorComboBoxComponent,
        ApplicationSelectorComboBoxComponent,
        UsersSelectorComboBoxComponent,
        ServicesSelectorComboBoxComponent
    ],
    exports: [ 
        DomainSelectorComboBoxComponent,
        ApplicationSelectorComboBoxComponent,
        UsersSelectorComboBoxComponent,
        ServicesSelectorComboBoxComponent
     ],
    providers: [
    ]

  })
  export class CommonSelectorsModule { }



