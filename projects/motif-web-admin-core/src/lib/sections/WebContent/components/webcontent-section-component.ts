import { WCGridEditorCommandsConfig, WCConfirmationTitleProvider, WCGridEditorCommandComponentEvent } from 'web-console-ui-kit';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { BundlesService, BundleStatus, ClusterBundleStatus, Bundle, BundleUpdate } from '@wa-motif-open-api/web-content-service';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';
import * as _ from 'lodash';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { WebContentUpdateDialogComponent, UpdateDialogResult } from './dialog/webcontent-update-dialog';
import { WCUploadPanelEvent } from '../../../components/UI/wc-upload-panel-component/wc-upload-panel-component';
import { WCStatsInfoModel } from '../../../components/Stats/stats-info-component';
import { UpdatePoller, UpdatePollerEvent, UpdatePollerEventStatus } from './update-poller/UpdatePoller';
import { BundleUtils, PublishingStatus } from './BundleUtils';

const LOG_TAG = '[WebContentSectionComponent]';

enum CommandType {
    Edit = 'cmdEdit',
    Download = 'cmdDowload',
    Delete = 'cmdDelete',
    Publish = 'cmdPublish'
}
@Component({
    selector: 'wa-web-content-section',
    styleUrls: [ './webcontent-section-component.scss' ],
    templateUrl: './webcontent-section-component.html'
  })
  @PluginView('WebContent', {
    iconName: 'wa-ico-web',
  })
export class WebContentSectionComponent implements OnInit, OnDestroy {

    statsModel: WCStatsInfoModel = { items: [] };

    faUpload = faUpload;
    gridData: BundleStatus[];

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    @ViewChild('updateDialog') _updateDialog: WebContentUpdateDialogComponent;

    private _pollers : Array<UpdatePoller> = [];

    // Data binding
    public loading = false;

    publishConfirmationTitleProvider: WCConfirmationTitleProvider = {
        getTitle(rowData): string {
            if (rowData.info.syntheticStatus === PublishingStatus.Published){
                return "Unpublish ?";
            } else if (rowData.info.syntheticStatus === PublishingStatus.Error){
                return "Unpublish ?";
            } else {
                return "Publish ?";
            }
        }
    }


    commands: WCGridEditorCommandsConfig = [
        { 
            commandIcon: 'wa-ico-edit',
            commandId: CommandType.Edit,
            title: 'Edit'
        },
        { 
            commandIcon: 'wa-ico-download',
            commandId: CommandType.Download,
            title: 'Download'
        },
        { 
            commandIcon: 'wa-ico-no',
            commandId: CommandType.Delete,
            title: 'Delete',
            hasConfirmation: true,
            confirmationTitle: 'Delete ?' 
        }
    ];


