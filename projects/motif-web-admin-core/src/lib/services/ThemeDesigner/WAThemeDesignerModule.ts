import { WAThemeDesignerService } from './WAThemeDesignerService';
import { NgModule } from '@angular/core';
import { LoggerModule } from 'ngx-logger'

@NgModule({
    imports: [
        LoggerModule 
    ],
    entryComponents:[
    ],
    declarations: [
    ],
    exports: [ ],
    providers: [ 
        WAThemeDesignerService
    ]
    
  })
  export class WAThemeDesignerModule { }
  


