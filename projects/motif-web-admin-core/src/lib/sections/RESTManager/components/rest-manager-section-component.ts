import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { RESTCatalogComponent, RESTCatalogNodeSelectionEvent } from './rest-catalog-component/rest-catalog-component';
import { RESTCatalogNode } from './rest-catalog-commons'
import { RESTCatalogEditorComponent } from './rest-catalog-editor/rest-catalog-editor-component';

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
    @ViewChild('restCatalogEditor') restCatalogEditor: RESTCatalogEditorComponent;

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
        this.restCatalogSelector.reloadData();
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
        this.restCatalogEditor.startEdit(nodeEvent.node);
        /*
        this.updateCommands(nodeType);
        */
    }

    onAddRESTContextPressed(){
        alert("TODO!!")
    }

}   
