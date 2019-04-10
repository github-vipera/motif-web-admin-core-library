import { NGXLogger} from 'web-console-core';
import { Component, OnInit, Input } from '@angular/core';
import { WCToasterService } from 'web-console-ui-kit';
import { SchedulerService, ScheduledTaskExecutionEntity } from '@wa-motif-open-api/scheduler-service';
import { SortDescriptor, GroupDescriptor, DataResult } from '@progress/kendo-data-query';
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { MotifQuerySort, MotifQueryResults } from 'web-console-core';
import { HttpParams } from '@angular/common/http';
import * as _ from 'lodash';

const LOG_TAG = "[SchedulerSection] [ScheduledTaskDetailsComponent]";
const REFRESH_TOKENS_LIST_ENDPOINT = "/oauth2/refreshTokens/{0}/accessTokens";

@Component({
  selector: 'wa-scheduler-section-task-details',
  styleUrls: [ './scheduled-task-details.component.scss' ],
  templateUrl: './scheduled-task-details.component.html'
})
export class ScheduledTaskDetailsComponent implements OnInit {

  @Input() public scheduledTask: string;

  //Data
  public taskExecutionsList: Array<ScheduledTaskExecutionEntity> = [];

  //Grid Options
  public sort: SortDescriptor[] = [{
    field: 'created',
    dir: 'desc'
  }];
  public gridView: DataResult;
  public type: 'numeric' | 'input' = 'numeric';
  public pageSize = 10;
  public skip = 0;
  public currentPage = 1;
  public totalPages = 0;
  public totalRecords = 0;
  public isFieldSortable = false;

  loading: boolean;

  constructor(private logger: NGXLogger,
    private schedulerService: SchedulerService,
    private toaster: WCToasterService) {
  }

  ngOnInit() {
    this.refreshData();
  }

  /**
   * Reload the list of access tokens for the selected refresh token
   */
  public refreshData(): void {
    this.logger.debug(LOG_TAG, "refreshData");
    this.loadData(this.scheduledTask, this.currentPage, this.pageSize);
  }

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.logger.debug(LOG_TAG, 'pageChange skip=', skip, ' take=', take);
    this.skip = skip;
    this.pageSize = take;
    const newPageIndex = this.calculatePageIndex(skip, take);
    this.loadData(this.scheduledTask, newPageIndex, this.pageSize);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.logger.debug(LOG_TAG, 'sortChange sort=', this.sort);
    this.sort = sort;
    this.refreshData();
  }

  private loadData(scheduledTask: string, pageIndex: number, pageSize: number) {
    this.logger.debug(LOG_TAG, 'loadData pageIndex=', pageIndex, ' pageSize=', pageSize);

    this.loading = true;
    const sort: MotifQuerySort = this.buildQuerySort();

    this.schedulerService.getTaskExecutionsList(scheduledTask, null,
      pageIndex, pageSize, sort.encode(new HttpParams()).get('sort'), 'response', false).subscribe((response) => {

        const results: MotifQueryResults = MotifQueryResults.fromHttpResponse(response);
        this.taskExecutionsList = results.data;
        this.totalPages = results.totalPages;
        this.totalRecords = results.totalRecords;
        this.currentPage = results.pageIndex;
        _.forEach(this.taskExecutionsList, function (element) {
          element.created = new Date(element.created);
        });
        this.gridView = {
          data: this.taskExecutionsList,
          total: results.totalRecords
        };
        this.currentPage = results.pageIndex;
        this.loading = false;

      }, error => {
        this.logger.error(LOG_TAG, 'getScheduledTaskExecutions failed: ', error);
        this.loading = false;
      });
  }

  private calculatePageIndex(skip: number, take: number): number {
    return (skip / take) + 1;
  }

  private buildQuerySort(): MotifQuerySort {
    this.logger.debug(LOG_TAG, 'buildQuerySort: ', this.sort);
    let querySort = new MotifQuerySort();
    if (this.sort) {
      for (let i = 0; i < this.sort.length; i++) {
        let sortInfo = this.sort[i];
        if (sortInfo.dir && sortInfo.dir === 'asc') {
          querySort.orderAscendingBy(sortInfo.field);
        } else if (sortInfo.dir && sortInfo.dir === 'desc') {
          querySort.orderDescendingBy(sortInfo.field);
        }
      }
    }
    return querySort;
  }
}
