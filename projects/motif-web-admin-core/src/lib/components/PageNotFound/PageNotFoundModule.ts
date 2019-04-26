import { NgModule } from '@angular/core';
import { LogServiceModule } from '@wa-motif-open-api/log-service';
import { LoggerModule } from 'ngx-logger';
import { PageNotFoundComponent } from './page-not-found.component';
import { NavigationService, WebConsoleCoreModule } from 'web-console-core'


@NgModule({
    imports: [
        LogServiceModule,
        LoggerModule,
        WebConsoleCoreModule
    ],
    entryComponents: [
    ],
    declarations: [
        PageNotFoundComponent
    ],
    exports: [ 
        PageNotFoundComponent
     ],
    providers: [
        NavigationService
    ]

  })
  export class PageNotFoundModule { }



