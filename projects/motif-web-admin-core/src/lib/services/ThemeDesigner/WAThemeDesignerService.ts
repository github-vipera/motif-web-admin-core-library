import { WAThemeDesignerToolbox } from './toolbox/wa-theme-designer-toolbox';
import { ThemeModelBuilder, ThemeModel, ThemeItem, ThemeGroup, ThemeColorItem } from './ThemeModel';
import { Injectable, Inject, Injector, ApplicationRef, ComponentFactoryResolver } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { DOCUMENT } from '@angular/common';


const LOG_TAG = '[WAThemeDesignerService]';

interface ColorItemDef {
  name: string;
  variableName: string;
}

@Injectable()
export class WAThemeDesignerService {

  private themeWrapper: any;
  private themeModel: ThemeModel;

    constructor(private logger: NGXLogger, @Inject(DOCUMENT) private document: any,
      private resolver: ComponentFactoryResolver,
      private injector: Injector,
      private app: ApplicationRef
    ){
      this.logger.debug("@Inject(DOCUMENT) private document ", document);
      this.themeWrapper = this.document.querySelector('app-root');
      this.logger.debug("this.themeWrapper:", this.themeWrapper);
    }

    private obj:any;


    public show(){
      let factory = this.resolver.resolveComponentFactory(WAThemeDesignerToolbox);
      let newNode = document.createElement('div');
      newNode.id = 'wa-theme-editor-container';
      this.document.body.appendChild(newNode);
      const ref = factory.create(this.injector, [], newNode);
      this.app.attachView(ref.hostView);
    }

}

