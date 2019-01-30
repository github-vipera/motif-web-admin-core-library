import { CommonsUIModule } from './../CommonsUIModule';
import { TopMenuComponent } from './top-menu-component';
import { NgModule } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { WebConsoleCoreModule } from 'web-console-core';

@NgModule({
    imports: [
        MenuModule, ButtonModule, FontAwesomeModule, WebConsoleCoreModule, CommonsUIModule
    ],
    entryComponents: [
        TopMenuComponent
    ],
    declarations: [
        TopMenuComponent
    ],
    exports: [
        TopMenuComponent ],
    providers: [

    ]
  })
  export class TopMenuComponentModule { }



