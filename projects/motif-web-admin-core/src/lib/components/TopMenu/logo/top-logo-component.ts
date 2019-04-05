import { Component, Input, OnInit } from '@angular/core';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[TopLogoComponent]';

@Component({
    selector: 'wc-top-logo-component',
    styleUrls: [ './top-logo-component.scss' ],
    templateUrl: './top-logo-component.html'
})
export class TopLogoComponent implements OnInit {

    @Input() public visible: boolean;

    constructor(private logger: NGXLogger
        ) {
            this.logger.debug(LOG_TAG, 'Ctor...');
        }

    ngOnInit(): void {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

}
