import { CountersAndThresholdUtils } from './../../../commons/CountersAndThresholdUtils';
import { CounterInfoEntityList, CounterInfoEntity } from '@wa-motif-open-api/counters-thresholds-service';
import * as _ from 'lodash';

export class CounterInfosModel {

    private _data: CounterInfoEntityList;

    constructor(){

    }   

    public close(){
        this._data = null;
    }

    public loadData(data: CounterInfoEntityList) {
        this._data = _.forEach(data, (element: CounterInfoEntity) => {
            if (element.created) {
                element.created = new Date(element.created);
            }
            element["pattern"] = this.buildPatternForItem(element);
        });

    }

    private buildPatternForItem(item: CounterInfoEntity): string {
        return CountersAndThresholdUtils.buildServiceCatalogEntryPattern(item.channel, 
            item.domain, 
            item.application, 
            item.service, 
            item.operation);
    }

    public get data(): CounterInfoEntityList {
        return this._data;
    }

}