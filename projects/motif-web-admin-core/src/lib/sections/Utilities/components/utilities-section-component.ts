import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { PluginView } from 'web-console-core';

const LOG_TAG = '[UtilitiesSection]';

@Component({
    selector: 'wa-utilities-section',
    styleUrls: ['./utilities-section.component.scss'],
    templateUrl: './utilities-section.component.html'
})
@PluginView('Utilities', {
    iconName: 'wa-ico-toolbox-big',
    userData: {
        acl: {
            permissions: ['com.vipera.osgi.core.platform.api.rest.PlatformApi:READ:getDomains',
                            'com.vipera.osgi.core.platform.api.rest.UserMgrApi:READ:getUsersList',
                            'com.vipera.osgi.foundation.otp.api.rest.OtpApi:READ:getOtpList']
        }
    }
})
export class UtilitiesSectionComponent implements OnInit {

    constructor(private logger: NGXLogger) {}

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

}
