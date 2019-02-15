import { Color, ColorEvent } from 'ngx-color';
import { DefaultThemeModel, ThemeModelBuilder, ThemeModel } from '../ThemeModel';
import { Component, Input, ViewEncapsulation, Inject, ViewChild, ElementRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { DOCUMENT } from '@angular/common';
import { WAThemeDesignerColorPickerEvent } from './color-picker-field-component/wa-theme-designer-color-picker';


@Component({
  selector: 'wa-theme-designer-toolbox',
  templateUrl: './wa-theme-designer-toolbox.html',
  styleUrls: ['./wa-theme-designer-toolbox.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WAThemeDesignerToolbox {

  title = 'motif-web-admin-core-library-test';
  display = true;
  myClassName = "wa-theme-editor-toolbox";

  // Current editing item
  public currentEditingColor: string;
  _currentEditingItemEvent: WAThemeDesignerColorPickerEvent;

  @Input() themeModel: ThemeModel;

  @ViewChild("op") overlayPanel: any;
  @ViewChild("hiddenInput") hiddenInput:ElementRef;

  constructor(private logger: NGXLogger, @Inject(DOCUMENT) private document: any){
  }

  ngOnInit() {
    this.themeModel = new ThemeModelBuilder(this.logger, this.document).createModel();
  }


  ngOnDestroy() {
  }

  onDownloadClick(event){
    const theme = this.themeModel.exportTheme();
    console.log("Theme: ", theme);
    this.saveToFile('theme.scss', theme);
  }

  saveToFile(filename:string, data:string) {
    var blob = new Blob([data], {type: 'text/csv'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
  }

  handlePickerColorChange(event: ColorEvent){
    this._currentEditingItemEvent.picker.colorRaw = event.color;
  }

  onPickerButtonClick(event:WAThemeDesignerColorPickerEvent){
    this.currentEditingColor = event.picker.color;
    this._currentEditingItemEvent = event;
    this.hiddenInput.nativeElement.focus();
    this.overlayPanel.show(this._currentEditingItemEvent.sourceEvent, this._currentEditingItemEvent.target.nativeElement);
  }

  onHiddenInputBlur(event){
    this.overlayPanel.hide();
  }

}
