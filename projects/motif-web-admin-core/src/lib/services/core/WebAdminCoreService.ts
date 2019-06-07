import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NGXLogger, AuthService, EventBusService } from 'web-console-core';
import { MotifACLService } from 'web-console-motif-acl';

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
        private authService: AuthService,
        private aclService: MotifACLService,
        private topBarService: WCTopBarService) {
            this.logger.debug(LOG_TAG, "ctor");
    }

    public start() {
        this.logger.debug(LOG_TAG, "start called...");
        return this._startWebAdmin();
    }

    private _startWebAdmin() {
        this.logger.debug(LOG_TAG, "Starting...");

        this.initTopBar();
        
        this.startACLService()
    }

    private startACLService() {
        //Subscribe for Login events
        this.eventBus.on('AuthService:LoginEvent').subscribe((message) => {
            this.logger.debug(LOG_TAG, "on AuthService:LoginEvent received");
            this.aclService.reloadPermissions().subscribe();
        })
        // if is already authenticated retrive immediatly
        if (this.authService.isAuthenticated()) {
            this.aclService.reloadPermissions().subscribe((results)=>{
                this.logger.debug(LOG_TAG, "ACL service started.", results);
            }, (error) => {
                this.logger.error(LOG_TAG, "ACL service error:", error);
            })
        } else {
            //nop
        }
}

    private initTopBar(){
        this.logger.debug(LOG_TAG, "Initializing top bar...");
        this.topBarService.registerItem(new WCTopBarItem('appInfo', TopInfoComponent), WCTopBarLocation.Left);
        this.topBarService.registerItem(new WCTopBarItem('mainMenu', TopMenuComponent), WCTopBarLocation.Right);
        this.topBarService.registerItem(new WCTopBarItem('logoTop', TopLogoComponent), WCTopBarLocation.Center);  
    }

}
