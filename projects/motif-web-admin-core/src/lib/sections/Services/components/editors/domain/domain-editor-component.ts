import { Component, OnInit, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { WCPropertyEditorModel, WCPropertyEditorItemType, WCPropertyEditorItem } from 'web-console-ui-kit';
import { DomainsService, Domain } from '@wa-motif-open-api/platform-service';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { EditorContext } from '../service-catalog-editor-context';
import { BaseEditorComponent } from '../base-editor-component';
import { Observable } from 'rxjs';
import { WCSubscriptionHandler } from '../../../../../components/Commons/wc-subscription-handler';

const LOG_TAG = '[ServicesSectionDomainEditor]';

@Component({
    selector: 'wa-services-domain-editor',
    styleUrls: ['./domain-editor-component.scss'],
    templateUrl: './domain-editor-component.html'
})
export class DomainEditorComponent extends BaseEditorComponent implements OnInit, OnDestroy {

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    public domainModel: WCPropertyEditorModel = {
        items: [
          {
            name: 'Description',
            field: 'description',
            type: WCPropertyEditorItemType.String,
            value: ''
          }
        ]
    };

    private _currentDomain: Domain;

    constructor(public logger: NGXLogger,
        public domainService: DomainsService,
        public notificationCenter: WCNotificationCenter) {
            super(logger, notificationCenter);
            this.setModel(this.domainModel);
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy');
        this.freeMem();
      }

    freeMem() {
        this.domainModel = null;
        this._currentDomain = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    doRefreshData(editorContext: EditorContext): Observable<any> {
        return this.refreshDomainInfo(editorContext.domainName);
    }

    doSaveChanges(editorContext: EditorContext): Observable<any> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'Saving changes on domain: ', this._currentDomain.name);

            const propertyItem: WCPropertyEditorItem = this.getPropertyItem('description');

            this._subHandler.add(this.domainService.updateDomain(this._currentDomain.name,
                    { 'description' : propertyItem.value }).subscribe((data) => {

                        this.logger.debug(LOG_TAG, 'Current domain: ', this._currentDomain);

                        this.notificationCenter.post({
                            name: 'SaveDomainConfig',
                            title: 'Save Domain Configuration',
                            message: 'Domain configuration changed successfully.',
                            type: NotificationType.Success
                        });

                        observer.next({});
                        observer.complete();

            }, (error) => {

                this.logger.error(LOG_TAG , 'setDomain error: ', error);

                this.notificationCenter.post({
                    name: 'SaveDomainConfigError',
                    title: 'Save Domain Configuration',
                    message: 'Error saving domain configuration:',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
                });

                observer.error(error);

            }));
        });

    }

    private refreshDomainInfo(domainName: string) {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'Selected domain: ', domainName);
            this._subHandler.add(this.domainService.getDomain(domainName).subscribe((domain: Domain) => {
                this._currentDomain = domain;
                this.propertyModel = {
                    items: [
                        {
                            name: 'Description',
                            field: 'description',
                            type: WCPropertyEditorItemType.String,
                            value: domain.description
                        }
                    ]
                };
                this.logger.debug(LOG_TAG, 'Current domain: ', this._currentDomain);

                observer.next(null);
                observer.complete();

            }, (error) => {

                this.logger.error(LOG_TAG , 'setDomain error: ', error);

                this.notificationCenter.post({
                    name: 'LoadDomainConfigError',
                    title: 'Load Domain Configuration',
                    message: 'Error loading domain configuration:',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
                });

                observer.error(error);

            }));

        });
    }


}
