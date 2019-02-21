import { SessionService } from './../Commons/session-service';
import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService, StatusBarService, NGXLogger } from 'web-console-core';
import * as moment_ from 'moment'
const moment = moment_;

const LOG_TAG = '[TopMenuComponent]';

@Component({
    selector: 'wc-top-menu-component',
    styleUrls: [ './top-menu-component.scss' ],
    templateUrl: './top-menu-component.html'
})
export class TopMenuComponent implements OnInit {

    private _mainMenuLabel: string;
    items: MenuItem[];

    @Input() public visible: boolean;

    constructor(private logger: NGXLogger,
        private authService:AuthService,
        private sessionService: SessionService
        ) {}

    ngOnInit(): void {
        this.logger.debug(LOG_TAG, 'Initializing...', this.sessionService.currentUser);
        this._mainMenuLabel = this.sessionService.currentUser.userAbbr;
        const lastAccessStr = "Last Login: " + this.getLastAccessStr();
        const currentUserDesc = this.getCurrentUserDesc();
        this.items = [
            {label: currentUserDesc, disabled: true }, 
            {label: lastAccessStr, disabled: true }, 
            {separator: true }, 
            {label: 'Logout', icon: 'pi pi-fw pi-angle-right', command: (event) => { this.onLogout(); } } 
        ];
    }

    private getCurrentUserDesc(): string {
        this.logger.debug(LOG_TAG, 'getCurrentUserDesc for:', this.sessionService.currentUser);
        return 'Current user: ' + this.sessionService.currentUser.userName;
    }

    private getLastAccessStr(): string {
        this.logger.debug(LOG_TAG, 'getLastAccessStr for:', this.sessionService.currentUser.lastAccess);
        try {
            return moment(this.sessionService.currentUser.lastAccess).format('ddd, h:mm A');
            //return dateFormat(this.sessionService.currentUser.lastAccess, "mm/dd/yyyy h:MM:ss TT");
        } catch (err) {
            this.logger.error(LOG_TAG, 'getLastAccessStr error:', err);
            return 'n.a.'
        }
    }

    onLogout() {
        this.logger.debug(LOG_TAG, 'Logout invoked.');
        this.authService.logout();
    }

    public get mainMenuLabel(): string {
        return this._mainMenuLabel;
    }

}
