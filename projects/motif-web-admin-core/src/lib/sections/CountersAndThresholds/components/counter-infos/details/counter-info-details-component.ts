import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { CounterInfoEntity } from '@wa-motif-open-api/counters-thresholds-service';
import { NGXLogger} from 'web-console-core'
import { Component, OnInit, Input } from '@angular/core';

const LOG_TAG = "[CounterInfoDetailsComponent]";

@Component({
  selector: 'wa-counter-info-details',
  styleUrls: [ './counter-info-details-component.scss' ],
  templateUrl: './counter-info-details-component.html'
})
export class CounterInfoDetailsComponent implements OnInit {

  @Input() dataItem: CounterInfoEntity;

  constructor(private logger: NGXLogger,
    private notificationCenter: WCNotificationCenter) {
  }

  ngOnInit() {
  }


}
