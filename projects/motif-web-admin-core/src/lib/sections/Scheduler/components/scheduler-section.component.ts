import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import * as _ from 'lodash';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ScheduledTask, ScheduledTaskExecutionEntity, SchedulerService } from '@wa-motif-open-api/scheduler-service';
import { GridComponent } from '@progress/kendo-angular-grid';
import { WCGridEditorCommandsConfig, WCGridEditorCommandComponentEvent, WCConfirmationTitleProvider } from 'web-console-ui-kit';

const LOG_TAG = '[SchedulerSection]';

@Component({
  selector: 'wa-scheduler-section',
  styleUrls: ['./scheduler-section.component.scss'],
  templateUrl: './scheduler-section.component.html'
})
@PluginView('Scheduler', {
  iconName: 'wa-ico-scheduler',
  userData: {
      acl: {
          permissions: ['com.vipera.osgi.foundation.scheduler.api.rest.SchedulerApi:READ:getTaskList',
                        'com.vipera.osgi.foundation.scheduler.api.rest.SchedulerApi:READ:getTaskExecutionsList']
      }
  }
})
export class SchedulerSectionComponent implements OnInit, OnDestroy {

  @ViewChild(GridComponent) _grid: GridComponent;

  //Data
  public scheduledTasksList: Array<ScheduledTask> = [];
  public scheduledTaskExecutionsList: Array<ScheduledTaskExecutionEntity> = [];

  //Grid Options
  loading: boolean;


  statusConfirmationTitleProvider: WCConfirmationTitleProvider = {
    getTitle(rowData): string {
        if (rowData.enabled){
            return "Disable ?";
        } else {
            return "Enable ?";
        }
    }
}


  constructor(private logger: NGXLogger,
    private schedulerService: SchedulerService,
    private notificationCenter: WCNotificationCenter
        ) {

    this.logger.debug(LOG_TAG, 'Opening...');
  }

  ngOnInit() {
    this.logger.debug(LOG_TAG, 'Initializing...');
    this.refreshData();
  }

  ngOnDestroy() {
    this.logger.debug(LOG_TAG , 'ngOnDestroy ');
  }

  private loadData() {
    this.logger.debug(LOG_TAG, 'loadData');

    this.loading = true;
    this.schedulerService.getTaskList().subscribe((response) => {
      this.scheduledTasksList = response;
      _.forEach(this.scheduledTasksList, function (element) {
        element.created = new Date(element.created);
        element.updated = new Date(element.updated);
      });
    this.loading = false;
    }, error => {
      this.logger.error(LOG_TAG, 'getTaskList failed: ', error);
      this.loading = false;
    });
  }

  public refreshData(): void {
    this.loadData();
  }

  onDeleteOKPressed(dataItem: any): void {
    this.logger.debug(LOG_TAG, 'onDeleteOKPressed token=', dataItem.name);

    this.schedulerService.deleteTask(dataItem.name).subscribe(value => {
      this.refreshData();
      this.notificationCenter.post({
        name: 'DeleteScheduledTaskSuccess',
        title: 'Delete Scheduled Task',
        message: 'The Scheduled Task has been successfully removed',
        type: NotificationType.Success
    });

    }, (error) => {
      this.notificationCenter.post({
        name: 'DeleteScheduledTaskError',
        title: 'Delete Scheduled Task',
        message: 'The Scheduled Task could not be removed.',
        type: NotificationType.Error,
        error: error,
        closable: true
      });
    });
  }

  onDeleteCancelPressed(dataItem: any): void {
    this.logger.debug(LOG_TAG, 'onDeleteCancelPressed');
  }

  onRefreshClicked() {
    this.refreshData();
  }

  onStatusTogglePressed(dataItem): void {
    this.logger.debug(LOG_TAG, 'onStatusTogglePressed dataItem: ', dataItem);
    this.changeTaskStatus(dataItem.name, !dataItem.enabled);
  }


  private changeTaskStatus(taskName:string, enabled:boolean) {
    if (enabled){
      this.enabledTask(taskName);
    } else {
      this.disableTask(taskName);
    }
  }

  private disableTask(taskName:string){
    this.schedulerService.disableTask(taskName).subscribe(value => {
      this.refreshData();
      this.notificationCenter.post({
        name: 'DisableScheduledTaskSuccess',
        title: 'Disable Scheduled Task',
        message: 'The Scheduled Task has been successfully disabled',
        type: NotificationType.Success
    });

    }, (error) => {
      this.notificationCenter.post({
        name: 'DisableScheduledTaskError',
        title: 'Disable Scheduled Task',
        message: 'The Scheduled Task could not be disabled.',
        type: NotificationType.Error,
        error: error,
        closable: true
      });
    });
  }

  private enabledTask(taskName:string){
    this.schedulerService.enableTask(taskName).subscribe(value => {
      this.refreshData();
      this.notificationCenter.post({
        name: 'EnableScheduledTaskSuccess',
        title: 'Enable Scheduled Task',
        message: 'The Scheduled Task has been successfully enabled',
        type: NotificationType.Success
    });

    }, (error) => {
      this.notificationCenter.post({
        name: 'EnableScheduledTaskError',
        title: 'Enable Scheduled Task',
        message: 'The Scheduled Task could not be enabled.',
        type: NotificationType.Error,
        error: error,
        closable: true
      });
    });
  }

}
