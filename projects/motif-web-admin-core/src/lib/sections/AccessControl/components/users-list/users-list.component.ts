import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { PluginView } from 'web-console-core'
//import { UsersService, User } from '../../services/Platform/UsersService';
//import { DomainsService, Domain } from '../../services/Platform/DomainsService';
import { WCToasterService, WCConfirmationTitleProvider } from 'web-console-ui-kit'
import { SortDescriptor, orderBy, GroupDescriptor, process, DataResult } from '@progress/kendo-data-query';
import { PageChangeEvent, GridComponent } from '@progress/kendo-angular-grid';
import { MotifQueryFilter, MotifQuerySort, MotifQueryResults, MotifQueryService, MotifPagedQuery } from 'web-console-core';
import { WCSlidePanelComponent } from 'web-console-ui-kit'
import { SelectableSettings, SelectionEvent, RowArgs } from '@progress/kendo-angular-grid';
import { DomainsService, DomainsList, Domain, UsersService, UsersList } from '@wa-motif-open-api/platform-service'
import { String, StringBuilder } from 'typescript-string-operations'
import * as _ from 'lodash';
import { HttpParams } from '@angular/common/http';
//import { WAGlobals } from '../../WAGlobals'

const USERS_LIST_ENDPOINT = "/platform/domains/{0}/users"
const CREATE_USER_ENDPOINT = "/platform/domains/{0}/users"

export interface NewUserModel {
  userId?:string,
  userIdInt?:number, 
  msisdn?:number, 
  serial?:number
}

