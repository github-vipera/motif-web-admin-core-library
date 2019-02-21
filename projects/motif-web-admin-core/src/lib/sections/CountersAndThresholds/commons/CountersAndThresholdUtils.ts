import { String, StringBuilder } from 'typescript-string-operations';

export class CountersAndThresholdUtils {

    static buildServiceCatalogEntryPattern(channel: string, domain: string, application: string, service: string, operation: string): string {
        
        let ret = String.Format('/{0}', channel);

        if (domain) {
            ret = String.Format('{0}/{1}', ret, domain);
        }
        if (domain && application) {
            ret = String.Format('{0}/{1}', ret, application);
        }
        if (domain && application && service) {
            ret = String.Format('{0}/{1}', ret, service);
        }
        if (domain && application && service && operation) {
            ret = String.Format('{0}/{1}', ret, operation);
        }

        return ret;
        
    }

}