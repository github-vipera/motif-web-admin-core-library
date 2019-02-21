import { Component, OnInit, EventEmitter, ViewChild, Output, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { WCPropertyEditorModel, WCPropertyEditorItemType, WCPropertyEditorItem,  MinitButtonClickEvent } from 'web-console-ui-kit';
import { EditorPropertyChangeEvent } from '../commons/editors-events';
import { BaseEditorComponent } from '../base-editor-component';
import { Observable } from 'rxjs';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ApplicationsService, Application, ApplicationUpdate, Property, SystemCategory } from '@wa-motif-open-api/platform-service';
import { EditorContext } from '../service-catalog-editor-context';
import { MessageCategoriesDialogComponent } from '../../dialogs/message-categories/message-categories-dialog'
import { SystemService } from '@wa-motif-open-api/platform-service';
import { WCSubscriptionHandler } from '../../../../../components/Commons/wc-subscription-handler';

const LOG_TAG = '[ServicesSectionApplicationEditor]';


@Component({
    selector: 'wa-services-application-editor',
    styleUrls: ['./application-editor-component.scss'],
    templateUrl: './application-editor-component.html'
})
export class ApplicationEditorComponent  extends BaseEditorComponent implements OnInit, OnDestroy {

    @ViewChild('offlineMessagesDialog') offlineMessagesDialog: MessageCategoriesDialogComponent;
  
    @Output() propertyChange: EventEmitter<EditorPropertyChangeEvent> = new EventEmitter();

    private _currentApplication: Application;
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    public offlineMessages: string[] = [];

    public applicationModel: WCPropertyEditorModel = {
        items: [
          {
            name: 'Description',
            field: 'description',
            type: WCPropertyEditorItemType.String,
            value: 'Vipera platform secure'
          },
          {
            name: 'Online',
            field: 'online',
            type: WCPropertyEditorItemType.Boolean,
            value: false
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
            name: 'OTP expiry',
            field: 'otpExpiry',
            type: WCPropertyEditorItemType.String,
            htmlInputType: 'number',
            value: '-1'
          },
          {
            name: 'OTP Format',
            field: 'otpFormat',
            type: WCPropertyEditorItemType.String,
            value: '[a-z0-9]+',
            disabled: false
          },
          {
            name: 'OTP Length',
            field: 'otpLength',
            type: WCPropertyEditorItemType.String,
            value: '6',
            htmlInputType: 'number',
            disabled: false
          },
          {
            name: 'OTP Reuse',
            field: 'otpReuse',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'OTP Max Failures',
            field: 'otpMaxFailures',
            type: WCPropertyEditorItemType.String,
            value: '3',
            htmlInputType: 'number',
            disabled: false
          },
          {
            name: 'Allow Multiple Sessions',
            field: 'allowMultipleSessions',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'Instance Key Length',
            field: 'instanceKeyLength',
            type: WCPropertyEditorItemType.String,
            value: '32',
            htmlInputType: 'number',
            disabled: false
          },
          {
            name: 'Allow Multiple Apps',
            field: 'allowMultipleInstall',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'Password History',
            field: 'passwordHistory',
            type: WCPropertyEditorItemType.String,
            value: '32',
            htmlInputType: 'number',
            disabled: false
          },
          {
            name: 'Password Expiry',
            field: 'passwordExpiry',
            type: WCPropertyEditorItemType.String,
            value: '32',
            htmlInputType: 'number',
            disabled: false
          },
          {
            name: 'Password Format',
            field: 'passwordFormat',
            type: WCPropertyEditorItemType.String,
            value: '.+',
            disabled: false
          },
          {
            name: 'Max Login Failures',
            field: 'passwordMaxFailures',
            type: WCPropertyEditorItemType.String,
            value: '-1',
            htmlInputType: 'number',
            disabled: false
          },
          {
            name: 'Register User',
            field: 'registerUser',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'Register Password',
            field: 'registerPasswd',
            type: WCPropertyEditorItemType.Boolean,
            value: false
          },
          {
            name: 'User Activation',
            field: 'needsActivation',
            type: WCPropertyEditorItemType.Boolean,
            value: true
          },
          {
            name: 'Verify Client IP',
            field: 'verifyClientIp',
            type: WCPropertyEditorItemType.Boolean,
            value: true
          },
          {
            name: 'Vipera Serial Format',
            field: 'viperaSerialFormat',
            type: WCPropertyEditorItemType.String,
            value: '[a-zA-Z0-9]+',
            disabled: false
          },
          {
            name: 'Vipera Serial Length',
            field: 'viperaSerialLength',
            type: WCPropertyEditorItemType.String,
            value: '16',
            htmlInputType: 'number',
            disabled: false
          },
          {
            name: 'UserID Format',
            field: 'userIdFormat',
            type: WCPropertyEditorItemType.String,
            value: '[a-zA-Z0-9]+',
            disabled: false
          },
          {
            name: 'UserID Length',
            field: 'userIdLength',
            type: WCPropertyEditorItemType.String,
            value: '16',
            htmlInputType: 'number',
            disabled: false
          }
        ]
      };

