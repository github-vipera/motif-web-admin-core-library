import { NgModule } from '@angular/core';
import { ServiceCatalogService } from './ServiceCatalogService'
import { RESTContextCatalogService } from './RESTContextCatalogService'
import { LoggerModule } from 'ngx-logger'
import { CatalogServiceModule } from '@wa-motif-open-api/catalog-service'
import { PlatformServiceModule } from '@wa-motif-open-api/platform-service'

@NgModule({
    imports: [
        LoggerModule, CatalogServiceModule, PlatformServiceModule 
    ],
    entryComponents:[
    ],
    declarations: [
    ],
    exports: [ ],
    providers: [ 
        ServiceCatalogService, RESTContextCatalogService
    ]
    
  })
  export class WebAdminCommonServicesModule { }
  


