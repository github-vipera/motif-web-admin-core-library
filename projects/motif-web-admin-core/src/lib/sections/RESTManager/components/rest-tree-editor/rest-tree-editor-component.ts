import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[RESTTreeEditorComponent]';

@Component({
    selector: 'wa-rest-tree-editor-component',
    styleUrls: ['./rest-tree-editor-component.scss'],
    templateUrl: './rest-tree-editor-component.html'
})
export class RESTTreeEditorComponent implements OnInit, OnDestroy {

    constructor(private logger: NGXLogger,
        private renderer2: Renderer2,
        private changeDetector: ChangeDetectorRef
        ) {
        this.logger.debug(LOG_TAG, 'Opening...');

    }

        /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
    }

}
