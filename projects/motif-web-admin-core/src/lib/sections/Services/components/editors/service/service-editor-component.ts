import { Component, OnInit, EventEmitter, ViewChild, Output, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { WCPropertyEditorModel, WCPropertyEditorItemType, WCPropertyEditorItem,  MinitButtonClickEvent } from 'web-console-ui-kit';
import { EditorPropertyChangeEvent } from '../commons/editors-events';
import { BaseEditorComponent } from '../base-editor-component';
import { Observable } from 'rxjs';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { EditorContext } from '../service-catalog-editor-context';
import { ServicesService, Service, ServiceUpdate } from '@wa-motif-open-api/catalog-service';
import { MessageCategoriesDialogComponent } from '../../dialogs/message-categories/message-categories-dialog'
import { SystemService, SystemCategoriesList } from '@wa-motif-open-api/platform-service';
import { WCSubscriptionHandler } from '../../../../../components/Commons/wc-subscription-handler';

const LOG_TAG = '[ServicesSectionServiceEditor]';

@Component({
    selector: 'wa-services-service-editor',
    styleUrls: ['./service-editor-component.scss'],
    templateUrl: './service-editor-component.html'
})
export class ServiceEditorComponent extends BaseEditorComponent implements OnInit, OnDestroy {

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    @ViewChild('offlineMessagesDialog') offlineMessagesDialog: MessageCategoriesDialogComponent;

    @Output() propertyChange: EventEmitter<EditorPropertyChangeEvent> = new EventEmitter();

    private _currentService: Service;

    public offlineMessages: string[] = [];

    public serviceModel: WCPropertyEditorModel = {
        items: [
          {
            name: 'Online',
            field: 'enabled',
            type: WCPropertyEditorItemType.Boolean,
            value: true
          },
          {
            name: 'Offline Message',
            field: 'category',
            type: WCPropertyEditorItemType.List,
            value: '',
            listValues: [],
            disabled: true,
            miniCommand: true,
            miniCommandCaption: 'Setup...'
          },
          {
            name: 'Counters Plugin',
            field: 'countersPlugin',
            type: WCPropertyEditorItemType.String,
            value: '',
            disabled: false
          },
          {
            name: 'Threshold Checks Plugin',
            field: 'thresholdChecksPlugin',
            type: WCPropertyEditorItemType.String,
            value: '',
            disabled: false
          },
          {
            name: 'Threshold Actions Plugin',
            field: 'thresholdActionsPlugin',
            type: WCPropertyEditorItemType.String,
            value: '',
            disabled: false
          }
        ]
      };

      constructor(public logger: NGXLogger,
        private servicesService: ServicesService,
        public notificationCenter: WCNotificationCenter,
        private systemService: SystemService) {
          super(logger, notificationCenter);
          this.setModel(this.serviceModel);
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
        this.offlineMessages = null;
        this._currentService = null;
        this.serviceModel = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }


    onMiniButtonClick(event: MinitButtonClickEvent): void {
      this.logger.debug(LOG_TAG, 'onMiniButtonClick:', event);
      this.offlineMessagesDialog.show(this.editorContext.domainName);
    }

    reloadCategories() {
      this._subHandler.add(this.systemService.getSystemCategories(
        this.editorContext.domainName).subscribe( (data: SystemCategoriesList) => {
        const categories = [];
        for (let i = 0; i < data.length; i++){
          categories.push(data[i].name);
        }
        this.getPropertyItem('category').listValues = categories;
      }, (error) => {
        this.logger.error(LOG_TAG, 'doRefreshData get category list error:', error);
      }));
    }

    doRefreshData(editorContext: EditorContext): Observable<any> {
      this.reloadCategories();

      return this.refreshServiceInfo(editorContext.domainName,
        editorContext.applicationName,
        editorContext.serviceName,
        editorContext.channel);
    }

    doSaveChanges(editorContext: EditorContext): Observable<any> {
      return new Observable((observer) => {

        this.logger.debug(LOG_TAG, 'Saving changes on service: ', this.editorContext);

        const updatedOperation = this.fromModel();

        const serviceUpdate: ServiceUpdate = this.fromModel();

        this.logger.debug(LOG_TAG, 'operation update: ', serviceUpdate);
        this._subHandler.add(this.servicesService.updateService(this.editorContext.channel,
          this.editorContext.domainName,
          this.editorContext.applicationName,
          this.editorContext.serviceName, serviceUpdate).subscribe( (data) => {

            this.logger.debug(LOG_TAG, 'Service updated: ', this.editorContext, data);

            this.notificationCenter.post({
                name: 'SaveServiceConfig',
                title: 'Save Service Configuration',
                message: 'Service configuration changed successfully.',
                type: NotificationType.Success
            });

            this.commitAllChanges();

            observer.next({});
            observer.complete();

        }, (error) => {

          this.logger.error(LOG_TAG , 'Service config update error: ', error);

          this.notificationCenter.post({
              name: 'SaveServiceConfigError',
              title: 'Save Service Configuration',
              message: 'Error saving service configuration:',
              type: NotificationType.Error,
              error: error,
              closable: true
          });

          observer.error(error);

        }));

      });
    }

    private refreshServiceInfo(domainName: string, applicationName: string, serviceName: string, channel: string): Observable<any> {
      return new Observable((observer) => {

        this.logger.debug(LOG_TAG, 'refreshServiceInfo for ', domainName, applicationName, serviceName, channel);

        this._subHandler.add(this.servicesService.getService(channel, 
          domainName, applicationName, serviceName).subscribe((service: Service) => {

          this._currentService = service;

          this.toModel(service);

          this.logger.debug(LOG_TAG, 'Current service: ', this._currentService);

          observer.next(null);
          observer.complete();

        }, (error) => {

          this.logger.error(LOG_TAG , 'Get Applcation error: ', error);

              this.notificationCenter.post({
                  name: 'LoadServiceConfigError',
                  title: 'Load Service Configuration',
                  message: 'Error loading service configuration:',
                  type: NotificationType.Error,
                  error: error,
                  closable: true
              });

              observer.error(error);

        }));

      });
    }

    private fromModel(): ServiceUpdate {
      this.logger.debug(LOG_TAG, 'fromModel called.');

      const serviceUpdate: ServiceUpdate = {
        enabled: this.getPropertyItem('enabled').value,
        systemCategory: this.getPropertyItem('category').value,
        countersPlugin: this.getPropertyItem('countersPlugin').value,
        thresholdActionsPlugin: this.getPropertyItem('thresholdActionsPlugin').value,
        thresholdChecksPlugin: this.getPropertyItem('thresholdChecksPlugin').value
      };

      this.logger.trace(LOG_TAG, 'fromModel serviceUpdate:', serviceUpdate);

      return serviceUpdate;
    }

    private toModel(service: Service): void {
      this.applyValueToModel('enabled', service.enabled);
      this.applyValueToModel('category', service.category);
      this.applyValueToModel('countersPlugin', service.countersPlugin);
      this.applyValueToModel('thresholdActionsPlugin', service.thresholdActionsPlugin);
      this.applyValueToModel('thresholdChecksPlugin', service.thresholdChecksPlugin);
      this.getPropertyItem('category').disabled = service.enabled;
    }

    onPropertyChanged(event): any {
      this.logger.debug(LOG_TAG, 'onPropertyChanged:', event);
      if ( event.item.field === 'enabled' ) {
        this.handleOfflineProperties(event.newValue);
      }
    }

    private handleOfflineProperties(enabled: boolean) {
      this.getPropertyItem('category').disabled = enabled;
    }

    onCategorySelected(categoryName: string) {
      this.logger.debug(LOG_TAG, 'onCategorySelected:', categoryName);
      this.reloadCategories();
      this.getPropertyItem('category').value = categoryName;
    }

}
