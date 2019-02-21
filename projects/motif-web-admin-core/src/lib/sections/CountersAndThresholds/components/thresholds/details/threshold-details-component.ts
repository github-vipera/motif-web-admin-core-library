import { ThresholdInfoEntity } from '@wa-motif-open-api/counters-thresholds-service';
import { NGXLogger} from 'web-console-core'
import { Component, OnInit, Input } from '@angular/core';

const LOG_TAG = "[ThresholdDetailsComponent]";

@Component({
  selector: 'wa-threshold-details',
  styleUrls: [ './threshold-details-component.scss' ],
  templateUrl: './threshold-details-component.html'
})
export class ThresholdDetailsComponent implements OnInit {

  @Input() dataItem: ThresholdInfoEntity;

  constructor(private logger: NGXLogger) {
  }

  ngOnInit() {
  }


}