    constructor(public logger: NGXLogger,
      public applicationService: ApplicationsService,
      public notificationCenter: WCNotificationCenter,
      private systemService: SystemService) {
        super(logger, notificationCenter);
        this.setModel(this.applicationModel);
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
        this.applicationModel = null;
        this._currentApplication = null;
        this.offlineMessages = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    onMiniButtonClick(event: MinitButtonClickEvent): void {
      this.logger.debug(LOG_TAG, 'onMiniButtonClick:', event);
      this.offlineMessagesDialog.show(this.editorContext.domainName);
    }

  doRefreshData(editorContext: EditorContext): Observable<any> {
      this.reloadCategories();
      return this.refreshApplicationInfo(editorContext.domainName, editorContext.applicationName);
  }

  doSaveChanges(editorContext: EditorContext): Observable<any> {
      return new Observable((observer) => {

          this.logger.debug(LOG_TAG, 'Saving changes on application: ', this.editorContext.domainName, this._currentApplication.name);

          const updatedApplication = this.fromModel();

          this.logger.debug(LOG_TAG, 'application update: ', updatedApplication);

          this._subHandler.add(this.applicationService.updateApplication(this.editorContext.domainName,
            this.editorContext.applicationName,
            updatedApplication).subscribe((data) => {

              this.logger.debug(LOG_TAG, 'Updated application: ', this.editorContext.domainName, this._currentApplication.name, data);

              this.notificationCenter.post({
                  name: 'SaveApplicationConfig',
                  title: 'Save Application Configuration',
                  message: 'Application configuration changed successfully.',
                  type: NotificationType.Success
              }); 

              this.commitAllChanges();

              observer.next({});
              observer.complete();

            }, (error) => {

              this.logger.error(LOG_TAG , 'save Application error: ', error);

              this.notificationCenter.post({
                  name: 'SaveApplicationConfigError',
                  title: 'Save Application Configuration',
                  message: 'Error saving application configuration:',
                  type: NotificationType.Error,
                  error: error,
                  closable: true
              });

              observer.error(error);

            }));

      });
  }

  private fromModel(): ApplicationUpdate {
    this.logger.debug(LOG_TAG, 'fromModel called.');

    const changedProperties: WCPropertyEditorItem[] = this.getChangedProperties();

    this.logger.trace(LOG_TAG, 'fromModel changedProperties:', changedProperties);

    const changedProps: Property[] = [];
    for (let i = 0 ; i < changedProperties.length; i++) {
      const changedProperty = changedProperties[i];
      if (changedProperty.field === 'online')  {
        const property = {
          key : 'offline',
          value: '' + !(changedProperty.value)
        };
        changedProps.push(property);
      } else if ((changedProperty.field !== 'description') && (changedProperty.field !== 'category')) {
        const property = {
          key : changedProperty.field,
          value: changedProperty.value
        };
        changedProps.push(property);
      } else {
        this.logger.debug(LOG_TAG, 'fromModel discarded field >>>>', changedProperty);
      }
    }

    const application: ApplicationUpdate = {
    };

    const descriptionProperty: WCPropertyEditorItem = this.getPropertyItem('description');
    const categoryProperty: WCPropertyEditorItem = this.getPropertyItem('category');

    if (descriptionProperty.valueChanged) {
      application.description = descriptionProperty.value;
    }

    if (categoryProperty.valueChanged) {
      application.category = categoryProperty.value;
    }

    if (changedProps.length > 0) {
      application.properties = changedProps;
    }

    this.logger.debug(LOG_TAG, 'fromModel updateApp: ', application);

    return application;
  }

  private toModel(application: Application): void {
    this.applyValueToModel('description', application.description);
    this.applyValueToModel('online', !(application.offline));
    this.applyValueToModel('category', application.category);
    this.applyValueToModel('otpExpiry', application.otpExpiry);
    this.applyValueToModel('otpFormat', application.otpFormat);
    this.applyValueToModel('otpLength', application.otpLength);
    this.applyValueToModel('otpReuse', application.otpReuse);
    this.applyValueToModel('otpMaxFailures', application.otpMaxFailures);
    this.applyValueToModel('allowMultipleSessions', application.allowMultipleSessions);
    this.applyValueToModel('instanceKeyLength', application.instanceKeyLength);
    this.applyValueToModel('allowMultipleInstall', application.allowMultipleInstall);
    this.applyValueToModel('passwordHistory', application.passwordHistory);
    this.applyValueToModel('passwordExpiry', application.passwordExpiry);
    this.applyValueToModel('passwordFormat', application.passwordFormat);
    this.applyValueToModel('passwordMaxFailures', application.passwordMaxFailures);
    this.applyValueToModel('registerUser', application.registerUser);
    this.applyValueToModel('registerPasswd', application.registerPasswd);
    this.applyValueToModel('needsActivation', application.needsActivation);
    this.applyValueToModel('verifyClientIp', application.verifyClientIp);
    this.applyValueToModel('viperaSerialFormat', application.viperaSerialFormat);
    this.applyValueToModel('viperaSerialLength', application.viperaSerialLength);
    this.applyValueToModel('userIdFormat', application.userIdFormat);
    this.applyValueToModel('userIdLength', application.userIdLength);
    this.getPropertyItem('category').disabled = !application.offline;
  }

  private refreshApplicationInfo(domainName: string, applicationName: string): Observable<any> {
      return new Observable((observer) => {

          this.logger.debug(LOG_TAG, 'Selected domain and application ', domainName, applicationName);
          this._subHandler.add(this.applicationService.getApplication(domainName, applicationName).subscribe((application: Application) => {
              this._currentApplication = application;

              this.toModel(application);

              this.logger.debug(LOG_TAG, 'Current application: ', this._currentApplication);

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

  onPropertyChanged(event): any {
    this.logger.debug(LOG_TAG, 'onPropertyChanged:', event);
    if ( event.item.field === 'online' ) {
      this.handleOfflineProperties(event.newValue);
    }
  }

  private handleOfflineProperties(enabled: boolean) {
    this.getPropertyItem('category').disabled = enabled;
  }

  reloadCategories() {
    this._subHandler.add(this.systemService.getSystemCategories(this.editorContext.domainName).subscribe( (data: Array<SystemCategory>) => {
      const categories = [];
      for (let i = 0; i < data.length; i++){
        categories.push(data[i].name);
      }
      this.getPropertyItem('category').listValues = categories;
    }, (error) => {
      this.logger.error(LOG_TAG, 'doRefreshData get category list error:', error);
    }));
  }

}
