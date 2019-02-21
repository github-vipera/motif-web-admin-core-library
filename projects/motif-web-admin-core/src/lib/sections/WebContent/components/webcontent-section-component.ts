import { WCGridEditorCommandsConfig, WCConfirmationTitleProvider, WCGridEditorCommandComponentEvent } from 'web-console-ui-kit';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { BundlesService, BundleStatus, ClusterBundleStatus, Bundle } from '@wa-motif-open-api/web-content-service';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';
import * as _ from 'lodash';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { WebContentUpdateDialogComponent } from './dialog/webcontent-update-dialog';
import { WCUploadPanelEvent } from '../../../components/UI/wc-upload-panel-component/wc-upload-panel-component';

const LOG_TAG = '[WebContentSectionComponent]';

export enum PublishingStatus {
    Published = 'PUBLISHED',
    Unpublished = 'UNPUBLISHED',
    Error = 'IN ERROR'
}

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

    faUpload = faUpload;
    gridData: BundleStatus[];

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    @ViewChild('updateDialog') _updateDialog: WebContentUpdateDialogComponent;

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

    refreshData(){
        
        this.loading = true;
        this._subHandler.add(this.webContentService.getBundlesList().subscribe( (data: Array<BundleStatus>) => {
            this.logger.debug(LOG_TAG, 'Get bundle statuses results:', data);

            this.gridData = _.forEach(data, (element: BundleStatus) => {
                element.info["syntheticStatus"] = this.buildSyntheticStatus(element);
            });


            this.gridData = data;
            this.loading = false;
        }, (error) => {
            this.logger.error(LOG_TAG, 'Get bundle statuses failed: ', error);
            this.loading = false;

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

    
    private buildSyntheticStatus(statusInfo: BundleStatus): string {
        let published: number = 0;  
        let unpusblished: number = 0;  
        for (let i=0;i<statusInfo.status.length;i++){
            const clusterStatus:ClusterBundleStatus = statusInfo.status[i];
            if (clusterStatus.status === PublishingStatus.Unpublished) {
                unpusblished++;
            }
            if (clusterStatus.status === PublishingStatus.Published) {
                published++;
            }
        }
        this.logger.debug(LOG_TAG, 'buildSyntheticStatus (published count vs unpublished count): ', published, unpusblished);
        if ((published===0) && (unpusblished > 0)) {
            return PublishingStatus.Unpublished;
        } else if ((unpusblished===0) && (published > 0)) {
            return PublishingStatus.Published;
        } else {
            return PublishingStatus.Error;
        }
    }
    

    private buildSyntheticStatusXXX(statusInfo: BundleStatus): string {
        return PublishingStatus.Unpublished;
    }

    doTogglePublishBundle(item: BundleStatus):void {
        this.logger.debug(LOG_TAG, 'doTogglePublishBundle: ', item);
        alert("TODO!! doTogglePublishBundle")
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
        alert("TODO!! doDeleteBundle")
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
        this._updateDialog.show('domain', 'app', event.rowData.dataItem.info.context);
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
            this.logger.debug(LOG_TAG, 'Error uploading bundle: ', error);

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

}
