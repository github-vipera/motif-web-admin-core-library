import { Component, OnInit, ViewChild, Renderer, ElementRef, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { LicenseService, License } from '@wa-motif-open-api/license-management-service';
import * as _ from 'lodash';
import { faFileImport, faDownload } from '@fortawesome/free-solid-svg-icons';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';
import { WCUploadPanelEvent } from '../../../components/UI/wc-upload-panel-component/wc-upload-panel-component';

const LOG_TAG = '[LicenseManagerSection]';

@Component({
    selector: 'wa-license-manager-section',
    styleUrls: [ './license-manager-section-component.scss' ],
    templateUrl: './license-manager-section-component.html'
  })
  @PluginView('License Manager', {
    iconName: 'wa-ico-key',
    userData: {
        acl: {
            permissions: ['com.vipera.osgi.foundation.license.api.rest.LicensesApi:READ:listLicenses']
        }
    }
})
export class LicenseManagerSectionComponent implements OnInit, OnDestroy {

    faFileImport = faFileImport;
    faDownload = faDownload;

    public _licenses: Array<License> = [];
    public loading: boolean;

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    constructor(private logger: NGXLogger,
        private licenseManager: LicenseService,
        private renderer: Renderer,
        private notificationCenter: WCNotificationCenter) {
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
        this._licenses = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    onSelectionChange(event){
        console.log(">>>>>>>>>>> onSelectionChange");
    }

    public refreshData(): void {
        this.loading = true;
        this._subHandler.add(this.licenseManager.listLicenses().subscribe((data) => {
            this._licenses = data;

            this._licenses = _.forEach(data, function(element) {
                element.issueDate = new Date(element.issueDate);
                element.expiryDate = new Date(element.expiryDate);
              });


            this.logger.debug(LOG_TAG , 'Licenses: ', data);
            this.loading = false;

        }, (error => {
            this.logger.error(LOG_TAG , 'Licenses error: ', error);
            this.loading = false;
            this.notificationCenter.post({
                name: 'LoadLicenseError',
                title: 'Load Licenses',
                message: 'Error loading licenses:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        })));
    }

    public onRefreshClicked(): void {
        this.refreshData();
    }

    public onDeleteOKPressed(license: License): void {
        this.deleteLicense(license);
    }

    private deleteLicense(license: License): void {
        this.logger.debug(LOG_TAG , 'Revoking license: ', license);
        this._subHandler.add(this.licenseManager.deleteLicense(license.productName, license.productVersion).subscribe((data) => {
            this.logger.info(LOG_TAG , 'License revoke success:', data);
            this.notificationCenter.post({
                name: 'RevokeLicenseSuccess',
                title: 'Revoke License',
                message: 'The license has been successfully revoked',
                type: NotificationType.Success
            });

            this.refreshData();
          }, (error) => {
            this.logger.error(LOG_TAG, 'Revoking license error:', error);
            this.notificationCenter.post({
                name: 'RevokeLicenseError',
                title: 'Revoke License',
                message: 'Error revoking license:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    onUploadError(error){
        this.notificationCenter.post({
            name: 'UploadLicenseError',
            title: 'License Upload',
            message: 'Error uploading license:',
            type: NotificationType.Error,
            error: error,
            closable: true
        });
    }


    /**
     * Upload the blob file to server
     * @param blob
     */
    uploadLicense(event: WCUploadPanelEvent): void {
        this.logger.debug(LOG_TAG , 'uploadLicense called');
        this.notificationCenter.post({
            name: 'UploadLicense',
            title: 'License Upload',
            message: 'Uploading license...',
            type: NotificationType.Info
        });
        this._subHandler.add(this.licenseManager.uploadLicense(event.file).subscribe((data) => {
            this.logger.info(LOG_TAG , 'Import license done:', data);
            this.notificationCenter.post({
                name: 'UploadLicense',
                title: 'License Upload',
                message: 'License Uploaded successfully.',
                type: NotificationType.Success
            });
            this.refreshData();
          }, (error) => {
            this.logger.error(LOG_TAG, 'Import license error:', error);
            this.notificationCenter.post({
                name: 'UploadLicenseError',
                title: 'License Upload',
                message: 'Error uploading licenses:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

}
