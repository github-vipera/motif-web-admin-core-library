import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { RESTCatalogComponent } from './rest-tree-selector/rest-catalog-component';

const LOG_TAG = '[RESTManagerSectionComponent]';

@Component({
    selector: 'wa-rest-manager-section',
    styleUrls: ['./rest-manager-section-component.scss'],
    templateUrl: './rest-manager-section-component.html'
})
@PluginView('REST Manager', {
    iconName: 'wa-ico-services'
})
export class RESTManagerSectionComponent implements OnInit, OnDestroy {

    @ViewChild('restCatalogSelector') restCatalogSelector: RESTCatalogComponent;

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

    onRefreshClicked(){
        alert("onRefreshClicked TODO!!");
    }

    nodeSelect(nodeEvent: any) {
        console.log("Node selected");
    }

    public onChangesSaved(event: any) {
        this.logger.debug(LOG_TAG, 'onChangesSaved: ', event);
        //TODO!!
    }

    public onFilterChange(event: Event) {
        this.logger.debug(LOG_TAG, 'onFilterChange called');
        this.restCatalogSelector.setFilter(event.srcElement['value']);
    }


}   
