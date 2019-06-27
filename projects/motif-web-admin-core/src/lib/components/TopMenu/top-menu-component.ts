import { SessionService } from './../Commons/session-service';
import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService, NGXLogger, EventBusService } from 'web-console-core';
import { CurrentUserInfo } from '../Commons/session-service';

const LOG_TAG = '[TopMenuComponent]';

@Component({
    selector: 'wc-top-menu-component',
    styleUrls: [ './top-menu-component.scss' ],
    templateUrl: './top-menu-component.html'
})
export class TopMenuComponent implements OnInit {

    private _mainMenuLabel: string;
    items: MenuItem[];
    private currentUserInfo: CurrentUserInfo;

    @Input() public visible: boolean;

    constructor(private logger: NGXLogger,
        private authService: AuthService,
        private eventBus: EventBusService,
        private sessionService: SessionService
        ) {}

    ngOnInit(): void {
        this.logger.debug(LOG_TAG, 'Initializing...');

        this.eventBus.on('AuthService:LoginEvent').subscribe((message) => {
            this.logger.debug(LOG_TAG, 'on AuthService:LoginEvent received');
            this.updateInfo();
        });

        // Fallback info
        this.currentUserInfo = {
            userName: 'N/A',
            userAbbr: 'NA',
            lastAccess: new Date()
        };
        this._mainMenuLabel = this.currentUserInfo.userAbbr;
        this.items = [
            { label: this.getCurrentUserDesc(), disabled: true },
            { label: 'Last Login: ' + this.getLastAccessStr(), disabled: true },
            { separator: true },
            { label: 'Logout', icon: 'pi pi-fw pi-angle-right', command: (event) => { this.onLogout(); } }
        ];

        // Retrieve from server
        this.updateInfo();
    }

    private updateInfo(): void {
        this.sessionService.currentUser.subscribe((currentUserInfo: CurrentUserInfo) => {
            this.currentUserInfo = currentUserInfo;
            this._mainMenuLabel = currentUserInfo.userAbbr;
            this.items = [
                { label: this.getCurrentUserDesc(), disabled: true },
                { label: 'Last Login: ' + this.getLastAccessStr(), disabled: true },
                { separator: true },
                { label: 'Logout', icon: 'pi pi-fw pi-angle-right', command: (event) => { this.onLogout(); } }
            ];
        }, (error) => {
            this.logger.warn('error while retrieving current user info from sessions service: ', error);
        });
    }

    private getCurrentUserDesc(): string {
        this.logger.debug(LOG_TAG, 'getCurrentUserDesc for:', this.currentUserInfo);
        return 'Current user: ' + this.currentUserInfo.userName;
    }

    private formatDate(date) {
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];
      
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
      
        return day + ' ' + monthNames[monthIndex] + ' ' + year;
      }
      

    private getLastAccessStr(): string {
        this.logger.debug(LOG_TAG, 'getLastAccessStr for:', this.currentUserInfo.lastAccess);
        try {
            //let now = moment().format('LLLL');
            //moment("20111031", "YYYYMMDD").fromNow();// this.sessionService.currentUser.lastAccess);
            //return myMoment.format('ddd, h:mm A');
            //return moment(this.sessionService.currentUser.lastAccess).format('ddd, h:mm A');
            return this.formatDate(new Date(this.currentUserInfo.lastAccess));
        } catch (err) {
            this.logger.error(LOG_TAG, 'getLastAccessStr error:', err);
            return 'n.a.'
        }
    }

    onLogout() {
        this.logger.debug(LOG_TAG, 'Logout invoked.');
        this.authService.logout().subscribe((resp) => {
        }, (err) => {
            this.logger.warn('Logout revoke request failed');
        });
    }

    public get mainMenuLabel(): string {
        return this._mainMenuLabel;
    }

}
