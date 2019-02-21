import { NGXLogger} from 'web-console-core'
import { Component, OnInit, Input } from '@angular/core';
import { License } from '@wa-motif-open-api/license-management-service';
import { ClipboardService } from 'ngx-clipboard'
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';

const LOG_TAG = "[OAuth2Section] [RefreshTokenDetailsComponent]";
const REFRESH_TOKENS_LIST_ENDPOINT = "/oauth2/refreshTokens/{0}/accessTokens"

@Component({
  selector: 'wa-license-details',
  styleUrls: [ './license-details-components.scss' ],
  templateUrl: './license-details-components.html'
})
export class LicenseDetailsComponent implements OnInit {

  @Input() licenseItem : License;

  constructor(private logger: NGXLogger,
    private clipboardService: ClipboardService,
    private notificationCenter: WCNotificationCenter) {
  }

  ngOnInit() {
  }

  public copyToClipboard():void {
    let output = "Product Name=" +this.licenseItem.productName + "\n";
    output += "Version=" +this.licenseItem.productVersion + "\n";
    output += "Customer=" + this.licenseItem.customerName + "\n";
    output += "Email=" +this.licenseItem.customerEmail + "\n";
    output += "Issued=" + new Date(this.licenseItem.issueDate) + "\n";
    output += "Expiry=" + new Date(this.licenseItem.expiryDate) + "\n";
    output += "License Key=" + this.licenseItem.license;
    this.clipboardService.copyFromContent(output);
    this.showInfo("License Info", "The license information has been copied to the clipboard");
  }


      /**
     * Show Info Toast
     * @param title 
     * @param message 
     */
    private showInfo(title:string, message:string):void {
      this.notificationCenter.post({
        name: 'CopyLicenseClipboard',
        title: title,
        message: message,
        type: NotificationType.Info,
        closable: true
    });
}

}
