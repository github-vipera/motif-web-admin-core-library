import { WCGridEditorCommandComponentEvent, WCConfirmationTitleProvider, WCGridEditorCommandsConfig } from 'web-console-ui-kit';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import * as _ from 'lodash';
import { fas, faCoffee, faAdjust, faBatteryHalf, faEye, faEyeSlash,
    faCircleNotch, faMobile, faMobileAlt, faDownload, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { AssetsService, AssetBundleEntity, AssetBundleUpdate } from '@wa-motif-open-api/app-content-service';
import { MobileApplicaton } from '../../../data/model';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { Observable } from 'rxjs/Observable';
import { DataResult } from '@progress/kendo-data-query';
import { DomainSelectorComboBoxComponent } from '../../../../../components/UI/selectors/domain-selector-combobox-component';
import { WCEditService, WCEditServiceConfiguration } from 'web-console-ui-kit';
import { Domain } from '@wa-motif-open-api/platform-service';
import { map } from 'rxjs/operators/map';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ConfirmationDialogComponent } from '../../../../../components/ConfirmationDialog/confirmation-dialog-component';
import { saveAs } from '@progress/kendo-file-saver';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { WCSubscriptionHandler } from '../../../../../components/Commons/wc-subscription-handler';
import { WCUploadPanelEvent } from 'projects/motif-web-admin-core/src/lib/components';


const LOG_TAG = '[AssetsAppContentSection]';

@Component({
    selector: 'wa-assets-appcontent-tab-component',
    styleUrls: ['./assets-appcontent-tab-component.scss'],
    templateUrl: './assets-appcontent-tab-component.html'
})
export class AssetsTabComponent implements OnInit, OnDestroy {

    faEyeSlash = faEyeSlash;
    faEye = faEye;
    faCloudUploadAlt = faCloudUploadAlt;
    faDownload = faDownload;
    faMobile = faMobile;
    faMobileAlt = faMobileAlt;
    faCoffee = faCoffee;
    faAdjust = faAdjust;
    faBatteryHalf = faBatteryHalf;
    faCircleNotch = faCircleNotch;
    fas = fas;

    publishConfirmationTitleProvider: WCConfirmationTitleProvider = {
        getTitle(rowData): string {
            if (rowData.published){
                return "Unpublish ?";
            } else {
                return "Publish ?";
            }
        }
    }

    commands: WCGridEditorCommandsConfig = [
        { 
            commandIcon: 'assets/img/icons.svg#ico-publish',
            commandId: 'cmdPublish',
            title: 'Publish/Unpublish',
            hasConfirmation: true,
            confirmationTitle: 'Publish ?',
            confirmationTitleProvider: this.publishConfirmationTitleProvider
        },
        { 
            commandIcon: 'assets/img/icons.svg#ico-download',
            commandId: 'cmdDownload',
            title: 'Download'
        },
        { 
            commandIcon: 'assets/img/icons.svg#ico-no',
            commandId: 'cmdDelete',
            title: 'Delete',
            hasConfirmation: true,
            confirmationTitle: 'Delete ?' 
        }
    ];


