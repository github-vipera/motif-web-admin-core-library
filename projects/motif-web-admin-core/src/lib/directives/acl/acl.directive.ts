import { Directive, ElementRef, OnInit, OnDestroy, Input, Query } from '@angular/core';
import * as _ from  'lodash';
import { EACCES } from 'constants';

const LOG_TAG = "[AclDirective] ";

@Directive({
  selector: '[acl]'
})
export class AclDirective implements OnInit, OnDestroy {

 @Input("acl") actionList : Array<String> = [];

 private _observer: MutationObserver;
 private _changesLock:boolean;

 private curretACLList : Array<String> = [
     "pippo","pluto","paperino","minnie"
 ]

  constructor(private domElement: ElementRef) { 
    }

  ngOnInit(): void {
    this.observeForChanges();
    this.processNodes();
  } 

  private observeForChanges(){
    console.log(LOG_TAG + ">> observeForChanges called");
    this._observer = new MutationObserver((mutations) => {
        if (!this._changesLock){
            this.processNodes();
            console.log(LOG_TAG + ">> Mutations: ", mutations);
        }
    });
      
    this._observer.observe(this.domElement.nativeElement, {
        childList: true,
        subtree: true
    });
  }

  private processNodes(){
      this._changesLock = true;
    if (!this.check()){
        this.domElement.nativeElement.setAttribute("acl-disabled", true);
        this.domElement.nativeElement.setAttribute("disabled", "");
        this.disableInputs();
    }
    console.log(LOG_TAG + "Directive called for ", this.domElement);
    console.log(LOG_TAG +"test:", this.actionList);
    this._changesLock = false;
}

  disableInputs(){
      this.disableForSelector("input");
      this.disableForSelector("button");
      this.disableForSelector("label");
      this.disableForSelector("kendo-combobox");
  }

  disableForSelector(selector:string){
    let children = this.domElement.nativeElement.querySelectorAll(selector);
    console.log(LOG_TAG +"disableForSelector "+selector+" :", children);
    children.forEach(childElement => {
        childElement.setAttribute("disabled", "");
        this.domElement.nativeElement.setAttribute("acl-disabled", true);
    });
  }

  ngOnDestroy(): void {
  }

  private check():boolean {
    return _.isEqual(_.intersection(this.curretACLList,this.actionList), this.actionList);
  }

}

