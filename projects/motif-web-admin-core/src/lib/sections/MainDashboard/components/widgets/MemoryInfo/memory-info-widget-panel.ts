import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { InfoService, ServerStatus } from '@wa-motif-open-api/info-service'

const LOG_TAG = '[MemoryInfoWidgetPanelComponent]';

@Component({
    selector: 'wa-memory-info-widget-panel',
    styleUrls: [ './memory-info-widget-panel.scss' ],
    templateUrl: './memory-info-widget-panel.html'
})
export class MemoryInfoWidgetPanelComponent implements OnInit, OnDestroy {

    @Input()
    serverStatus: ServerStatus;

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

    public get model():ServerStatus {
        return this.serverStatus;
    }


}
