import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { SortDescriptor, GroupDescriptor, DataResult } from '@progress/kendo-data-query';
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { MotifQuerySort, MotifQueryResults } from 'web-console-core';
import { Oauth2Service, OAuthRequest, RefreshTokenList, AccessTokenList } from '@wa-motif-open-api/oauth2-service';
import { HttpParams } from '@angular/common/http';
import * as _ from 'lodash';
import { DomainSelectorComboBoxComponent } from '../../../components/UI/selectors/domain-selector-combobox-component';
import { Domain } from '@wa-motif-open-api/platform-service';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';

const LOG_TAG = "[OAuth2Section]";

@Component({
  selector: 'wa-oauth2-section',
  styleUrls: ['./oauth2-section.component.scss'],
  templateUrl: './oauth2-section.component.html'
})
@PluginView("OAuth2", {
  iconName: "wa-ico-users"
})
export class OAuth2SectionComponent implements OnInit, OnDestroy {

  @ViewChild(GridComponent) _grid: GridComponent;
  @ViewChild('domainSelector') domainSelector: DomainSelectorComboBoxComponent;

  //Data
  public refreshTokenList: RefreshTokenList = [];
  public accessTokenList: AccessTokenList = [];

  //Grid Options
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public gridView: DataResult;
  public type: 'numeric' | 'input' = 'numeric';
  public pageSize = 15;
  public skip = 0;
  public currentPage = 1;
  public totalPages = 0;
  public totalRecords = 0;
  public isFieldSortable = false;

  loading: boolean;

  private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

  constructor(private logger: NGXLogger,
    private oauth2Service: Oauth2Service,
    private notificationCenter: WCNotificationCenter
        ) {

    this.logger.debug(LOG_TAG, 'Opening...');
  }

  ngOnInit() {
    this.logger.debug(LOG_TAG, 'Initializing...');
  }

  ngOnDestroy() {
    this.logger.debug(LOG_TAG , 'ngOnDestroy ');
    this.freeMem();
 }

freeMem() {
  this.refreshTokenList = null;
  this.accessTokenList = null;
  this.sort = null;
  this.groups = null;
  this.gridView = null;
  this._subHandler.unsubscribe();
  this._subHandler = null;
}

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.logger.debug(LOG_TAG, 'pageChange skip=', skip, ' take=', take);
    this.skip = skip;
    this.pageSize = take;
    const newPageIndex = this.calculatePageIndex(skip, take);
    this.loadData(this.domainSelector.selectedDomain.name, newPageIndex, this.pageSize);
  }

  private loadData(domain: string, pageIndex: number, pageSize: number) {
    if (this.domainSelector.selectedDomain) {
      this.logger.debug(LOG_TAG, 'loadData pageIndex=', pageIndex, ' pageSize=', pageSize);

      this.loading = true;
      const sort: MotifQuerySort = this.buildQuerySort();

    this._subHandler.add(this.oauth2Service.getRefreshTokenList(
        this.domainSelector.selectedDomain.name,
        pageIndex, pageSize, sort.encode(new HttpParams()).get('sort'), 'response', false).subscribe((response) => {

        const results: MotifQueryResults = MotifQueryResults.fromHttpResponse(response);
        this.refreshTokenList = _.forEach(results.data, function (element) {
          element.createTime = new Date(element.createTime);
          element.expiryTime = new Date(element.expiryTime);
        });
        this.totalPages = results.totalPages;
        this.totalRecords = results.totalRecords;
        this.currentPage = results.pageIndex;
        this.gridView = {
          data: this.refreshTokenList,
          total: results.totalRecords
        };
        this.currentPage = results.pageIndex;
        this.loading = false;

      }, error => {
        this.logger.error(LOG_TAG, 'getRefreshTokenList failed: ', error);
        this.loading = false;
      }));
    }
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

  /**
   * Reload the list of users for the selected domain
   */
  public refreshData(): void {
    this.logger.debug(LOG_TAG, 'refreshData domain=', this.domainSelector.selectedDomain.name, ' currentPage=', this.currentPage, ' pageSize=', this.pageSize);
    this.loadData(this.domainSelector.selectedDomain.name, this.currentPage, this.pageSize);
  }

  /**
   * Set the selcted domain
   */
  @Input()
  public set selectedDomain(domain: Domain) {
    if (this.domainSelector.selectedDomain) {
      this.logger.debug(LOG_TAG, 'selectedDomain domain=', this.domainSelector.selectedDomain);
      this.loadData(this.domainSelector.selectedDomain.name, 1, this.pageSize);
    } else {
      this.gridView = undefined;
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.logger.debug(LOG_TAG, 'sortChange sort=', this.sort);
    this.sort = sort;
    this.refreshData()
  }

  public doSort() {
    //this.gridView = process(orderBy(this.usersList, this.sort), { group: this.groups });
  }

  onDeleteOKPressed(dataItem: any): void {
    this.logger.debug(LOG_TAG, 'onDeleteOKPressed token=', dataItem.token);
    const oauthReq: OAuthRequest = {
      clientId: '123456789',
      token: dataItem.token,
      tokenType: 'REFRESH_TOKEN'
    };

    this._subHandler.add(this.oauth2Service.revoke(oauthReq).subscribe(value => {
      this.refreshData();
      this.notificationCenter.post({
        name: 'RevokeRefreshTokenSuccess',
        title: 'Revoke Refresh Token',
        message: 'The Refresh Token has been successfully revoked',
        type: NotificationType.Success
    });

    }, (error) => {
      this.notificationCenter.post({
        name: 'RevokeRefreshTokenError',
        title: 'Revoke Refresh Token',
        message: 'Refresh token could not be removed.',
        type: NotificationType.Error,
        error: error,
        closable: true
      });
    }));
  }

  onDeleteCancelPressed(dataItem: any): void {
    this.logger.debug(LOG_TAG, 'onDeleteCancelPressed');
  }

  public onDomainSelected(domain: Domain) {
    if (domain) {
      this.loadData(domain.name, 1, this.pageSize);
    } else {
      this.gridView = undefined;
    }

  }

  onRefreshClicked() {
    this.refreshData();
  }

  public get canRefresh(): boolean {
    return (this.domainSelector.selectedDomain!=null);
  }

}
