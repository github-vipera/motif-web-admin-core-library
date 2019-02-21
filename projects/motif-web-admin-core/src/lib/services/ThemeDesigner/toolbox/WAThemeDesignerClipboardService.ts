import { Injectable } from '@angular/core';

@Injectable()
export class WAThemeDesignerClipboardService {

  private _value:string;

  constructor() { }

  public setValue(value:string){
    this._value = value;
  }

  public getValue():string {
    return this._value;
  }

}