    public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 10
    };
    public changes: any = {};
    public editDataItem: MobileApplicaton;

    public gridView: DataResult;
    public loading: boolean;

    @ViewChild('domainSelector') domainSelector: DomainSelectorComboBoxComponent;
    @ViewChild(ConfirmationDialogComponent) confirmationDialog: ConfirmationDialogComponent;

    private _editServiceConfig: WCEditServiceConfiguration = { idField: 'name', dirtyField: 'dirty', isNewField: 'isNew' };
    public editService: WCEditService;
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    // Buttons
    public canRefresh = false;
    public canAddBundle = false;

    constructor(private logger: NGXLogger,
        private notificationCenter: WCNotificationCenter,
        private assetsService: AssetsService,
        private renderer2: Renderer2) {
        this.logger.debug(LOG_TAG, 'Opening...');
        this.editService = new WCEditService();
        this.editService.init();
        this.logger.debug(LOG_TAG, 'Opening...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
        this.view = this.editService.pipe(map(data => process(data, this.gridState)));
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.gridView = null;
        this.view = null;
        this._editServiceConfig = null;
        this.editService = null;
        this.editDataItem = null;
        this.changes = null;
        this.gridState = null;
        this.editDataItem = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    /**
     * Triggered by the grid component
     * @param state
     */
    public onStateChange(state: State) {
        this.gridState = state;
        this.logger.debug(LOG_TAG, 'onStateChange: ', state);
    }

    public onDomainSelected(domain: Domain) {
        if (domain) {
            this.loadData(domain);
            this.setOptions(true, true, true, true);
        } else {
            this.editService.read([], this._editServiceConfig);
            this.setOptions(false, false, true, false);
        }
    }

    public loadData(domain: Domain): void {
        this.loading = true;
        this._subHandler.add(this.assetsService.getAssets(this.domainSelector.selectedDomain.name).subscribe((data) => {
            this.logger.debug(LOG_TAG, 'Assets for domain=' + domain.name + ': ', data);

            data = _.forEach(data, function (element) {
                if (element.created) {
                    element.created = new Date(element.created);
                }
            });

            this.editService.cancelChanges();
            this.editService.read(data, this._editServiceConfig);
            this.loading = false;
        }, (error) => {
            this.logger.error(LOG_TAG, 'Load Assets for domain=' + domain.name + ' error: ', error);

            this.notificationCenter.post({
                name: 'GetAssestsError',
                title: 'Get Assets',
                message: 'Error getting assets:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

            this.loading = false;
        }));

        this.setOptions(true, true, true, true);
    }

    /**
      * Enable or disable buttons
      * @param canSave
      * @param canRefresh
      * @param canExport
      * @param canAddBundle
      */
    private setOptions(canSave: boolean, canRefresh: boolean, canExport: boolean, canAddBundle: boolean): void {
        this.canRefresh = canRefresh;
        this.canAddBundle = canAddBundle;
    }

    /**
    * Button event
    */
    public onRefreshClicked(): void {
        if (this.editService.hasChanges()) {
            this.confirmationDialog.open('Pending Changes',
                // tslint:disable-next-line:max-line-length
                'Attention, in the configuration there are unsaved changes. Proceeding with the refresh these changes will be lost. Do you want to continue?',
                { 'action': 'refresh' });
        } else {
            this.refreshData();
        }
    }

    public refreshData() {
        if (this.domainSelector.selectedDomain) {
            this.loadData(this.domainSelector.selectedDomain);
        }
    }

    public onDeleteOKPressed(assetBundle: AssetBundleEntity) {
        this.logger.debug(LOG_TAG, 'onDeleteOKPressed for item: ', assetBundle);
        this.editService.remove(assetBundle);
    }

    onUploadError(error){
        this.notificationCenter.post({
            name: 'UploadBundleErorr',
            title: 'Upload Bundle',
            message: 'Error uploading bundle:',
            type: NotificationType.Error,
            error: error,
            closable: true
        });
    }

    /**
     * Event emitted by the confirmation dialog
     * @param userData
     */
    onConfirmationOK(userData): void {
        this.logger.debug(LOG_TAG, 'onConfirmationOK for:', userData);

        if (userData && userData.action === 'refresh') {
            this.refreshData();
        }
        if (userData && userData.action === 'discardChanges') {
            this.editService.cancelChanges();
        }
    }

    /**
     * Button event
     */
    onSaveClicked(): void {
        this.logger.debug(LOG_TAG, 'onSaveClicked');

        this._subHandler.add(this.saveAllChanges().subscribe((responses) => {
            this.refreshData();
            this.logger.debug(LOG_TAG, 'Bundles updated successfully: ', responses);

            this.notificationCenter.post({
                name: 'UpdateBundleSuccess',
                title: 'Update Bundle',
                message: 'The bundle list has been successfully updated.',
                type: NotificationType.Success
            });

        }, (error) => {
            this.logger.debug(LOG_TAG, 'Error saving bundles: ', error);

            this.notificationCenter.post({
                name: 'UpdateBundleError',
                title: 'Update Bundle',
                message: 'Error updating bundle list:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));

    }

    /**
 * Save all pending chenges remotely
 */
    private saveAllChanges(): Observable<any[]> {
        this.logger.debug(LOG_TAG, 'Saving all changes...');

        const itemsToRemove = this.editService.deletedItems;

        this.logger.debug(LOG_TAG, 'To remove:', itemsToRemove);

        const responses = [];
        let i = 0;

        // Remove deleted
        for (i = 0; i < itemsToRemove.length; i++) {
            const assetsToDelete = itemsToRemove[i];
            this.logger.debug(LOG_TAG, 'Removing assets: ', this.domainSelector.selectedDomain.name,
            assetsToDelete.name, assetsToDelete.version);
            // tslint:disable-next-line:max-line-length
            const response = this.assetsService.deleteAsset(this.domainSelector.selectedDomain.name,
                assetsToDelete.name, assetsToDelete.version);
            responses.push(response);
        }

        this.logger.debug(LOG_TAG, 'Waiting for all changes commit.');
        return forkJoin(responses);

    }

    /**
     * Button Event
     */
    onDiscardClicked(): void {
        if (this.editService.hasChanges()) {
            this.confirmationDialog.open('Pending Changes',
                // tslint:disable-next-line:max-line-length
                'Attention, in the configuration there are unsaved changes. Proceeding all these changes will be lost. Do you want to continue?',
                { 'action': 'discardChanges' });
        } else {
            this.refreshData();
        }
    }

    uploadAssetBundle(event: WCUploadPanelEvent): void {
        this.logger.debug(LOG_TAG, 'uploadAssetBundle : ', event);

        this.notificationCenter.post({
            name: 'UploadAssetBundleProgress',
            title: 'Upload Asset Bundle',
            message: 'Uploading the asset bundle...',
            type: NotificationType.Info
        });

        this._subHandler.add(this.assetsService.uploadAsset(this.domainSelector.selectedDomain.name, event.file).subscribe((event) => {
            this.refreshData();
            this.logger.debug(LOG_TAG, 'Asset Bundle uploaded successfully: ', event);

            this.notificationCenter.post({
                name: 'UploadAssetBundleSuccess',
                title: 'Upload Asset Bundle',
                message: 'The asset bundle has been successfully uploaded.',
                type: NotificationType.Success
            });

        }, (error) => {
            this.logger.debug(LOG_TAG, 'Error uploading asset bundle: ', error);

            this.notificationCenter.post({
                name: 'UploadAssetBundleError',
                title: 'Upload Asset Bundle',
                message: 'Error uploading asset bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    onPublishClicked(dataItem) {
        this.logger.debug(LOG_TAG, 'onPublishClicked: ', dataItem);
        this.doPublishAssetsBundle(dataItem);
    }

    onDownloadClicked(dataItem) {
        this.doDownloadAssetsBundle(dataItem);
    }

    private doDeleteAssetBundle(dataItem): void {
        this._subHandler.add(this.assetsService.deleteAsset(this.domainSelector.selectedDomain.name, dataItem.name, dataItem.version).subscribe( (data)=> {

            this.logger.debug(LOG_TAG, 'Asset deleted successfully: ', data);
            this.notificationCenter.post({
                name: 'DeleteAssetBundleSuccess',
                title: 'Delete Asset Bundle',
                message: 'The asset bundle has been successfully deleted.',
                type: NotificationType.Success
            });

            this.refreshData();

        }, (error) => {
            this.logger.debug(LOG_TAG, 'Error deleting asset bundle: ', error);
            this.notificationCenter.post({
                name: 'DeleteAssetBundleError',
                title: 'Delete Asset Bundle',
                message: 'Error deleting asset bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    private doDownloadAssetsBundle(dataItem): void {
        this.logger.debug(LOG_TAG, 'doDownloadAssetsBundle: ', dataItem);

        this.notificationCenter.post({
            name: 'DownloadAssetBundleProgress',
            title: 'Download Asset Bundle',
            message: 'Downloading the assets bundle...',
            type: NotificationType.Info
        });

        this._subHandler.add(this.assetsService.downloadAsset(
            this.domainSelector.selectedDomain.name, dataItem.name, dataItem.version).subscribe((data) => {
            this.logger.debug(LOG_TAG, 'Asset downloaded successfully: ', data);

            const blob = new Blob([data], { type: 'application/zip' });

            const fileName = dataItem.name + '.zip';
            saveAs(blob, fileName);
            // FileSaver.saveAs(blob, fileName);
            this.logger.debug(LOG_TAG, 'Log saved: ', fileName);

            this.notificationCenter.post({
                name: 'DownloadAssetBundleSuccess',
                title: 'Download Asset Bundle',
                message: 'The asset bundle has been successfully downloaded.',
                type: NotificationType.Success
            });

        }, (error) => {

            this.logger.debug(LOG_TAG, 'Error downloading asset bundle: ', error);

            this.notificationCenter.post({
                name: 'DownloadAssetBundleError',
                title: 'Download Asset Bundle',
                message: 'Error downloading asset bundle:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    private doPublishAssetsBundle(dataItem): void {
        this.logger.debug(LOG_TAG, 'doPublishAssetsBundle: ', dataItem);

        const isPublishing = !dataItem.published;

        let message = 'Publishing the assets bundle...';
        let title = 'Publish Asset Bundle';
        if (!isPublishing) {
            message = 'Unpublishing the assets bundle...';
            title = 'Unpublish Asset Bundle';
        }

        this.notificationCenter.post({
            name: 'PublishAssetBundleProgress',
            title: title,
            message: message,
            type: NotificationType.Info
        });

        const bundleUpdate: AssetBundleUpdate = {
            published: !dataItem.published
        };

        this._subHandler.add(this.assetsService.updateAsset(this.domainSelector.selectedDomain.name,
             dataItem.name, dataItem.version, bundleUpdate).subscribe((data) => {
            this.logger.debug(LOG_TAG, 'Asset published successfully: ', data);

            this.refreshData();

            let message = 'The asset bundle has been successfully published.';
            let title = 'Publish Asset Bundle';
            if (!isPublishing) {
                message = 'The asset bundle has been successfully unpublished.';
                title = 'Unpublish Asset Bundle';
            }
            
            this.notificationCenter.post({
                name: 'PublishAssetBundleSuccess',
                title: title,
                message: message,
                type: NotificationType.Success
            });

        }, (error) => {

            let portion = 'publishing';
            let message = 'Error publishing asset bundle:';
            let title = 'Publish Asset Bundle';
            if (!isPublishing) {
                message = 'Error unpublishing asset bundle:';
                title = 'Unpublish Asset Bundle';
                portion = 'unpublishing';
            }
 
            this.logger.debug(LOG_TAG, 'Error ' + portion +' asset bundle: ', error);

            this.notificationCenter.post({
                name: 'PublishAssetBundleError',
                title: title,
                message: message,
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    onCommandConfirm(event: WCGridEditorCommandComponentEvent) {
        this.logger.debug(LOG_TAG, 'onCommandConfirm event: ', event);
        if (event.id==='cmdPublish'){
            this.doPublishAssetsBundle(event.rowData.dataItem);
        }
        else if (event.id==='cmdDelete'){
            this.doDeleteAssetBundle(event.rowData.dataItem);
        }
    }

    onCommandClick(event: WCGridEditorCommandComponentEvent){
        this.logger.debug(LOG_TAG, 'onCommandClick event: ', event);
        if (event.id==='cmdDownload'){
            this.doDownloadAssetsBundle(event.rowData.dataItem);
        }
        else if (event.id==='cmdDelete'){
            this.doDeleteAssetBundle(event.rowData.dataItem);
        }
    }

    onConfirmationCancel(event){
        //nop
    }
}
