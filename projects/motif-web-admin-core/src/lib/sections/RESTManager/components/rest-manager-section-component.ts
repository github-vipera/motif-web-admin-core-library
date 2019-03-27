import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { RESTCatalogComponent, RESTCatalogNodeSelectionEvent } from './rest-catalog-component/rest-catalog-component';
import { RESTCatalogEditorComponent } from './rest-catalog-editor/rest-catalog-editor-component';
import { RESTContextDialogComponent, RESTContextDialogResult, DialogMode } from './dialogs/new-context-dialog/rest-context-dialog-component';
import { RESTContextCatalogService } from '../../../services';
import { WCSubscriptionHandler } from 'dist/motif-web-admin-core/lib';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';

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
    @ViewChild('contextEditDialog') contextEditDialog: RESTContextDialogComponent;

    private _subHandler: WCSubscriptionHandler= new WCSubscriptionHandler();

    constructor(private logger: NGXLogger,
        private renderer2: Renderer2,
        private changeDetector: ChangeDetectorRef,
        private restCatalogService: RESTContextCatalogService,
        private notificationCenter: WCNotificationCenter
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
        this.contextEditDialog.showForNew();
    }

    doCreateRESTContext(event:RESTContextDialogResult){
        this._subHandler.add(
            this.restCatalogService.createRESTContext(event.domain, event.application, event.name, event.url).subscribe( (results)=> {

                this.logger.info(LOG_TAG , 'REST context created:', results);
                this.notificationCenter.post({
                    name: 'CreateRESTContext',
                    title: 'REST Context Create',
                    message: 'REST Context created successfully.',
                    type: NotificationType.Success
                });
                this.restCatalogSelector.reloadData();

                
            }, (error) => {

                this.logger.error(LOG_TAG, 'Creating REST Context error:', error);
                this.notificationCenter.post({
                    name: 'CreateRESTContextError',
                    title: 'REST Context Create',
                    message: 'Error creating REST context:',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
                });

                
            })
        );
    }

    doUpdateRESTContext(event:RESTContextDialogResult){
        this._subHandler.add(
            this.restCatalogService.updateRESTContext(event.domain, event.application, event.name, event.url).subscribe( (results)=> {

                this.logger.info(LOG_TAG , 'REST context updated:', results);
                this.notificationCenter.post({
                    name: 'UpdateRESTContext',
                    title: 'REST Context Update',
                    message: 'REST Context updated successfully.',
                    type: NotificationType.Success
                });
                this.restCatalogSelector.reloadData();

                
            }, (error) => {

                this.logger.error(LOG_TAG, 'Update REST Context error:', error);
                this.notificationCenter.post({
                    name: 'UpdateRESTContextError',
                    title: 'REST Context Update',
                    message: 'Error updating REST context:',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
                });

                
            })
        );
    }

    onDialogConfirmation(event:RESTContextDialogResult){
        if (event.dialogMode===DialogMode.New){
            this.doCreateRESTContext(event);
        } else if (event.dialogMode===DialogMode.Edit) {
            this.doUpdateRESTContext(event);
        }
    }

}   
