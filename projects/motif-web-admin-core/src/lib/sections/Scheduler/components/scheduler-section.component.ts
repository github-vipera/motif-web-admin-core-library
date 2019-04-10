import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import * as _ from 'lodash';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ScheduledTask, ScheduledTaskExecutionEntity, SchedulerService } from '@wa-motif-open-api/scheduler-service';
import { GridComponent } from '@progress/kendo-angular-grid';

const LOG_TAG = '[SchedulerSection]';

@Component({
  selector: 'wa-scheduler-section',
  styleUrls: ['./scheduler-section.component.scss'],
  templateUrl: './scheduler-section.component.html'
})
@PluginView('Scheduler', {
  iconName: 'wa-ico-scheduler'
})
export class SchedulerSectionComponent implements OnInit, OnDestroy {

  @ViewChild(GridComponent) _grid: GridComponent;

  //Data
  public scheduledTasksList: Array<ScheduledTask> = [];
  public scheduledTaskExecutionsList: Array<ScheduledTaskExecutionEntity> = [];

  //Grid Options
  loading: boolean;

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
}
