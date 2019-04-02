import { RESTEntry, RESTEntryAttribute, RESTEntryAttributeValue } from './model/rest-tree-table-model'

export class RESTTreeDataProviderMock {

    constructor() {}

    public getData() : RESTEntry[]{

        let ret:RESTEntry[] = [
            { name: "uno", 
              channel: "REST", 
              enabled: true, 
              domain: "Default", 
              application: "vipera" , 
              valuesList: [
                { 
                    value: "/rest/uno",
                    attribute : {
                        name: "URL",
                        type: "String"
                    } 
                }
              ]
            },
            { name: "due", 
              channel: "REST", 
              enabled: true, 
              domain: "Default", 
              application: "vipera" , 
              valuesList: [
                { 
                    value: "/rest/uno/due",
                    attribute : {
                        name: "URL",
                        type: "String"
                    } 
                }
              ]
            },           
            { name: "tre", 
              channel: "REST", 
              enabled: true, 
              domain: "Default", 
              application: "vipera" , 
              valuesList: [
                { 
                    value: "/rest/uno/tre",
                    attribute : {
                        name: "URL",
                        type: "String"
                    } 
                }
              ]
            },           
            { name: "quattro", 
              channel: "REST", 
              enabled: true, 
              domain: "Default", 
              application: "vipera" , 
              valuesList: [
                { 
                    value: "/rest/quattro",
                    attribute : {
                        name: "URL",
                        type: "String"
                    } 
                }
              ]
            }           
        ];
        return ret;
    }

}

/** 
 
            { name: "due", path: "rest/uno/due"},
            { name: "tre", path: "rest/uno/due/tre"},
            { name: "quattro", path: "rest/quattro"},
            { name: "cinque", path: "rest/quattro/cinque"},
            { name: "sei", path: "rest/quattro/sei"}

            */