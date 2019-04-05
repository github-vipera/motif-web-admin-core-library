import { Component, Input, OnInit } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { WebAdminCoreInfoService } from '../../../services/webAdminCoreInfoService';

const LOG_TAG = '[TopInfoComponent]';

@Component({
    selector: 'wc-top-info-component',
    styleUrls: [ './top-info-component.scss' ],
    templateUrl: './top-info-component.html'
})
export class TopInfoComponent implements OnInit {

    @Input() public visible: boolean;

    constructor(private logger: NGXLogger,
        private coreInfoService: WebAdminCoreInfoService
        ) {
            this.logger.debug(LOG_TAG, 'Ctor...');
        }

    ngOnInit(): void {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public get currentLibraryVersion():String {
        return this.coreInfoService.currentLibraryVersion();
    }

    public get buildTimestamp():Number {
        return this.coreInfoService.buildTimestamp();
    }


}
