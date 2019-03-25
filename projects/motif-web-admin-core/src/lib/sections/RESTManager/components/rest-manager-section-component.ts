import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { RESTCatalogComponent, RESTCatalogNodeSelectionEvent } from './rest-catalog-component/rest-catalog-component';

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

    public onChangesSaved(event: any) {
        this.logger.debug(LOG_TAG, 'onChangesSaved: ', event);
        //TODO!!
    }

    public onFilterChange(event: Event) {
        this.logger.debug(LOG_TAG, 'onFilterChange called');
        this.restCatalogSelector.setFilter(event.srcElement['value']);
    }


    nodeSelect(nodeEvent: RESTCatalogNodeSelectionEvent) {
        this.logger.debug(LOG_TAG, 'nodeSelect ', nodeEvent);
        
        /*
        this.logger.debug(LOG_TAG, 'Node selected: ', nodeEvent);

        const catalogEntry = nodeEvent.node.data;
        const nodeType = nodeEvent.node.nodeType;

        if (nodeType === 'Domain') {
            this._servicesEditor.startEditDomain(catalogEntry.domain);
        } else if (nodeType === 'Application') {
            this._servicesEditor.startEditApplication(catalogEntry.domain, catalogEntry.application);
        } else if (nodeType === 'Service') {
            this._servicesEditor.startEditService(catalogEntry.domain,
                catalogEntry.application,
                catalogEntry.service,
                catalogEntry.channel);
        } else if (nodeType === 'Operation') {
            this._servicesEditor.startEditOperation(catalogEntry.domain,
                catalogEntry.application,
                catalogEntry.service,
                catalogEntry.channel,
                catalogEntry.operation);
        }
        this.updateCommands(nodeType);
        */
    }


}   
