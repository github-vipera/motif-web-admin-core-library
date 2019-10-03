import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NGXLogger, AuthService, EventBusService } from 'web-console-core';
import { MotifACLService } from 'web-console-motif-acl';
import { WCTopBarService, WCTopBarItem, WCTopBarLocation } from 'web-console-core';
import { TopMenuComponent, TopInfoComponent, TopLogoComponent } from '../../components/TopMenu/index';
import { SessionService } from '../../components/Commons/session-service';


const LOG_TAG = "[WebAdminCoreService]"

@Injectable({
    providedIn: 'root',
})
export class WebAdminCoreService {

    private env: any;
    private _useAcl = false;

    constructor(private logger: NGXLogger,
        private eventBus: EventBusService,
        private authService: AuthService,
        private aclService: MotifACLService,
        private sessionService: SessionService,
        private topBarService: WCTopBarService) {
            this.logger.debug(LOG_TAG, "ctor");
    }

    public start(useAcl: boolean) {
        this.logger.debug(LOG_TAG, "start called...");
        this._useAcl = useAcl;
        return this._startWebAdmin();
    }

    private _startWebAdmin() {
        this.logger.debug(LOG_TAG, "Starting...");

        this.initTopBar();
        
        if (this._useAcl){
            this.startACLService();
        }
    }

    private startACLService() {
        //Subscribe for Login events
        this.eventBus.on('AuthService:LoginEvent').subscribe((message) => {
            this.logger.debug(LOG_TAG, "on AuthService:LoginEvent received");
            if (this._useAcl){
                this.aclService.reloadPermissions().subscribe();
            }
            this.sessionService.invalidateCache();
            this.topBarService.clear();
            this.initTopBar();
        });
        // if is already authenticated retrive immediatly
        if (this.authService.isAuthenticated()) {
            if (this._useAcl){
                this.aclService.reloadPermissions().subscribe((results)=>{
                    this.logger.debug(LOG_TAG, "ACL service started.", results);
                }, (error) => {
                    this.logger.error(LOG_TAG, "ACL service error:", error);
                })
            }
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

    public aclEnabled():boolean {
        return this._useAcl;
    }

}
