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


export interface RESTEntry {
  name: string;
  channel: string;
  enabled: boolean;
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
    return { name: "root", 
      channel: "REST", 
      enabled: true, 
      domain: "Default", 
      application: "vipera" , 
      valuesList: [
        { 
            value: "/rest",
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
    let parentNode = this.getNodeByURL(entry.parentURL, model);
    if (parentNode){
      parentNode.children.push(newNode);
    }
    return newNode;
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
      this._filterRegExp = new RegExp("^" + filter.split("*").join(".*") + "$");
    }
    this.applyFilter(this._model);
  }

  public get isFiltered(): boolean {
    return (this._filter!=null);
  }

  private applyFilter(model:TreeNode[]){
    console.log(">>>>>>>>> applyFilter called ", this._filter);
    if (!this._filter || !this._model){
      return;
    }
    //Scan recursive
    console.log(">>>>>>>>> applyFilter scan start ");
    for (let i=0;i<model.length;i++){
      let node:TreeNode = model[i];
      node.data.filtered = this.isNodeFiltered(node);
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
        let urlParts = this._URL.split("/");
        this._parentURL = urlParts.slice(0,urlParts.length-1).join("/");
        this._depth = urlParts.length;
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

  public getAttribute(attributeName: string): RESTEntryAttributeValue {
    return _.find( this._wrapped.valuesList, (attr)=>{
      if (attr.attribute.name===attributeName){
        return attr;
      }
    })
  }

}