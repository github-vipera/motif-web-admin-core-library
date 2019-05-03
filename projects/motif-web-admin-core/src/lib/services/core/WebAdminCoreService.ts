import { PKGINFO } from '../../pkginfo';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { EventBusService } from 'web-console-core';
import { MotifACLService } from 'ngx-motif-acl';
import { AuthService } from 'web-console-core';
import { WCTopBarService, WCTopBarItem, WCTopBarLocation } from 'web-console-core';
import { TopMenuComponent, TopInfoComponent, TopLogoComponent } from '../../components/TopMenu/index';


const LOG_TAG = "[WebAdminCoreService]"

@Injectable({
    providedIn: 'root',
})
export class WebAdminCoreService {

    private env: any;

    constructor(private logger: NGXLogger,
        private eventBus: EventBusService,
        private aclService: MotifACLService,
        private authService: AuthService,
        private topBarService: WCTopBarService) {
    }

    public start() {
        this._startWebAdmin();
    }

    private _startWebAdmin() {
        this.logger.debug("Starting...");

        this.startACLService();
        
        this.initTopBar();
    }

    private startACLService() {
        this.logger.debug("Starting ACL service...");

        //Subscribe for Login events
        this.eventBus.on('AuthService:LoginEvent').subscribe((message) => {
            this.logger.debug("on AuthService:LoginEvent received");
            this.aclService.reloadPermissions().subscribe();
        })
        // if is already authenticated retrive immediatly
        if (this.authService.isAuthenticated()) {
            this.aclService.reloadPermissions().subscribe();
        }
    }

    private initTopBar(){
        this.logger.debug("Initializing top bar...");
        this.topBarService.registerItem(new WCTopBarItem('appInfo', TopInfoComponent), WCTopBarLocation.Left);
        this.topBarService.registerItem(new WCTopBarItem('mainMenu', TopMenuComponent), WCTopBarLocation.Right);
        this.topBarService.registerItem(new WCTopBarItem('logoTop', TopLogoComponent), WCTopBarLocation.Center);  
    
    }
}
