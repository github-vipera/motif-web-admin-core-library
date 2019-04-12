import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { InfoService, ServerStatus, OAuth2Info } from '@wa-motif-open-api/info-service'

const LOG_TAG = '[UsersInfoWidgetPanelComponent]';

@Component({
    selector: 'wa-oauth2-info-widget-panel',
    styleUrls: [ './oauth2-info-widget-panel.scss' ],
    templateUrl: './oauth2-info-widget-panel.html'
})
export class OAuth2InfoWidgetPanelComponent implements OnInit, OnDestroy {

    @Input()
    oauth2Info: OAuth2Info;

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

    public get model():OAuth2Info {
        return this.oauth2Info;
    }


}
