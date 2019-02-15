import { WAThemeDesignerClipboardService } from './../WAThemeDesignerClipboardService';
import { CSSColorHelper } from './helpers/CSSColorHelper';
import { Component, ViewEncapsulation, ViewChild, Output, Input, ElementRef, EventEmitter } from '@angular/core';
import { ColorEvent, Color,  RGBA } from 'ngx-color';
import * as __color_string from 'color-string';
import { ThemeColorItem } from '../../ThemeModel';

const colorString = __color_string;

export interface WAThemeDesignerColorPickerEvent {
  colorItem: ThemeColorItem,
  picker: WAThemeDesignerColorPicker,
  sourceEvent: any,
  target: ElementRef
}

@Component({
  selector: 'wa-theme-designer-color-picker',
  templateUrl: './wa-theme-designer-color-picker.html',
  styleUrls: ['./wa-theme-designer-color-picker.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WAThemeDesignerColorPicker {

  private _colorRaw: Color;

  @Input() label:string;
  @Input() colorItem: ThemeColorItem;

  @ViewChild("pickerButton") pickerButton:ElementRef;
  @ViewChild("colorPanel") colorPanel:any;

  @Output() pickerButtonClick:EventEmitter<WAThemeDesignerColorPickerEvent> = new EventEmitter<WAThemeDesignerColorPickerEvent>();

  constructor(private clipboardService: WAThemeDesignerClipboardService){
  }

  ngOnInit() {
  }


  ngOnDestroy() {
  }

  public get colorRaw(): Color {
    return this._colorRaw;
  }

  public set colorRaw(value: Color){
    this._colorRaw = value;
    this.fireChanges();
  }

  public get color():string {
    let ret = CSSColorHelper.toCSSString(this.colorRaw);
    return ret;
  }

  @Input()
  public set color(value:string) {
    if (value){
      let colorComp = colorString.get(value);
      let hexValue = colorString.to.hex(colorComp.value);
      let rgbaValue = colorString.to.rgb(colorComp.value);
      let hslValue = colorString.to.hsl(colorComp.value);
      this.colorRaw = {
        hex: hexValue,
        rgb: {
          r: colorComp.value[0],
          g: colorComp.value[1],
          b: colorComp.value[2],
          a: colorComp.value[3]
        },
        hsl: {
          h: 0,
          l: 0,
          s: 0,
          a: 0
        },
        hsv: {
          a:0,
          h:0,
          s:0,
          v:0
        },
        oldHue: 0,
        source: ""
      }
    }
    this.fireChanges();
  }

  public get hex():string {
    if (this.colorRaw){
      return this.colorRaw.hex;
    } else {
      return "";
    }
  }

  onInputDblClick(event){
    this.emitPickerEvent(event);
  }

  onPickerButtonClick(event){
    this.emitPickerEvent(event);
  }

  private emitPickerEvent(event){
    this.pickerButtonClick.emit({
      colorItem: this.colorItem,
      picker: this,
      sourceEvent: event,
      target: this.pickerButton
    });
  }

  public clipboardCopy(){
    console.log("clipboardCopy called");
  }

  public clipboardPaste(){
    console.log("clipboardCopy called");
  }

  onPickerCopyButtonClick(event){
    this.clipboardService.setValue(this.color);
  }

  onPickerPasteButtonClick(event){
    if (this.clipboardService.getValue() && this.clipboardService.getValue().length>0){
      this.color = this.clipboardService.getValue();
    }
  }

  private fireChanges(){
    if (this.colorItem){
      this.colorItem.value = this.color;
    }
  }


}
