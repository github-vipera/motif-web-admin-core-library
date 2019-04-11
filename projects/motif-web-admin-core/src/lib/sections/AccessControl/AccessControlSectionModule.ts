import { CommonSelectorsModule } from './../../components/CommonsSelectorsModule';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { LoggerModule } from 'ngx-logger';
import { WCUIKitCoreModule, WCUIKitDataModule, WCUIKitKendoProviderModule, WCUIKitGridModule,
    WCNotificationCenterModule } from 'web-console-ui-kit';
import { AuthAccessControlServiceModule } from '@wa-motif-open-api/auth-access-control-service';
import { AccessControlSectionComponent } from './components/access-control-section.component';
import { PlatformServiceModule } from '@wa-motif-open-api/platform-service';
import { CommonsUIModule } from '../../components/CommonsUIModule';
import { GridContextMenuComponent } from './components/grid-context-menu.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { NewUserDialogComponent } from './components/dialogs/user/new-user-dialog';
import { NewAclEntityDialogComponent } from './components/dialogs/acl/entities/new-acl-entity-dialog';
import { AclRelationsDialogComponent } from './components/dialogs/acl/relations/acl-relations-dialog';
import { DialogModule } from 'primeng/dialog';

@NgModule({
    imports: [
        AuthAccessControlServiceModule,
        PlatformServiceModule,
        GridModule,
        LoggerModule,
        WCUIKitCoreModule,
        WCUIKitDataModule,
        WCUIKitKendoProviderModule,
        CommonsUIModule,
        CommonSelectorsModule,
        WCUIKitGridModule,
        WCNotificationCenterModule,
        DialogModule
    ],
    entryComponents:[
        AccessControlSectionComponent
    ],
    declarations: [
        AccessControlSectionComponent,
        GridContextMenuComponent,
        UsersListComponent,
        NewUserDialogComponent,
        NewAclEntityDialogComponent,
        AclRelationsDialogComponent
    ],
    exports: [ AccessControlSectionComponent ],
    providers: [
    ]
  })
  export class AccessControlSectionModule { }

