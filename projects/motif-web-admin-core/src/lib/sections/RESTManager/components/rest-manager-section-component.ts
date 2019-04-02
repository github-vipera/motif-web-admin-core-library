import { Observable } from 'rxjs';
import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { RESTCatalogComponent, RESTCatalogNodeSelectionEvent, GridCommandType, RESTCatalogNodeCommandEvent } from './rest-catalog-component/rest-catalog-component';
import { RESTCatalogEditorComponent } from './rest-catalog-editor/rest-catalog-editor-component';
import { RESTContextDialogComponent, RESTContextDialogResult, DialogMode } from './dialogs/new-context-dialog/rest-context-dialog-component';
import { RESTContextCatalogService } from '../../../services';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { WCStatsInfoModel } from '../../../components/Stats/stats-info-component';

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

    statsModel: WCStatsInfoModel = { items: [] };

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

    private clearStatsInfo(){
        this.statsModel = { items: [] };
    }

    private rebuildStatsInfo(){
        const totalContexts = this.restCatalogSelector.tableModel.getContextsCount();
        const enabledContexts = this.restCatalogSelector.tableModel.getEnabledContextsCount();
        const disabledContexts = this.restCatalogSelector.tableModel.getDisabledContextsCount();
        this.statsModel = { 
            items: [
                { label: "active", value: ""+totalContexts, cssClass:"stats-info-primary" },
                { label: "enabled", value: ""+enabledContexts, cssClass:"stats-info-ok" },
                { label: "disabled", value: ""+disabledContexts, cssClass:"stats-info-ko" }
            ]
        } 
    }

    onCatalogDataReload(event) {
        this.rebuildStatsInfo();
    }

    onCatalogDataReloadError(event){
        this.clearStatsInfo();
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
            this.restCatalogService.updateRESTContext(event.domain, event.application, event.name, event.url, event.enabled).subscribe( (results)=> {

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

    doToggleContextStatus(domain:string, application: string, contextName:string, url:string, enabled:boolean){
        this.logger.debug(LOG_TAG, 'doToggleContextStatus : ', domain, application, contextName, url, enabled);
        this._subHandler.add(
            this.restCatalogService.updateRESTContext(domain, application, name, url, enabled).subscribe((result)=>{

                this.logger.info(LOG_TAG , 'REST context status change:', result);
                this.notificationCenter.post({
                    name: 'ChangeStatusRESTContext',
                    title: 'Change REST Context Status',
                    message: 'REST Context status changed successfully.',
                    type: NotificationType.Success
                });
                this.restCatalogSelector.reloadData();


            }, (error)=>{
                this.logger.error(LOG_TAG, 'Changin REST Context status error:', error);
                this.notificationCenter.post({
                    name: 'ChangeStatusRESTContextError',
                    title: 'Change REST Context Status',
                    message: 'Error changing REST context status: ',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
                });
            })
        );    
    }

    doDeleteContext(domain:string, application: string, contextName:string){
        this.logger.debug(LOG_TAG, 'deleteContext : ', domain, application, contextName);
        this._subHandler.add(
            this.restCatalogService.deleteRESTContext(domain, application, name).subscribe((result)=>{

                this.logger.info(LOG_TAG , 'REST context deleted:', result);
                this.notificationCenter.post({
                    name: 'DeleteRESTContext',
                    title: 'Delete REST Context',
                    message: 'REST Context deleted successfully.',
                    type: NotificationType.Success
                });
                this.restCatalogSelector.reloadData();


            }, (error)=>{
                this.logger.error(LOG_TAG, 'Deleting REST Context error:', error);
                this.notificationCenter.post({
                    name: 'DeleteRESTContextError',
                    title: 'Delete REST Context',
                    message: 'Error deleting REST context:',
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

    onNodeCommand(command:RESTCatalogNodeCommandEvent){
        this.logger.error(LOG_TAG, 'onNodeCommand:', command);
        if (command.command===GridCommandType.Delete){
            this.doDeleteContext(command.node.domain, command.node.application, command.node.name);
        } else if (command.command===GridCommandType.Edit){
            this.contextEditDialog.showForEdit(command.node.domain, 
                command.node.application, 
                command.node.name, command.node.url, command.node["enabled"]);
        } else if (command.command===GridCommandType.PublishToggle){
            this.doToggleContextStatus(command.node.domain, command.node.application, command.node.name, command.node.url, !command.node["enabled"]);
        }
    }

}   