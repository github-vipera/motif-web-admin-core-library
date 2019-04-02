

export interface ThemeItem {
  description: string
}

export class ThemeGroup implements ThemeItem {
  items: ThemeItem[];
  description: string;
}

export abstract class ThemeModel extends ThemeGroup {
  description: string;
  abstract exportTheme(): string;
}



const LOG_TAG = '[DefaultThemeModel]';

export class ThemeColorItem implements ThemeItem {

  private _value: string;

  public presets = [ '#00000000'];

  constructor(public name: string,
    public description: string,
    public cssPropertyName: string,
    public scssVariableName,
    private themeWrapper: any,
    private logger: NGXLogger) {
      this._value = this.getColorProperty(cssPropertyName);
  }

  public get value(){
    return this._value;
  }

  public set value(colorValue:string) {
    this._value = colorValue;
    this.themeWrapper.style.setProperty(this.cssPropertyName, colorValue);
    //console.log(">>>>> Set color value: ", colorValue);
  }

  private getColorProperty(variableName: string): string {
    var style = getComputedStyle(this.themeWrapper);
    var ret = style.getPropertyValue(variableName).trim();
    return ret;
  }


}


export class DefaultThemeModel implements ThemeModel {

  private themeWrapper: any;

  items: ThemeItem[] = [];
  description: "Theme Model";

  constructor(private logger: NGXLogger, private document: any){
    this.logger.debug(LOG_TAG, 'Initializing' );
    this.themeWrapper = this.document.querySelector('app-root');
    this.createModel();
  }

  private createModel(){
    this.items.push(this.createMainGroup());
    this.items.push(this.createToolbarGroup());
    this.items.push(this.createHeaderGroup());
    this.items.push(this.createFooterGroup());
    this.items.push(this.createGridGroup());
    this.items.push(this.createTabsGroup());
    this.items.push(this.createButtonsGroup());
    this.items.push(this.createComboboxGroup());
    this.items.push(this.createInputGroup());
  }