@Component({
  selector: 'wa-users-list',
  styleUrls: [ './users-list.component.scss' ],
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {

  @ViewChild(GridComponent) _grid : GridComponent;
  @ViewChild('slideDownEditor') _slideDownEditor : WCSlidePanelComponent;

  //Data
  public usersList: UsersList = [];
  public domainList: DomainsList = [];

  public _selectedDomain:string; //combo box selection
  @Input("selection")
  selectedKeys:Array<string> = [];

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
  public isFieldSortable=false;
  public selectableSettings: SelectableSettings = {
    checkboxOnly: false,
    mode: 'single'
  };

  /**
   * Set the selcted domain
   */
  @Input()
  public set selectedDomain(domain:string){
    this._selectedDomain = domain;
    if (this._selectedDomain){
      this.loadData(this._selectedDomain, 1, this.pageSize);
    } else {
      this.gridView = undefined;
    }
  }

  @Output()
  selectionChange = new EventEmitter<SelectionEvent>();

  //new user form
  @Input('newUserId') newUserId:string = "";
  @Input('newUserModel') newUserModel:NewUserModel={};

  statusConfirmationTitleProvider: WCConfirmationTitleProvider= {
    getTitle(rowData): string {
      if (rowData.state && rowData.state.toUpperCase()==="ACTIVE"){
        return "Suspend?";
      } else if (rowData.state && rowData.state.toUpperCase()==="PREACTIVE"){
        return "Activate?";
      } else {
        return "";
      }
    }
}

  constructor(private usersService: UsersService,  
    private domainsService:DomainsService,
    private motifQueryService: MotifQueryService,
    private toaster: WCToasterService) {
    console.log("usersService=", usersService);
  }

  ngOnInit() {
  }

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.skip = skip;
    this.pageSize = take;
    let newPageIndex = this.calculatePageIndex(skip, take);
    this.loadData(this._selectedDomain,newPageIndex, this.pageSize);
  }

  private loadData(domain:string, pageIndex:number, pageSize:number){
    if (this._selectedDomain){
      console.log("loadData pageIndex=" + pageIndex +" pageSize="+pageSize);

      let sort:MotifQuerySort = this.buildQuerySort();

      this.usersService.getUsersList(domain, null, null, null, pageIndex, pageSize,  sort.encode(new HttpParams()).get('sort'), 'response', false).subscribe((response)=>{


        let results:MotifQueryResults = MotifQueryResults.fromHttpResponse(response);
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
        }
        this.currentPage = results.pageIndex;

      }, error=>{
        console.log("MotifPagedQueryInterceptor test query error: ", error);
      });

    }
  }

  private getUserListEx(domain:string, pageIndex:number, pageSize:number, sort:MotifQuerySort, filter:MotifQueryFilter):Promise<MotifQueryResults>{
    return new Promise<MotifQueryResults>((resolve,reject) => {
      let endpoint = String.Format(USERS_LIST_ENDPOINT, domain);
      this.motifQueryService.query(endpoint, pageIndex, pageSize, sort, filter).subscribe((queryResponse) => {
          console.log("Get Users List done: ",queryResponse);
          resolve(queryResponse);
        },reject);
    });
  }

  private calculatePageIndex(skip:number, take:number):number {
    return (skip/take)+1;
  }

  private buildQuerySort():MotifQuerySort {
    console.log("*****SORT ", this.sort);
    let querySort = new MotifQuerySort();
    if (this.sort){
      for (let i=0;i<this.sort.length;i++){
        let sortInfo = this.sort[i];
        if (sortInfo.dir && sortInfo.dir === "asc"){
          querySort.orderAscendingBy(sortInfo.field);
        } else if (sortInfo.dir && sortInfo.dir === "desc"){
          querySort.orderDescendingBy(sortInfo.field);
        }
      }
    }
    return querySort;
  }

  /**
   * Reload the list of users for the selected domain
   */
  public refreshData():void{
    this.loadData(this._selectedDomain, this.currentPage, this.pageSize);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.refreshData()
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    //TODO!!
}

  public doSort(){
    //this.gridView = process(orderBy(this.usersList, this.sort), { group: this.groups });
  }

  onSelectionChange(e: SelectionEvent) {
    this.selectionChange.emit(e);
  }

  onStatusChangeOKPressed(dataItem:any):void{
    this.toaster.info("Not yet implemented", "Attention Please", {
      positionClass: 'toast-top-center'
    });
  }

  onStatusChangeCancelPressed(dataItem:any):void {
  }
  
  onDeleteOKPressed(dataItem:any):void {
    this.toaster.info("Not yet implemented", "Attention Please", {
      positionClass: 'toast-top-center'
    });
  }

  onDeleteCancelPressed(dataItem:any):void {
  }

  onAddButtonPressed():void {
    this._slideDownEditor.show(true);
  }

  onEditorDismissButtonPressed():void{
    this.dismissNewUserEditor();
  }

  onEditorConfirmButtonPressed():void{  
    /*
    let domainName = this._selectedDomain.name;
    let userId = this.newUserModel.userId;
    let userIdInt = this.newUserModel.userIdInt;
    let msisdn = this.newUserModel.msisdn;
    let serial = this.newUserModel.serial;
    this.dismissNewUserEditor();
    this.usersService.createNewUser(domainName, userId, userIdInt, msisdn, serial, "PREACTIVE").then(()=>{
      //this.overlayPaneService.setVisible(false);
      this.toaster.success("User '"+userId+"' created successfully.", "New User");
      this.refreshData();
    }, (error)=>{
      console.log("New user error: ", error);
      //this.overlayPaneService.setVisible(false);
      this.toaster.error("User '"+userId+"' creation error: " + error, "New User");
    })
    */
  }

  dismissNewUserEditor(){
    this.newUserModel = {};
    this._slideDownEditor.show(false);
  }

  get statusButtonClass():string{
    return "btn status-activated";
  }

  public getStatusButtonClass(statusStr:string):string{
    if (statusStr && statusStr.toUpperCase()==="ACTIVE"){
      return "btn user-status-active";
    } else if (statusStr && statusStr.toUpperCase()==="PREACTIVE"){
      return "btn user-status-preactive";
    } else {
      return "";
    }
  }

  public getStatusButtonQuestion(statusStr:string):string{
    if (statusStr && statusStr.toUpperCase()==="ACTIVE"){
      return "Suspend?";
    } else if (statusStr && statusStr.toUpperCase()==="PREACTIVE"){
      return "Activate?";
    } else {
      return "";
    }
  }
}
