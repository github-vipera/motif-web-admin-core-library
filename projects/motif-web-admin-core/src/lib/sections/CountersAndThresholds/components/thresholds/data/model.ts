import { CountersAndThresholdUtils } from './../../../commons/CountersAndThresholdUtils';
import { ThresholdInfoEntity } from '@wa-motif-open-api/counters-thresholds-service';
import * as _ from 'lodash';

export class ThresholdsInfosModel {


    private _data: Array<ThresholdInfoEntity>;

    constructor(){
    }   

    public close(){
        this._data = null;
    }

    public loadData(data: Array<ThresholdInfoEntity>) {
        this._data = _.forEach(data, (element: ThresholdInfoEntity) => {
            if (element.created) {
                element.created = new Date(element.created);
            }
        });

    }

    public get data(): Array<ThresholdInfoEntity> {
        return this._data;
    }

}