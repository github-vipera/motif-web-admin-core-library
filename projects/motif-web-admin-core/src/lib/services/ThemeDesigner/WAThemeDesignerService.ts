import { Injectable, Inject } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { GUI } from "dat-gui";
import { DOCUMENT } from '@angular/common';

import * as dat from 'dat.gui'

const LOG_TAG = '[WAThemeDesignerService]';

interface ColorItemDef {
  name: string;
  variableName: string;
}

@Injectable()
export class WAThemeDesignerService {

  private initialized: boolean;
  private themeWrapper: any;
  private gui:GUI;

    constructor(private logger: NGXLogger, @Inject(DOCUMENT) private document: any){
      console.log("@Inject(DOCUMENT) private document ", document);
      this.themeWrapper = this.document.querySelector('app-root');
      console.log("this.themeWrapper:", this.themeWrapper);
    }

    private obj:any;

    public show(){
        this.logger.debug(LOG_TAG, 'show called' );
      if (!this.initialized) {
        this.gui = new dat.default.GUI({name: "Theme Designer", width: 400, closed: false, autoPlace: true, hideable:true });
        this.gui.useLocalStorage = true;

        this.obj = {
          main: {
            "Background": "#ffae23",
            "Color" : "#ffae23",
            "Body" : "#ffae23",
            "Section" : "#ffae23"
          },
            header: {
                "Background": this.getColorProperty('--headerBackground'),
                "Color" : this.getColorProperty('--headerColor'),
                "ColorHover" : this.getColorProperty('--headerColorHover'),
            },
            Export: () =>{ alert("TODO!!"); console.log("this.obj:",this.obj)}
          };

          this.createFolder(this.gui, 'Main', [
            { name: 'Background', variableName: '--mainBackgroundColor' },
            { name: 'Color', variableName: '--mainColor' },
            { name: 'Body', variableName: '--bodyBackgroundColor' },
            { name: 'Section', variableName: '--sectionBackgroundColor'}
          ], this.obj.main);

          this.createFolder(this.gui, 'Header', [
            { name: 'Background', variableName: '--headerBackground' },
            { name: 'Color', variableName: '--headerColor' },
            { name: 'ColorHover', variableName: '--headerColorHover' }
          ], this.obj.header);


          this.gui.add(this.obj, "Export");
          this.initialized = true;

          this.gui.open();
      } else {
        this.logger.debug(LOG_TAG, 'show for ', this.gui);
        if (this.gui.closed){
          this.gui.open();
        } else {
          this.gui.close();
        }
      }

          this.logger.debug(LOG_TAG, 'show done' );

    }

    private createFolder(gui:GUI, folderName:string, colors:ColorItemDef[], target: any){
      let f1 = gui.addFolder(folderName);
      for (var i=0;i<colors.length;i++){
        let colorItemDef: ColorItemDef = colors[i];
        f1.addColor(target, colorItemDef.name).onChange((value) => {
          this.themeWrapper.style.setProperty(colorItemDef.variableName, value);
        });
      }
    }

    private getColorProperty(variableName: string): string {
      return this.themeWrapper.style.getProperty(variableName);
    }
}
