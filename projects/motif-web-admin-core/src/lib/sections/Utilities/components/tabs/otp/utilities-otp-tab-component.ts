import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { Application, Domain } from '@wa-motif-open-api/platform-service';
import { User } from '@wa-motif-open-api/user-mgr-service';
import { faCube, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { OTPDataSourceComponent } from './otp-data-source-component';
import { OtpService, Otp, OtpCreate, OtpEntity } from '@wa-motif-open-api/otp-service';
import {
  WCNotificationCenter,
  NotificationType
} from 'web-console-ui-kit';
import { WCSubscriptionHandler } from '../../../../../components/Commons/wc-subscription-handler';
import { NewOtpDialogComponent, NewOtpDialogResult } from './dialog/new-otp-dialog';

const LOG_TAG = '[OTPUtilityComponent]';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'wa-utilities-otp-component',
  styleUrls: ['./utilities-otp-tab-component.scss'],
  templateUrl: './utilities-otp-tab-component.html'
})
export class OTPUtilityComponent implements OnInit, OnDestroy {
  public faCube = faCube;
  public faPlusCircle = faPlusCircle;
  public application: Application;
  public dataSource: OTPDataSourceComponent;
  private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
  @ViewChild('newOtpDialog') newOtpDialog: NewOtpDialogComponent;

  constructor(
    private logger: NGXLogger,
    private otpService: OtpService,
    private notificationCenter: WCNotificationCenter,
    private renderer2: Renderer2
    ) {
    this.dataSource = new OTPDataSourceComponent(logger, otpService);

    this.dataSource.error.subscribe(error => {
      this.logger.error(LOG_TAG, 'Data source error: ', error);
      this.notificationCenter.post({
        name: 'LoadOTPError',
        title: 'Load OTP',
        message: 'Error loading OTP:',
        type: NotificationType.Error,
        error: error,
        closable: true
      });
    });
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
      this.application = null;
      this.dataSource.close();
      this.dataSource = null;
      this._subHandler.unsubscribe();
      this._subHandler = null;
  }


  onCreateClicked(): void {
    if (this.dataSource.domain && this.dataSource.user){
      this.newOtpDialog.show();
    } else {
      this.notificationCenter.post({
        name: 'NewOTPClicked',
        title: 'Create New OTP',
        message: 'Before proceeding you need to choose a Domain and the User.',
        type: NotificationType.Warning,
        closable: false
      });

    }
      /*
    this.logger.debug(
      LOG_TAG,
      'onCreateClicked: ',
      this.dataSource.domain,
      this.application,
      this.dataSource.user
    );
    this.createOTP();
    */
  }

  onRefreshClicked(): void {
    this.dataSource.reload();
  }

  private createOTP(domain: Domain, user: User, application: Application, scope?: string): void {
    if (domain && user && application){
      const otpCreate: OtpCreate = {
        application: application.name,
        scope: scope
      };
      this.logger.debug(LOG_TAG, 'createOtp with: ', otpCreate);
      this._subHandler.add(this.otpService
        .createOtp(
          domain.name,
          user.userId,
          otpCreate
        )
        .subscribe(
          (otp: Otp) => {
            this.logger.debug(LOG_TAG, 'createOtp done: ', otp);

            this.notificationCenter.post({
              name: 'CreateOTPSuccess',
              title: 'Create OTP',
              message: 'OTP created successfully.',
              type: NotificationType.Success
            });

            this.dataSource.reload();
          },
          error => {
            this.logger.error(LOG_TAG, 'createOtp error: ', error);

            this.notificationCenter.post({
              name: 'CreateOTPError',
              title: 'Create OTP',
              message: 'Error creating OTP:',
              type: NotificationType.Error,
              error: error,
              closable: true
            });
          }
        ));
    } else {
      this.notificationCenter.post({
        name: 'CreateOTPWarn',
        title: 'Create OTP',
        message: 'You need to specify Domain, Application and User correctly.',
        type: NotificationType.Warning
      });
    }
  }

  onDeleteOKPressed(item: OtpEntity): void {
    this.logger.debug(LOG_TAG, 'onDeleteOKPressed: ', item);
    this.deleteOTP(item.id);
  }

  private deleteOTP(otpId: number): void {
    this.logger.debug(LOG_TAG, 'deleteOTP: ', otpId);
    this._subHandler.add(this.otpService.deleteOtp(otpId).subscribe(
      data => {
        this.logger.debug(LOG_TAG, 'deleteOTP done: ', otpId);

        this.notificationCenter.post({
          name: 'DeleteOTPSuccess',
          title: 'Delete OTP',
          message: 'OTP deleted successfully.',
          type: NotificationType.Success
        });

        this.dataSource.reload();
      },
      error => {
        this.logger.error(LOG_TAG, 'deleteOTP error: ', error);

        this.notificationCenter.post({
          name: 'DeleteOTPError',
          title: 'Delete OTP',
          message: 'Error deleting OTP:',
          type: NotificationType.Error,
          error: error,
          closable: true
        });
      }
    ));
  }

  onNewOtpConfirm(event: NewOtpDialogResult): void {
    this.logger.debug(LOG_TAG, 'onNewOtpConfirm: ', event);
    this.createOTP(this.dataSource.domain, this.dataSource.user, event.application, event.scope);
  }

}
