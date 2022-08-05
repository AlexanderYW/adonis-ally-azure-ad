/*
|--------------------------------------------------------------------------
| Ally Oauth driver
|--------------------------------------------------------------------------
|
| This is a dummy implementation of the Oauth driver. Make sure you
|
| - Got through every line of code
| - Read every comment
|
*/

import type { AllyUserContract, ApiRequestContract } from '@ioc:Adonis/Addons/Ally'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type {
  AADAccessToken,
  AADConfig,
  AADScopes,
  UserFields,
  UserFieldsAndToken,
  UserInfo,
} from '../types'
import { Oauth2Driver, ApiRequest, RedirectRequest } from '@adonisjs/ally/build/standalone'

/**
 * Driver implementation. It is mostly configuration driven except the user calls
 *
 * ------------------------------------------------
 * Change "AAD" to something more relevant
 * ------------------------------------------------
 */
export class AAD extends Oauth2Driver<AADAccessToken, AADScopes> {
  /**
   * The URL for the authority data
   *
   * Do not define query strings in this URL.
   */
  /**
   * The URL for the redirect request. The user will be redirected on this page
   * to authorize the request.
   *
   * Do not define query strings in this URL.
   */
  protected authorizeUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'

  /**
   * The URL to hit to exchange the authorization code for the access token
   *
   * Do not define query strings in this URL.
   */
  protected accessTokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

  /**
   * The URL to hit to get the user details
   *
   * Do not define query strings in this URL.
   */
  protected userInfoUrl = 'https://graph.microsoft.com/v1.0/me'

  /**
   * The param name for the authorization code. Read the documentation of your oauth
   * provider and update the param name to match the query string field name in
   * which the oauth provider sends the authorization_code post redirect.
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error. Read the documentation of your oauth provider and update
   * the param name to match the query string field name in which the oauth provider sends
   * the error post redirect
   */
  protected errorParamName = 'error_description'

  /**
   * Cookie name for storing the CSRF token. Make sure it is always unique. So a better
   * approach is to prefix the oauth provider name to `oauth_state` value. For example:
   * For example: "facebook_oauth_state"
   */
  protected stateCookieName = 'azuread_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state from.
   * Read the documentation of your oauth provider and update the param
   * name to match the query string used by the provider for exchanging
   * the state.
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for sending the scopes to the oauth provider.
   */
  protected scopeParamName = 'scope'

  /**
   * The separator indentifier for defining multiple scopes
   */
  protected scopesSeparator = ' '

  constructor(ctx: HttpContextContract, public config: AADConfig) {
    super(ctx, config)

    config.scopes = config.scopes || ['openid', 'profile', 'email', 'offline_access']

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState()

    // Perform stateless authentication. Only applicable for Oauth2 client
    this.stateless()
  }

  /**
   * Configuring the redirect request with defaults
   */
  protected configureRedirectRequest(request: RedirectRequest<AADScopes>): void {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['openid', 'profile', 'email', 'offline_access'])

    request.param('client_id', this.config.clientId)
    request.param('response_type', 'code')
    request.param('response_mode', 'query')
  }

  /**
   * Update the implementation to tell if the error received during redirect
   * means "ACCESS DENIED".
   */
  public accessDenied(): boolean {
    return this.ctx.request.input('error') === 'invalid_grant'
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string): ApiRequest {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the user info from the Google API
   */
  protected async getUserInfo(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<UserFields> {
    // User Info
    const userRequest = this.getAuthenticatedRequest(
      this.config.userInfoUrl || this.userInfoUrl,
      token
    )
    if (typeof callback === 'function') {
      callback(userRequest)
    }

    const userBody: UserInfo = await userRequest.get()

    return {
      id: userBody.id,
      nickName: userBody.id,
      displayName: userBody.displayName,
      avatarUrl: null,
      name: `${userBody.givenName}${userBody.surname ? ` ${userBody.surname}` : ''}`,
      email: userBody.mail ? (userBody.mail as string) : (null as null),
      emailVerificationState: 'unsupported' as const,
      original: userBody,
    }
  }

  /**
   * Processing the API client response. The child class can overwrite it
   * for more control
   */
  protected processClientResponse(client: ApiRequest, response: any): any {
    /**
     * Return json as it is when parsed response as json
     */
    if (client.responseType === 'json') {
      return response
    }

    // return parse(client.responseType === 'buffer' ? response.toString() : response)
  }

  /**
   * Get the user details by query the provider API. This method must return
   * the access token and the user details both. Checkout the google
   * implementation for same.
   *
   * https://github.com/adonisjs/ally/blob/develop/src/Drivers/Google/index.ts#L191-L199
   */
  public async user(
    callback?: (request: ApiRequest) => void
  ): Promise<AllyUserContract<AADAccessToken>> {
    const accessToken = await this.accessToken()

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if required)
     */
    const user: UserFields = await this.getUserInfo(accessToken.token, callback)

    /**
     * Write your implementation details here
     */
    return {
      ...user,
      token: accessToken,
    }
  }

  /**
   * Finds the user by the access token
   */
  public async userFromToken(token: string): Promise<UserFieldsAndToken> {
    const user: UserFields = await this.getUserInfo(token)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}