  private createMainGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Main";
    ret.items = [

      // Main Colors
      this.createColorItem('background', 'Main Background', '--main-background-color', '$main_background_color'),
        //Titles
        this.createColorItem('background', 'Title 1 Color', '--title-1-color', '$title1_color'),
    ];
    return ret;
  }


  private createHeaderGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Header";
    ret.items = [
      // Header Colors
      this.createColorItem('header', 'Header Background', '--header-background-color', '$header_background_color'),
      this.createColorItem('header', 'Header Color', '--header-color', '$header_description_color'),
      this.createColorItem('header', 'Header Hover', '--header-color-hover', '$header_description_hover_color')
    ];
    return ret;
  }

  private createFooterGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Footer";
    ret.items = [
      // Footer Colors
      this.createColorItem('footer', 'Footer Background', '--footer-background-color','$footer_background_color'),
      this.createColorItem('footer', 'Footer Color', '--footer-color','$footer_color')
    ];
    return ret;
  }


  private createGridGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Grid";
    ret.items = [
      // Grid Colors 
      this.createColorItem('grid', 'Grid Background', '--grid-background-color','$grid_background_color'),
      this.createColorItem('grid', 'Grid Color', '--grid-color', '$grid_color'),
      this.createColorItem('grid', 'Grid Border Color', '--grid-border-color', '$grid_border_color'),
      this.createColorItem('grid', 'Grid Header Color', '--grid-header-color', '$grid_header_color'),
      this.createColorItem('grid', 'Grid Header Border', '--grid-header-border-color', '$grid_header_border_color'),
      this.createColorItem('grid', 'Grid Hover Backgorund', '--grid-row-hover-background-color', '$grid_tr_hover_background_color'),
      this.createColorItem('grid', 'Grid Hover Color', '--grid-row-hover-color', '$grid_tr_hover_color'),
      this.createColorItem('grid', 'Grid Selected Background Color', '--grid-row-selected-background-color', '$grid_selected_row_color'),
      this.createColorItem('grid', 'Grid Selected Color', '--grid-row-selected-color', '$grid_selected_row'),
      this.createColorItem('grid', 'Grid Command Color', '--grid-command-color', '$grid_command_color'),
      this.createColorItem('grid', 'Grid Selected Row Command Color', '--grid-selected-row-command-color', '$grid_selected_row_command_color')
    ];
    return ret;
  }
  

  private createToolbarGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Main Toolbar";
    ret.items = [
      // Toolbar Colors
      this.createColorItem('mainToolbar', 'Background', '--nav-background-color', '$nav_background_color'),
      this.createColorItem('mainToolbar', 'Border', '--nav-border-color', '$nav_a_a_border_color'),
      this.createColorItem('mainToolbar', 'Color', '--nav-color', '$nav_color'),
      this.createColorItem('mainToolbar', 'Background Hover', '--nav-hover-background-color','$nav_hover_background_color'),
      this.createColorItem('mainToolbar', 'Color Hover', '--nav-hover-color','$nav_hover_color')
    ];
    return ret;
  }

  private createTabsGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Tabs";
    ret.items = [
      // Toolbar Colors
      this.createColorItem('tabs', 'Background', '--tab-background-color', '$tab_background_color'),
      this.createColorItem('tabs', 'Color', '--tab-color', '$tab_color'),
      this.createColorItem('tabs', 'Selected Background', '--tab-selected-background-color', '$tab_selected_background_color'),
      this.createColorItem('tabs', 'Selected Color', '--tab-selected-color', '$tab_selected_color'),
    ];
    return ret;
  }


  private createButtonsGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Buttons";
    ret.items = [
      // Toolbar Colors
      this.createColorItem('buttons', 'Background', '--button-background-color', '$button_background_color'),
      this.createColorItem('buttons', 'Color', '--button-color', '$button_color'),
      this.createColorItem('buttons', 'Border', '--button-border-color', '$button_border_color'),
      this.createColorItem('buttons', 'Hover Background', '--button-hover-background-color', '$button_hover_background_color'),
      this.createColorItem('buttons', 'Hover Color', '--button-hover-color', '$button_hover_color'),
      this.createColorItem('buttons', 'Hover Border', '--button-hover-border-color', '$button_hover_border_color'),
      this.createColorItem('buttons', 'Disabled Background', '--button-disabled-background-color', '$button_disabled_background_color'),
      this.createColorItem('buttons', 'Disabled Color', '--button-disabled-color', '$button_disabled_color'),
      this.createColorItem('buttons', 'Disabled Border', '--button-disabled-border-color', '$button_disabled_border_color')
    ];
    return ret;
  }

  private createComboboxGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Comboboxes";
    ret.items = [
      // Toolbar Colors
      this.createColorItem('combobox', 'Background', '--combobox-background-color', '$combobox_background_color'),
      this.createColorItem('combobox', 'Color', '--combobox-color', '$combobox_color'),
      this.createColorItem('combobox', 'Selection Background', '--combobox-selected-item-background-color', '$combobox_selected_item_background_color'),
      this.createColorItem('combobox', 'Selection Color', '--combobox-selected-item-color', '$combobox_selected_item_color'),
      this.createColorItem('combobox', 'Button Background', '--combobox-button-background-color', '$combobox_button_background_color'),
      this.createColorItem('combobox', 'Button Color', '--combobox-button-color', '$combobox_button_color')
    ];
    return ret;
  }

  private createInputGroup(): ThemeGroup {
    let ret = new ThemeGroup();
    ret.description = "Input";
    ret.items = [
      // Toolbar Colors
      this.createColorItem('input', 'Background', '--input-background-color', '$input_background_color'),
      this.createColorItem('input', 'Color', '--input-color', '$input_color'),
      this.createColorItem('input', 'Placeholder Color', '--input-placeholder-color', '$input_placeholder_color'),
      this.createColorItem('input', 'Border Color', '--input-border-color', '$input_border_color'),
      this.createColorItem('input', 'Focus Background', '--input-focus-background-color', '$input_focus_background_color'),
      this.createColorItem('input', 'Focus Color', '--input-focus-color', '$input_focus_color')
    ];
    return ret;
  }


  public exportTheme(): string {
    let retStr = "";
    for (var i=0; i < this.items.length;i++){
      const groupItem : ThemeGroup = this.items[i] as ThemeGroup;
      for(var k=0;k<groupItem.items.length;k++){
        const item:ThemeColorItem = groupItem.items[k] as ThemeColorItem;
        retStr += "\n" + item.scssVariableName +":" + item.value + ";";
      }
    }
    return retStr;
  }


  private createColorItem(name: string, description:string, cssPropertyName: string, scssVariableName:string): ThemeColorItem {
    return new ThemeColorItem(name, description, cssPropertyName, scssVariableName, this.themeWrapper, this.logger);
  }

}


import { Inject, destroyPlatform } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { DOCUMENT } from '@angular/common';

export class ThemeModelBuilder {

    constructor(private logger: NGXLogger, @Inject(DOCUMENT) private document: any){
      this.logger.debug(LOG_TAG, 'Initializing Theme Builder' );
    }

    public createModel(): ThemeModel {
      let model: ThemeModel = new DefaultThemeModel(this.logger, this.document);
      //console.log("createModel :", model);
      return model;
    }


}
