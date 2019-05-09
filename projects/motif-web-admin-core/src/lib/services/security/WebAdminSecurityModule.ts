import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebAdminACLGuard } from './acl/webadmin.acl.guard';

@NgModule({
    imports: [
        CommonModule
    ],
    entryComponents:[
    ],
    declarations: [ 
        
    ],
    exports: [],
    providers: [
        WebAdminACLGuard
    ]

  })
  export class WebAdminSecurityModule { }



