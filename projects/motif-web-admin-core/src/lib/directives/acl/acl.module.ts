import { AclDirective } from './acl.directive';
import { NgModule } from '@angular/core';
import { MotifACLService } from './acl.service';

@NgModule({
    imports: [
    ],
    entryComponents:[
    ],
    declarations: [
        AclDirective
    ],
    exports: [ AclDirective ],
    providers: [
        MotifACLService
    ]
  })
  export class MotifACLModule { }
  


