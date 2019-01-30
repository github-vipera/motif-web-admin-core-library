import { Component, OnInit, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { WCPropertyEditorModel, WCPropertyEditorItemType, WCPropertyEditorItem } from 'web-console-ui-kit';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { EditorContext } from '../service-catalog-editor-context';
import { BaseEditorComponent } from '../base-editor-component';
import { Observable } from 'rxjs';
import { OperationsService, ServiceOperation, ServiceOperationProperties } from '@wa-motif-open-api/catalog-service';
import { WCSubscriptionHandler } from '../../../../../components/Commons/wc-subscription-handler';

const LOG_TAG = '[OperationSectionServiceEditor]';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wa-services-operation-editor',
    styleUrls: ['./operation-editor-component.scss'],
    templateUrl: './operation-editor-component.html'
})
export class OperationEditorComponent extends BaseEditorComponent implements OnInit, OnDestroy {

  private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    public operationModel: WCPropertyEditorModel = {
        items: [
          {
            name: 'Description',
            field: 'description',
            type: WCPropertyEditorItemType.String,
            value: ''
          },
          {
            name: 'Plugin Name',
            field: 'pluginName',
            type: WCPropertyEditorItemType.String,
            value: ''
          },
          {
            name: 'Secure',
            field: 'secure',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'Encrypted',
            field: 'encryptActive',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'Counted',
            field: 'counted',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'Session-less',
            field: 'sessionless',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'Input Params (JSON)',
            field: 'inputParams',
            type: WCPropertyEditorItemType.Text,
            value: ''
          },
          {
            name: 'Output Params (JSON)',
            field: 'outputParams',
            type: WCPropertyEditorItemType.Text,
            value: ''
          }
        ]
      };

    constructor(public logger: NGXLogger,
      public operationsService: OperationsService,
      public notificationCenter: WCNotificationCenter) {
          super(logger, notificationCenter);
          this.setModel(this.operationModel);
    }

  private _currentOperation: ServiceOperation;

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
      this.operationModel = null;
      this._currentOperation = null;
      this._subHandler.unsubscribe();
      this._subHandler = null;
  }


  doRefreshData(editorContext: EditorContext): Observable<any> {
    this.logger.debug(LOG_TAG, 'doRefreshData called for context:' , editorContext);
    return this.refreshOperationInfo(editorContext.domainName,
      editorContext.applicationName,
      editorContext.serviceName,
      editorContext.operationName,
      editorContext.channel);
  }

  doSaveChanges(editorContext: EditorContext): Observable<any> {
    return new Observable((observer) => {

      this.logger.debug(LOG_TAG, 'Saving changes on operation: ', this.editorContext);

      const updatedOperation = this.fromModel();

      const properties: ServiceOperationProperties = this.fromModel();

      this.logger.debug(LOG_TAG, 'operation update: ', properties);
      this._subHandler.add(this.operationsService.updateServiceOperation(this.editorContext.channel,
        this.editorContext.domainName,
        this.editorContext.applicationName,
        this.editorContext.serviceName, this.editorContext.operationName, properties).subscribe( (data) => {

          this.logger.debug(LOG_TAG, 'Updated operation: ', this.editorContext, data);

          this.notificationCenter.post({
              name: 'SaveOperationConfig',
              title: 'Save Operation Configuration',
              message: 'Operation configuration changed successfully.',
              type: NotificationType.Success
          });

          this.updateModel(properties);

          observer.next({});
          observer.complete();

      }, (error) => {

        this.logger.error(LOG_TAG , 'save Operation error: ', error);

        this.notificationCenter.post({
            name: 'SaveOperationConfigError',
            title: 'Save Operation Configuration',
            message: 'Error saving operation configuration:',
            type: NotificationType.Error,
            error: error,
            closable: true
        });

        observer.error(error);

      }));

    });
  }

  private refreshOperationInfo(domainName: string,
    applicationName: string,
    serviceName: string,
    operationName: string,
    channel: string): Observable<any> {
    return new Observable((observer) => {

        this.logger.debug(LOG_TAG, 'refreshOperationInfo called. Selected domain and application ',
        domainName, applicationName, serviceName, operationName, channel);
        this._subHandler.add(this.operationsService.getServiceOperation(channel,
           domainName,
           applicationName,
           serviceName,
           operationName).subscribe((operation: ServiceOperation) => {
            this._currentOperation = operation;

            this.toModel(operation);

            this.logger.debug(LOG_TAG, 'Current operation: ', this._currentOperation);

            observer.next(null);
            observer.complete();

        }, (error) => {

            this.logger.error(LOG_TAG , 'Get Applcation error: ', error);

            this.notificationCenter.post({
                name: 'LoadApplicationConfigError',
                title: 'Load Application Configuration',
                message: 'Error loading application configuration:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

            observer.error(error);

        }));

    });
  }

  private updateModel(operationProps: ServiceOperationProperties): void {
    this.logger.debug(LOG_TAG, 'updateModel called: ', operationProps);
    try {
      this.applyValueToModel('description', operationProps.description);
      this.applyValueToModel('encryptActive', operationProps.encryptActive);
      this.applyValueToModel('counted', operationProps.counted);
      this.applyValueToModel('pluginName', operationProps.pluginName);
      this.applyValueToModel('secure', operationProps.secure);
      this.applyValueToModel('sessionless', operationProps.sessionless);
      // tslint:disable-next-line:max-line-length
      this.applyValueToModel('inputParams', (operationProps.inputParams && operationProps.inputParams.length > 0 ) ? atob(operationProps.inputParams) : null);
      // tslint:disable-next-line:max-line-length
      this.applyValueToModel('outputParams', (operationProps.outputParams && operationProps.outputParams.length > 0) ? atob(operationProps.outputParams) : null);
    } catch (ex) {
      this.logger.error(LOG_TAG, 'toModel error: ', ex);
    }
  }

  private toModel(operation: ServiceOperation): void {
    this.logger.debug(LOG_TAG, 'toModel called: ', operation);
    try {
      this.applyValueToModel('description', operation.description);
      this.applyValueToModel('encryptActive', operation.encryptActive);
      this.applyValueToModel('counted', operation.counted);
      this.applyValueToModel('pluginName', operation.pluginName);
      this.applyValueToModel('secure', operation.secure);
      this.applyValueToModel('sessionless', operation.sessionless);
      this.applyValueToModel('inputParams', operation.inputParams);
      this.applyValueToModel('outputParams', operation.outputParams);
    } catch (ex) {
      this.logger.error(LOG_TAG, 'toModel error: ', ex);
    }
  }

  private fromModel(): ServiceOperationProperties {
    const ret: ServiceOperationProperties = {
      description : this.getPropertyItem('description').value,
      encryptActive : this.getPropertyItem('encryptActive').value,
      counted : this.getPropertyItem('counted').value,
      pluginName : this.getPropertyItem('pluginName').value,
      secure : this.getPropertyItem('secure').value,
      sessionless : this.getPropertyItem('sessionless').value,
      // tslint:disable-next-line:max-line-length
      inputParams : ( (this.getPropertyItem('inputParams').value && (this.getPropertyItem('inputParams').value.length > 0)) ? btoa(this.getPropertyItem('inputParams').value) : null),
      // tslint:disable-next-line:max-line-length
      outputParams : ( (this.getPropertyItem('outputParams').value && (this.getPropertyItem('outputParams').value.length > 0)) ? btoa(this.getPropertyItem('outputParams').value) : null)
    };
    return ret;
  }

}
