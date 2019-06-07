import { Component, OnInit, OnDestroy } from '@angular/core';
import { EEHook } from './eehook/EEHook';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private _eeHook: EEHook = new  EEHook();

  title = 'motif-web-admin-core-library-test';

  constructor(){
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngAfterContentInit() {
  }

}
