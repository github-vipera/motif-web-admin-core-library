import { Injectable, Inject } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { GUI } from "dat-gui";
import { DOCUMENT } from '@angular/common';


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
