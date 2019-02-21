import { CSSColorHelper } from '../helpers/CSSColorHelper';
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Color } from 'ngx-color';

@Component({
  selector: 'wa-theme-designer-color-picker-input-field',
  templateUrl: './wa-theme-designer-color-picker-input-field.html',
  styleUrls: ['./wa-theme-designer-color-picker-input-field.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WAThemeDesignerColorPickerInputField {

  @Input() color: Color;
  @Input() public text: string;

  @Output() public dblclick: EventEmitter<any> = new EventEmitter();

  constructor(){
  }

  ngOnInit() {
  }


  ngOnDestroy() {
  }

  public get colorStr(): string {
    return this.colorCSS;
  }

  public get colorCSS(): string {
    return CSSColorHelper.toCSSString(this.color);
  }

  public get textColorCSS(): string {
    return CSSColorHelper.invertColor(this.color);
  }

  onInputDblClick(event) {
     this.dblclick.emit(event);
  }

}
