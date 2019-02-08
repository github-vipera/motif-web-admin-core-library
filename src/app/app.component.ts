import { Component, OnInit, OnDestroy } from '@angular/core';
import { WCTopBarService, WCTopBarItem, AuthService } from 'web-console-core';
import { TopMenuComponent } from 'motif-web-admin-core';
import { WAThemeDesignerService } from 'motif-web-admin-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'motif-web-admin-core-library-test';

  constructor(private topBarService: WCTopBarService,
              private authService: AuthService,
              private themeEditorService: WAThemeDesignerService){
  }

  ngOnInit() {
    this.topBarService.registerItem(new WCTopBarItem('mainMenu', TopMenuComponent));
  }


  ngOnDestroy() {
  }

  ngAfterContentInit() {
    this.themeEditorService.show();
  }

}
