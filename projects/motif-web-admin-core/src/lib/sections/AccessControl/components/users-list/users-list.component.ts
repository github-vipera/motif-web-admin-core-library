import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { WCToasterService, WCConfirmationTitleProvider, WCGridEditorCommandsConfig, WCGridEditorCommandComponentEvent } from 'web-console-ui-kit'
import { SortDescriptor, orderBy, GroupDescriptor, process, DataResult, FilterDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent, GridComponent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { MotifQueryFilter, MotifQuerySort, MotifQueryResults, MotifQueryService, MotifPagedQuery } from 'web-console-core';
import { SelectableSettings, SelectionEvent, RowArgs } from '@progress/kendo-angular-grid';
import { DomainsService, Domain, UsersService, User } from '@wa-motif-open-api/platform-service'
import { String, StringBuilder } from 'typescript-string-operations'
import * as _ from 'lodash';
import { HttpParams } from '@angular/common/http';
import { WCSubscriptionHandler } from '../../../../components/Commons/wc-subscription-handler';
import { Observable } from 'rxjs';
import { NGXLogger } from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';

const LOG_TAG = "[AccessControlSection/UsersList]";
const USERS_LIST_ENDPOINT = "/platform/domains/{0}/users"

export enum RowCommandType {
  Edit = 'Edit',
  Delete = 'Delete'
}

export interface RowCommandEvent {
  commandType: RowCommandType,
  dataItem: User
}

export interface NewUserModel {
  userId?:string,
  userIdInt?:number, 
  msisdn?:number, 
  serial?:number
}

@Component({
  selector: "wa-users-list",
  styleUrls: ["./users-list.component.scss"],
  templateUrl: "./users-list.component.html"
})
export class UsersListComponent implements OnInit {
  @ViewChild(GridComponent) _grid: GridComponent;

  //Data
  public usersList: Array<User> = [];
  public domainList: Array<Domain> = [];

  public _selectedDomain: string; //combo box selection
  @Input("selection")
  selectedKeys: Array<string> = [];

  //Grid Options
  public filter: CompositeFilterDescriptor;
  public sort: SortDescriptor[] = [];
  public gridView: DataResult;
  public type: "numeric" | "input" = "numeric";
  public pageSize = 15;
  public skip = 0;
  public currentPage = 1;
  public totalPages = 0;
  public totalRecords = 0;
  public isFieldSortable = false;
  public selectableSettings: SelectableSettings = {
    checkboxOnly: false,
    mode: "single"
  };

  commands: WCGridEditorCommandsConfig = [
    {
      commandIcon: "wa-ico-edit",
      commandId: RowCommandType.Edit,
      title: "Edit"
    },
    {
      commandIcon: "wa-ico-no",
      commandId: RowCommandType.Delete,
      title: "Delete",
      hasConfirmation: true,
      confirmationTitle: "Delete ?"
    }
  ];

  private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

  @Output() rowCommandClick: EventEmitter<RowCommandEvent> = new EventEmitter<
    RowCommandEvent
  >();

  /**
   * Set the selcted domain
   */
  @Input()
  public set selectedDomain(domain: string) {
    this._selectedDomain = domain;
    if (this._selectedDomain) {
      this.loadData(this._selectedDomain, 1, this.pageSize);
    } else {
      this.gridView = undefined;
    }
  }

  @Output()
  selectionChange = new EventEmitter<SelectionEvent>();

  //new user form
  @Input("newUserId") newUserId: string = "";
  @Input("newUserModel") newUserModel: NewUserModel = {};

  statusConfirmationTitleProvider: WCConfirmationTitleProvider = {
    getTitle(rowData): string {
      if (rowData.state && rowData.state.toUpperCase() === "ACTIVE") {
        return "Suspend?";
      } else if (rowData.state && rowData.state.toUpperCase() === "PREACTIVE") {
        return "Activate?";
      } else {
        return "";
      }
    }
  };

  constructor(
    private logger: NGXLogger,
    private usersService: UsersService,
    private domainsService: DomainsService,
    private motifQueryService: MotifQueryService,
    private notificationCenter: WCNotificationCenter
  ) {
    console.log("usersService=", usersService);
  }

  ngOnInit() {}

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    let newPageIndex = this.calculatePageIndex(skip, take);
    this.loadData(this._selectedDomain, newPageIndex, this.pageSize);
  }

  private loadData(domain: string, pageIndex: number, pageSize: number) {
    if (this._selectedDomain) {
      console.log("loadData pageIndex=" + pageIndex + " pageSize=" + pageSize);

      let sort: MotifQuerySort = this.buildQuerySort();

      // Filter data
      let userId: string = null;
      let userIdInt: string = null;
      let state: string = null;
      if (this.filter) {
        this.filter.filters.forEach((filter: FilterDescriptor) => {
          if (filter.field === "userId") {
            userId = filter.value;
          } else if (filter.field === "userIdInt") {
            userIdInt = filter.value;
          } else if (filter.field === "state") {
            state = filter.value;
          }
        });
      }

      this.usersService
        .getUsersList(
          domain,
          userId,
          userIdInt,
          state,
          pageIndex,
          pageSize,
          sort.encode(new HttpParams()).get("sort"),
          "response",
          false
        )
        .subscribe(
          response => {
            let results: MotifQueryResults = MotifQueryResults.fromHttpResponse(
              response
            );
            this.usersList = _.forEach(results.data, function(element) {
              element.created = new Date(element.created);
              element.lastLogin = new Date(element.lastLogin);
            });
            this.totalPages = results.totalPages;
            this.totalRecords = results.totalRecords;
            this.currentPage = results.pageIndex;
            this.gridView = {
              data: this.usersList,
              total: results.totalRecords
            };
            this.currentPage = results.pageIndex;
          },
          error => {
            console.log("MotifPagedQueryInterceptor test query error: ", error);
          }
        );
    }
  }

  private getUserListEx(
    domain: string,
    pageIndex: number,
    pageSize: number,
    sort: MotifQuerySort,
    filter: MotifQueryFilter
  ): Promise<MotifQueryResults> {
    return new Promise<MotifQueryResults>((resolve, reject) => {
      let endpoint = String.Format(USERS_LIST_ENDPOINT, domain);
      this.motifQueryService
        .query(endpoint, pageIndex, pageSize, sort, filter)
        .subscribe(queryResponse => {
          console.log("Get Users List done: ", queryResponse);
          resolve(queryResponse);
        }, reject);
    });
  }

  private calculatePageIndex(skip: number, take: number): number {
    return skip / take + 1;
  }

  private buildQuerySort(): MotifQuerySort {
    console.log("*****SORT ", this.sort);
    let querySort = new MotifQuerySort();
    if (this.sort) {
      for (let i = 0; i < this.sort.length; i++) {
        let sortInfo = this.sort[i];
        if (sortInfo.dir && sortInfo.dir === "asc") {
          querySort.orderAscendingBy(sortInfo.field);
        } else if (sortInfo.dir && sortInfo.dir === "desc") {
          querySort.orderDescendingBy(sortInfo.field);
        }
      }
    }
    return querySort;
  }

  /**
   * Reload the list of users for the selected domain
   */
  public refreshData(): void {
    this.loadData(this._selectedDomain, this.currentPage, this.pageSize);
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.refreshData();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.refreshData();
  }

  onSelectionChange(e: SelectionEvent) {
    this.selectionChange.emit(e);
  }

  onStatusChangeOKPressed(dataItem: any): void {
    //TODO: Implement
  }

  onStatusChangeCancelPressed(dataItem: any): void {}

  onCommandConfirm(event: WCGridEditorCommandComponentEvent) {
    this.logger.debug(LOG_TAG, "onCommandConfirm event: ", event);
    switch (event.id) {
      case RowCommandType.Delete:
        this.rowCommandClick.emit({
          commandType: RowCommandType.Delete,
          dataItem: event.rowData.dataItem
        });
        break;
    }
  }

  onCommandClick(event: WCGridEditorCommandComponentEvent) {
    this.logger.debug(LOG_TAG, "onCommandClick event: ", event);
    switch (event.id) {
      case RowCommandType.Edit:
        this.rowCommandClick.emit({
          commandType: RowCommandType.Edit,
          dataItem: event.rowData.dataItem
        });
        break;
    }
  }

  get statusButtonClass(): string {
    return "btn status-activated";
  }

  public getStatusButtonClass(statusStr: string): string {
    if (statusStr && statusStr.toUpperCase() === "ACTIVE") {
      return "btn user-status-active";
    } else if (statusStr && statusStr.toUpperCase() === "PREACTIVE") {
      return "btn user-status-preactive";
    } else {
      return "";
    }
  }

  public getStatusButtonQuestion(statusStr: string): string {
    if (statusStr && statusStr.toUpperCase() === "ACTIVE") {
      return "Suspend?";
    } else if (statusStr && statusStr.toUpperCase() === "PREACTIVE") {
      return "Activate?";
    } else {
      return "";
    }
  }
}
