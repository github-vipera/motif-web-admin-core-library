import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { ContextsService, ServiceContext } from '@wa-motif-open-api/rest-context-service';

const LOG_TAG = '[RESTTreeEditorComponent]';

@Component({
    selector: 'wa-rest-catalog-editor-component',
    styleUrls: ['./rest-catalog-editor-component.scss'],
    templateUrl: './rest-catalog-editor-component.html'
})
export class RESTCatalogEditorComponent implements OnInit, OnDestroy {

    constructor(private logger: NGXLogger,
        private renderer2: Renderer2,
        private changeDetector: ChangeDetectorRef,
        private restContextService: ContextsService
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
    
    /*
    public void loadData():void {
        this.restContextService.getContext(domain, application, contextName).subscribe( (data) => {

        }, (error) => {

        });
    }
    */
}
