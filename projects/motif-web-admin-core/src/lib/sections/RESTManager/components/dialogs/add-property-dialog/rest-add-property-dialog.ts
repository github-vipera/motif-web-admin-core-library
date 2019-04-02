import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[RESTAddPropertyDialogComponent]';

@Component({
    selector: 'wa-rest-add-property-dialog',
    styleUrls: ['./rest-add-property-dialog.scss'],
    templateUrl: './rest-add-property-dialog.html'
})
export class RESTAddPropertyDialogComponent implements OnInit {

    display: boolean;

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

}
