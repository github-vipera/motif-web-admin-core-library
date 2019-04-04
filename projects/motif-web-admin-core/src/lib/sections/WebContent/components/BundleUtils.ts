import { BundleStatus, ClusterBundleStatus } from '@wa-motif-open-api/web-content-service';

export enum PublishingStatus {
    Published = 'PUBLISHED',
    Unpublished = 'UNPUBLISHED',
    Unpublishing = 'UNPUBLISHING',
    Publishing = 'PUBLISHING',
    Error = 'ERROR',
    Unknown = 'UNKNOWN'
}


export class BundleUtils {

    public static buildSyntheticStatus(statusInfo: BundleStatus): PublishingStatus {
        let published: number = 0;  
        let unpublished: number = 0;  
        let inError: number = 0;
        let publishing: number = 0;  
        let unpublishing: number = 0;  
        if (statusInfo.status){
            for (let i=0;i<statusInfo.status.length;i++){
                const clusterStatus:ClusterBundleStatus = statusInfo.status[i];
                if (clusterStatus.status === PublishingStatus.Unpublished) {
                    unpublished++;
                }
                if (clusterStatus.status === PublishingStatus.Published) {
                    published++;
                }
                if (clusterStatus.status === PublishingStatus.Publishing) {
                    publishing++;
                }
                if (clusterStatus.status === PublishingStatus.Unpublishing) {
                    unpublishing++;
                }
                if ((clusterStatus.status === PublishingStatus.Error)||(clusterStatus.status === PublishingStatus.Unknown)) {
                    inError++;
                }
            }
        }
        //this.logger.debug(LOG_TAG, 'buildSyntheticStatus (published count vs unpublished count): ', published, unpublished);
        if ((published===0) && (unpublished > 0) && (publishing==0) && (unpublishing==0) && (inError==0) ) {
            return PublishingStatus.Unpublished;
        } else if ((publishing > 0) && (inError==0) ) {
            return PublishingStatus.Publishing;
        } else if ((unpublishing > 0) && (inError==0) ) {
            return PublishingStatus.Unpublishing;
        } else if ((published > 0) && (inError==0) && (publishing==0) && (unpublishing==0))  {
            return PublishingStatus.Published;
        } else {
            return PublishingStatus.Error;
        }
    }
}