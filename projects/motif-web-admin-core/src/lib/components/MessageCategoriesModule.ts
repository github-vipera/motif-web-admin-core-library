import { NgModule } from '@angular/core';
import { CategoryPaneComponent, MessageCategoriesComponent, MessagesPaneComponent } from './MessageCategories/index';
import { LoggerModule } from 'ngx-logger';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule } from 'web-console-ui-kit';
import { CommonsUIModule } from './CommonsUIModule';
import { LocaleNamePipe } from './MessageCategories/data/model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
    imports: [
        LoggerModule,
        LayoutModule,
        ConfirmDialogModule,
        WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, CommonsUIModule
    ],
    entryComponents: [
    ],
    declarations: [
        MessageCategoriesComponent, CategoryPaneComponent, MessagesPaneComponent, LocaleNamePipe
    ],
    exports: [
        MessageCategoriesComponent ],
    providers: [

    ]
  })
  export class MessageCategoriesModule { }