    constructor(private logger: NGXLogger,
        private notificationCenter: WCNotificationCenter,
        private elem: ElementRef,
        private webContentService: BundlesService) {
            this.logger.debug(LOG_TAG , 'Opening...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this.refreshData();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.gridData = null;
        this._subHandler.unsubscribe();
    }

    onRefreshClicked(): void {
        this.refreshData();
    }

    updateModelWith(bundleStatus:BundleStatus){
        let index = _.findIndex(this.gridData, (item:BundleStatus)=>{
            return (item==bundleStatus);
        });
        if (index>=0){
            this.gridData[index] = bundleStatus;
        }
    }

    refreshData(){

        this.logger.debug(LOG_TAG, 'refreshData called.');

        this.loading = true;
        this._subHandler.add(this.webContentService.getBundlesList().subscribe( (data: Array<BundleStatus>) => {
            this.logger.debug(LOG_TAG, 'Get bundle statuses results:', data);

            this.gridData = _.forEach(data, (element: BundleStatus) => {
                element.info["syntheticStatus"] = BundleUtils.buildSyntheticStatus(element);
                element.info["url"] = BundleUtils.buildUrl(element);
            });

            this.logger.debug(LOG_TAG, '*** Get bundle statuses results gridData:', this.gridData);

            this.gridData = data;

            this.logger.debug(LOG_TAG, '*** Get bundle statuses results gridData:', this.gridData);

            this.rebuildStatsInfo();
            this.loading = false;
            
        }, (error) => {
            this.logger.error(LOG_TAG, 'Get bundle statuses failed: ', error);
            this.loading = false;
            this.clearStatsInfo();
            this.notificationCenter.post({
                name: 'GetBundleStatusesError',
                title: 'Get Bundle Statuses',
                message: 'Error getting bundle statuses:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
        
    }

    private clearStatsInfo(){
        this.statsModel = { items: [] };
    }

    private rebuildStatsInfo(){

        const statuses = _.map(this.gridData, 'info.syntheticStatus');

        const total = statuses.length;

        const published = _.countBy(
            statuses,
            (status) => (status === "PUBLISHED")
        );
        
        if (!published){
            published.true = 0;
            published.false = 0;
        }

        if (!published.true){
            published.true = 0;
        }

        if (!published.false){
            published.false = 0;
        }

        this.statsModel = { 
            items: [
                { label: "bundles", value: ""+total, cssClass: "stats-info-primary" },
                { label: "published", value: ""+published.true, cssClass:"stats-info-ok" },
                { label: "unpublished", value: ""+published.false, cssClass:"stats-info-ko" }
            ]
        } 
    }
    

    doTogglePublishBundle(item: BundleStatus):void {
        this.logger.debug(LOG_TAG, 'doTogglePublishBundle: ', item);
        if (item.info["syntheticStatus"] === PublishingStatus.Unpublished){
            this.doPublishBundle(item);
        } else if (item.info["syntheticStatus"] === PublishingStatus.Published){
            this.doUnpublishBundle(item);
        } else if (item.info["syntheticStatus"] === PublishingStatus.Error){
            this.doUnpublishBundle(item);
        }
    }

    doPublishBundle(item: BundleStatus):void {
        this.logger.debug(LOG_TAG, 'doPublishBundle: ', item);
        this._subHandler.add(this.webContentService.publishBundle(item.info.name, item.info.version).subscribe( (data)=> {

            this.logger.debug(LOG_TAG, 'Bundle published successfully: ', data);
            this.refreshData();
            this.notificationCenter.post({
                name: 'PublishBundleSuccess',
                title: 'Publishing Bundle',
                message: 'Bundle publish request sent successfully.',
                type: NotificationType.Info
            });
            
            // Create arefresh poller
            let newPoller = new UpdatePoller(item.info.name, item.info.version, this.webContentService, this.logger);
            this._pollers.push(newPoller);
            newPoller.start(3, 3000, item).subscribe( (results:UpdatePollerEvent) => {
                if (results.status === UpdatePollerEventStatus.Complete){
                    this.updateModelWith(results.bundleStatus);
                }
                let test = _.remove(this._pollers, function(poller: UpdatePoller) {
                    return (results.source===poller);
                });
            });
            

        }, (error)=>{

            this.logger.error(LOG_TAG, 'Download Bundle failed: ', error);
            this.loading = false;

            this.notificationCenter.post({
                name: 'PublishBundleError',
                title: 'Publish Bundle',
                message: 'Error publishing bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    doUnpublishBundle(item: BundleStatus):void {
        this.logger.debug(LOG_TAG, 'doUnpublishBundle: ', item);
        this._subHandler.add(this.webContentService.unpublishBundle(item.info.name, item.info.version).subscribe( (data)=> {

            this.logger.debug(LOG_TAG, 'Bundle unpublished successfully: ', data);
            this.refreshData();
            this.notificationCenter.post({
                name: 'UnpublishBundleSuccess',
                title: 'Unpublish Bundle',
                message: 'Bundle unpublished successfully.',
                type: NotificationType.Info
            });


        }, (error)=>{

            this.logger.error(LOG_TAG, 'Unpublish Bundle failed: ', error);
            this.loading = false;

            this.notificationCenter.post({
                name: 'UnpublishBundleError',
                title: 'Unpublish Bundle',
                message: 'Error unpublishing bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }


    doDownloadBundle(item: BundleStatus):void {

        this.notificationCenter.post({
            name: 'DownloadBundleProgress',
            title: 'Download Bundle',
            message: 'Downloading bundle...',
            type: NotificationType.Info
        });

        this.logger.debug(LOG_TAG, 'doDownloadBundle: ', item);
        this._subHandler.add(this.webContentService.downloadBundle(item.info.name, item.info.version).subscribe( (data :Blob)=> {

            this.logger.debug(LOG_TAG, 'Bundle downloaded successfully: ', data);

            const blob = new Blob([data], { type: 'application/zip' });

            const fileName = item.info.name + '_' + item.info.version + '.zip';
            saveAs(blob, fileName);
            // FileSaver.saveAs(blob, fileName);
            this.logger.debug(LOG_TAG, 'Bundle saved: ', fileName);


        }, (error)=>{

            this.logger.error(LOG_TAG, 'Download Bundle failed: ', error);
            this.loading = false;

            this.notificationCenter.post({
                name: 'DownloadBundleError',
                title: 'Download Bundle',
                message: 'Error downloading bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    doDeleteBundle(item: BundleStatus):void {
        this.logger.debug(LOG_TAG, 'doDeleteBundle: ', item);
        let bundleName = item.info.name;
        let bundleVersion = item.info.version;
        this.logger.debug(LOG_TAG, "doDeleteBundle bundleName='"+bundleName+"' bundleVersion='" + bundleVersion + "'");
        this._subHandler.add(this.webContentService.deleteBundle(bundleName, bundleVersion).subscribe( (data) => {

            this.logger.debug(LOG_TAG, 'Delete Bundle success: ', data);
            this.notificationCenter.post({
                name: 'DeleteBundleSuccess',
                title: 'Delete Bundle',
                message: 'Bundle deleted successfully.',
                type: NotificationType.Info
            });

            this.refreshData();

        }, (error) => {

            this.logger.error(LOG_TAG, 'Delete Bundle failed: ', error);

            this.notificationCenter.post({
                name: 'DeleteBundleError',
                title: 'Delete Bundle',
                message: 'Error deleting bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        })) ;      
    }

    onCommandConfirm(event: WCGridEditorCommandComponentEvent) {
        this.logger.debug(LOG_TAG, 'onCommandConfirm event: ', event);
        if (event.id===CommandType.Publish){
            this.doTogglePublishBundle(event.rowData.dataItem);
        }
        else if (event.id===CommandType.Delete){
            this.doDeleteBundle(event.rowData.dataItem);
        }
    }

    onCommandClick(event: WCGridEditorCommandComponentEvent){
        this.logger.debug(LOG_TAG, 'onCommandClick event: ', event);
        if (event.id===CommandType.Download){
            this.doDownloadBundle(event.rowData.dataItem);
        }
        else if (event.id===CommandType.Delete){
            this.doDeleteBundle(event.rowData.dataItem);
        } else if (event.id===CommandType.Edit){
            this.doEditBundle(event);
        }
    }

    doEditBundle(event: WCGridEditorCommandComponentEvent) {
        this.logger.debug(LOG_TAG, 'doEditBundle : ', event);
        this._updateDialog.show(event.rowData.dataItem.info.name, event.rowData.dataItem.info.version, event.rowData.dataItem.info.domain, event.rowData.dataItem.info.application, event.rowData.dataItem.info.context);
    }

    onUploadError(error){
        this.notificationCenter.post({
            name: 'UploadBundleError',
            title: 'Upload Bundle',
            message: 'Error uploading bundle:',
            type: NotificationType.Error,
            error: error,
            closable: true
        });
    }


    uploadAssetBundle(event: WCUploadPanelEvent): void {
        this.logger.debug(LOG_TAG, 'uploadAssetBundle : ', event);

        this.notificationCenter.post({
            name: 'UploadAssetBundleProgress',
            title: 'Upload Asset Bundle',
            message: 'Uploading the asset bundle...',
            type: NotificationType.Info
        });

        this._subHandler.add(this.webContentService.uploadBundle(event.file).subscribe((event) => {
            this.refreshData();
            this.logger.debug(LOG_TAG, 'Bundle uploaded successfully: ', event);

            this.notificationCenter.post({
                name: 'UploadBundleSuccess',
                title: 'Upload Bundle',
                message: 'The bundle has been successfully uploaded.',
                type: NotificationType.Success
            });

        }, (error) => {
            this.logger.error(LOG_TAG, 'Error uploading bundle: ', error);

            this.notificationCenter.post({
                name: 'UploadBundleError',
                title: 'Upload Bundle',
                message: 'Error uploading bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    onUpdateConfirm(event:UpdateDialogResult){
        this.logger.debug(LOG_TAG, 'onUpdateConfirm: ', event);
        let bundleName = event.bundleName;
        let bundleVersion = event.bundleVersion;
        let bundleUpdate:BundleUpdate = {
            application: event.application,
            context: event.context,
            domain: event.domain
        };
        this.logger.debug(LOG_TAG, 'onUpdateConfirm: ', bundleName, bundleVersion, bundleUpdate);
        this._subHandler.add(this.webContentService.updateBundle(bundleName, bundleVersion, bundleUpdate).subscribe( (data) => {

            this.refreshData();
            this.logger.debug(LOG_TAG, 'Bundle updated successfully: ', event);

            this.notificationCenter.post({
                name: 'UpdateBundleSuccess',
                title: 'Update Bundle',
                message: 'The bundle has been successfully updated.',
                type: NotificationType.Success
            });


        }, (error) => {

            this.logger.error(LOG_TAG, 'Error updating bundle: ', error);

            this.notificationCenter.post({
                name: 'UpdateBundleError',
                title: 'Update Bundle',
                message: 'Error updating bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

}
