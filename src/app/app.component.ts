import { Component, OnInit, OnDestroy } from '@angular/core';
import { WCTopBarService, WCTopBarItem, AuthService, WCTopBarLocation } from 'web-console-core';
import { TopMenuComponent, TopInfoComponent, TopLogoComponent } from 'motif-web-admin-core';
import { WAThemeDesignerService } from 'motif-web-admin-core';
import { HostListener } from '@angular/core';
import { EEHook } from './eehook/EEHook';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private _eeHook: EEHook = new  EEHook();

  title = 'motif-web-admin-core-library-test';

  constructor(private topBarService: WCTopBarService,
              private authService: AuthService,
              private themeDesignerService: WAThemeDesignerService){
  }

  ngOnInit() {
    this.topBarService.registerItem(new WCTopBarItem('appInfo', TopInfoComponent), WCTopBarLocation.Left);
    this.topBarService.registerItem(new WCTopBarItem('mainMenu', TopMenuComponent), WCTopBarLocation.Right);
    this.topBarService.registerItem(new WCTopBarItem('logoTop', TopLogoComponent), WCTopBarLocation.Center);  
  }

  /*
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    this._eeHook.processKeyEvent(event);
  }
  */

  ngOnDestroy() {
  }

  ngAfterContentInit() {
  }

}
