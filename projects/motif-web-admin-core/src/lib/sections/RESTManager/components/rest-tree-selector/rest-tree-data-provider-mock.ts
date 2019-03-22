
export interface RESTDataItem {
    path: string;
    name: string;
}

export class RESTTreeDataProviderMock {

    constructor() {}

    public getData() : RESTDataItem[]{

        let ret:RESTDataItem[] = [
            { name: "uno", path: "rest/uno"},
            { name: "due", path: "rest/uno/due"},
            { name: "tre", path: "rest/uno/due/tre"},
            { name: "quattro", path: "rest/quattro"},
            { name: "cinque", path: "rest/quattro/cinque"},
            { name: "sei", path: "rest/quattro/sei"}
        ];
        return ret;
    }

}

