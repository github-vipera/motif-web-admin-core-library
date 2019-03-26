import { enableProdMode } from '@angular/core';
import { TreeNode } from "primeng/api";
import * as _uuidv1 from "uuid/v1";
import * as _ from 'lodash'

const uuidv1 = _uuidv1;

export interface RESTEntryAttribute {
  name: string;
  type: string;
}

export interface RESTEntryAttributeValue {
  value: any;
  attribute: RESTEntryAttribute
}

export interface URLInfo {
  url: string;
  parentURL: string;
  depth: number;
}

export enum RESTEntryStatus {
  Enabled = 'Enabled',
  Disabled  = 'Disabled',
  NotApplicable = 'NotApplicable',
  Unknown = 'Unknown'
}

export interface RESTEntry {
  name: string;
  channel: string;
  enabled: boolean;
  status: RESTEntryStatus;
  domain: string;
  application: string;
  valuesList: RESTEntryAttributeValue[]
}

export class RESTTreeTableModel {
  private _model: TreeNode[] = [];
  private _rootNode: TreeNode;
  
  private _filter: string;
  private _filterRegExp: RegExp;

  constructor() {}

  public close() {
    this._model = null;
  }

  private buildNode(restEntry: RESTEntryWrapper,
    leaf?: boolean
  ): TreeNode {
    // Set the icon name
    let iconName = "pi-globe";

    return {
      data: {
        name: restEntry.name,
        url: restEntry.URL,
        domain: restEntry.domain,
        application: restEntry.application,
        enabled: restEntry.enabled,
        status: restEntry.status,
        filtered: this.isEntryFiltered(restEntry),
        leaf: leaf,
        icon: "pi-bell",
        selectable: true,
        nodeIcon: iconName,
        nodeIconStyle: "color:blue;",
        id: uuidv1(),
        restEntry: restEntry
      },
      expanded: true,
      children: []
    };
  }

  private buildRootEntry(): RESTEntry {
    return { name: "", 
      channel: "REST", 
      enabled: true, 
      domain: "", 
      application: "" , 
      status: RESTEntryStatus.NotApplicable,
      valuesList: [
        { 
            value: "/",
            attribute : {
                name: "URL",
                type: "String"
            } 
        }
      ]
    }    
  }

  private rebuildModel(restCatalog: RESTEntry[]): void {

    // Create the Rest Entry List
    let entries:RESTEntryWrapper[] = [];
    restCatalog.forEach(item => {
      entries.push(new RESTEntryWrapper(item));
    });
    // Sort entries by depth
    entries = _.orderBy(entries, ['depth'],['asc']); // Use Lodash to sort array by 'name'
    
    
    // create the temporary model
    let tempModel = [];

    //Create the root node
    this._rootNode = this.buildNode(new RESTEntryWrapper(this.buildRootEntry()), false);
    // add the root node
    tempModel.push(this._rootNode);

    // now build the nodes
    entries.forEach(entry => {
      this.buildNodeForEntry(entry, tempModel);
    });
    

    // switch the current model
    this._model = tempModel;

    console.log("Current model: ", this._model);
    
  }

  buildNodeForEntry(entry: RESTEntryWrapper, model: TreeNode[]): TreeNode {
    let newNode = this.buildNode(entry, false);
    let parentNode = this.getParentNodeByURL(entry.parentURL, model);
    if (parentNode){
      parentNode.children.push(newNode);
    }
    return newNode;
  }

  getParentNodeByURL(url:string, model: TreeNode[]): TreeNode {
    let ret:TreeNode = null;
    if (url.length==0){
      return null;
    }
    let urlInfo = RESTTreeTableModel.urlInfo(url);
    let parentNode = this.getNodeByURL(urlInfo.parentURL, model);
    if (parentNode){
      return parentNode;
    } else {
      return this.getParentNodeByURL(urlInfo.parentURL, model);
    }
  }


  getNodeByURL(url:string, model: TreeNode[]): TreeNode {
    let ret:TreeNode = null;
    for (let i=0;i<model.length;i++){
      let node:TreeNode = model[i];
      if (node.data["url"] && node.data["url"]===url){
        ret = node;
      } else if (node.children && node.children.length > 0) {
        ret = this.getNodeByURL(url, node.children);
      }
      if (ret){
        return ret;
      }
    }
    return ret;
  }

  public loadData(restTree: any) {
    this.rebuildModel(restTree);
  }

  public get model(): TreeNode[] {
    return this._model;
  }

  public setFilter(filter:string){
    if (!filter || filter.length==0 || filter===this._filter){
      this._filter = null;
    } else {
      this._filter = filter;
      let regexpFilterStr = filter + '*.';
      this._filterRegExp = new RegExp(regexpFilterStr);
    }
    this.applyFilter(this._model);
  }

  public get isFiltered(): boolean {
    return (this._filter!=null);
  }

  private applyFilter(model:TreeNode[]){
    if (!this._filter || !this._model){
      return;
    }
    //Scan recursive
    for (let i=0;i<model.length;i++){
      let node:TreeNode = model[i];
      node.data.filtered = this.isNodeFiltered(node);
      console.log("Node filtered ", node.data.filtered, node.data );
      if (node.children && node.children.length > 0) {
        this.applyFilter(node.children);
      }
    }
  }

  private isEntryFiltered(entry:RESTEntryWrapper):boolean{
    return(this._filterRegExp!=null && this._filterRegExp.test(entry.URL));
  }

  private isNodeFiltered(node:TreeNode):boolean{
    return (this._filterRegExp && this._filterRegExp.test(node.data.url));
  }

  public static urlInfo(url:string): URLInfo {
    let urlParts = url.split("/");
    let parentURL = urlParts.slice(0,urlParts.length-1).join("/");
    if (parentURL.length==0){
      parentURL = "/";
    }
    return {
      url : url,
      parentURL : parentURL,
      depth: urlParts.length
    }
  }



}

class RESTEntryWrapper {
  
  _wrapped:RESTEntry;
  _URL : string;
  _parentURL : string;
  _depth : number;


  constructor(entry:RESTEntry){
    this._wrapped = entry;
    this.buildURLInfo();
  }

  private buildURLInfo(){
    //extract URL and ParentURL
    let urlAttr = this.getAttribute("URL");
    if (urlAttr){
      this._URL = urlAttr.value;
      if (this._URL){
        let urlInfo = RESTTreeTableModel.urlInfo(this._URL);
        this._parentURL = urlInfo.parentURL
        this._depth = urlInfo.depth;
      }
    }
  }

  public get URL(): string {
    return this._URL;
  }

  public get parentURL(): string {
    return this._parentURL;
  }

  public get enabled(): boolean {
    return this._wrapped.enabled;
  }

  public get channel():string {
    return this._wrapped.channel;
  }

  public get name():string {
    return this._wrapped.name;
  }

  public get domain(): string {
    return this._wrapped.domain;
  }

  public get application(): string {
    return this._wrapped.application;
  }

  public get entry():RESTEntry {
    return this._wrapped;
  }

  public get depth(): number {
    return this._depth;
  }

  public get status():RESTEntryStatus {
    if (this._wrapped.status){
      return this._wrapped.status;
    } else {
      return (this.enabled ? RESTEntryStatus.Enabled : RESTEntryStatus.Disabled);
    }
  }

  public getAttribute(attributeName: string): RESTEntryAttributeValue {
    return _.find( this._wrapped.valuesList, (attr)=>{
      if (attr.attribute.name===attributeName){
        return attr;
      }
    })
  }

}