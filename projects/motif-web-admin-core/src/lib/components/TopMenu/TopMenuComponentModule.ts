import { TopLogoComponent } from './logo/top-logo-component';
import { CommonsUIModule } from './../CommonsUIModule';
import { TopInfoComponent } from './info/top-info-component';
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
        TopMenuComponent, TopInfoComponent, TopLogoComponent
    ],
    declarations: [
        TopMenuComponent, TopInfoComponent, TopLogoComponent
    ],
    exports: [
        TopMenuComponent, TopInfoComponent, TopLogoComponent
    ],
    providers: [
    ]
  })
  export class TopMenuComponentModule { }



 