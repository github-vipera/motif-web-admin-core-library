import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { InfoService, ServerStatus, UsersInfo } from '@wa-motif-open-api/info-service'

const LOG_TAG = '[UsersInfoWidgetPanelComponent]';

@Component({
    selector: 'wa-users-info-widget-panel',
    styleUrls: [ './users-info-widget-panel.scss' ],
    templateUrl: './users-info-widget-panel.html'
})
export class UsersInfoWidgetPanelComponent implements OnInit, OnDestroy {

    @Input()
    usersInfo: UsersInfo;

    constructor(private logger: NGXLogger,
        private infoService: InfoService
        ) {
        this.logger.debug(LOG_TAG , 'Opening...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
    }

    ngOnDestroy() {
    }

    public get model():UsersInfo {
        return this.usersInfo;
    }


}
