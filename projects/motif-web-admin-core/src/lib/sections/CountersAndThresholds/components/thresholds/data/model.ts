import { CountersAndThresholdUtils } from './../../../commons/CountersAndThresholdUtils';
import { ThresholdInfoEntityList, ThresholdInfoEntity } from '@wa-motif-open-api/counters-thresholds-service';
import * as _ from 'lodash';

export class ThresholdsInfosModel {


    private _data: ThresholdInfoEntityList;

    constructor(){
    }   

    public close(){
        this._data = null;
    }

    public loadData(data: ThresholdInfoEntityList) {
        this._data = _.forEach(data, (element: ThresholdInfoEntity) => {
            if (element.created) {
                element.created = new Date(element.created);
            }
        });

    }

    public get data(): ThresholdInfoEntityList {
        return this._data;
    }

}