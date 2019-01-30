export interface MobileApplicaton {
    created : Date,
    latestVersion : string,
    forbiddenVersion : string,
    downloadUrl : string,
    lastAppCheck : Date,
    name: string,
    dirty: boolean,
    isNew: boolean
}