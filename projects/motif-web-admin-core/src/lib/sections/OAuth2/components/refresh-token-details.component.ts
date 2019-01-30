import { NGXLogger} from 'web-console-core'
import { Component, OnInit, Input } from '@angular/core';
import { WCToasterService } from 'web-console-ui-kit'
import { DataResult } from '@progress/kendo-data-query';
import { Oauth2Service, AccessTokenList, RefreshToken } from '@wa-motif-open-api/oauth2-service'

const LOG_TAG = "[OAuth2Section] [RefreshTokenDetailsComponent]";
const REFRESH_TOKENS_LIST_ENDPOINT = "/oauth2/refreshTokens/{0}/accessTokens"

@Component({
  selector: 'wa-refresh-token-details',
  styleUrls: [ './refresh-token-details.component.scss' ],
  templateUrl: './refresh-token-details.component.html'
})
export class RefreshTokenDetailsComponent implements OnInit {

  @Input() public refreshToken: RefreshToken;

  //Data
  public accessTokenList: AccessTokenList = [];

  //Grid Options
  public gridView: DataResult;
  public type: 'numeric' | 'input' = 'numeric';

  constructor(private logger: NGXLogger,
    private oauth2Service: Oauth2Service,  
    private toaster: WCToasterService) {
  }

  ngOnInit() {
    this.refreshData();
  }

  private loadData(refreshToken:string){
    this.logger.debug(LOG_TAG, "loadData refreshToken=", refreshToken);

    this.oauth2Service.getAccessTokenList(refreshToken).subscribe((results)=>{

      this.accessTokenList = results;

      this.gridView = {
        data: this.accessTokenList,
        total: this.accessTokenList.length
      }

    }, error=>{
      this.logger.error(LOG_TAG, "loadData failed: ", error);
    });
}

  /**
   * Reload the list of access tokens for the selected refresh token
   */
  public refreshData():void{
    this.logger.debug(LOG_TAG, "refreshData");
    this.loadData(this.refreshToken.token);
  }
}
