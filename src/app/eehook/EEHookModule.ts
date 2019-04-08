import { EEHook } from './EEHook';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { EEHookComponent } from './eehook-component';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule } from 'web-console-ui-kit';

@NgModule({
    imports: [
        DialogModule,
        WCUIKitKendoProviderModule
    ],
    entryComponents: [
        EEHookComponent
    ],
    declarations: [
        EEHookComponent, EEHook
    ],
    exports: [ 
        EEHookComponent, EEHook
    ],
    providers: [
    ]

  })
  export class EEHookModule { 
    static forRoot(): ModuleWithProviders {
        return {
          ngModule: EEHookModule
        };
      }
  }

