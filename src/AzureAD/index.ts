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

import type {
  AllyUserContract,
  ApiRequestContract,
  LiteralStringUnion,
} from '@ioc:Adonis/Addons/Ally'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Oauth2Driver, ApiRequest, RedirectRequest } from '@adonisjs/ally/build/standalone'

/**
 * Define the access token object properties in this type. It
 * must have "token" and "type" and you are free to add
 * more properties.
 *
 * ------------------------------------------------
 * Change "AAD" to something more relevant
 * ------------------------------------------------
 */
export type AADAccessToken = {
  token: string
  type: string
  token_type: string
  scope: string
  expires_in: number
  ext_expires_in: number
  access_token: string
  refresh_token: string
  id_token: string
}

/**
 * Define a union of scopes your driver accepts. Here's an example of same
 * https://github.com/adonisjs/ally/blob/develop/adonis-typings/ally.ts#L236-L268
 *
 * ------------------------------------------------
 * Change "AAD" to something more relevant
 * ------------------------------------------------
 */
export type AADScopes = string

/**
 * Define the configuration options accepted by your driver. It must have the following
 * properties and you are free add more.
 *
 * ------------------------------------------------
 * Change "AAD" to something more relevant
 * ------------------------------------------------
 */
export type AADConfig = {
  driver: 'AzureAD'
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string
  scopes?: LiteralStringUnion<AADScopes>[]
}

const SCOPE_PREFIXES = {
  'https://graph.microsoft.com': [
    'email',
    'user.read',
    'User.Read.All',
    'User.ReadBasic.All',
    'user.readwrite',
    'user.readwrite.all',
    'user.manageidentities.all',
    'useractivity.readwrite.createdbyapp',
    'people.read',
    'people.read.all',
    'presence.read',
    'presence.read.all',
    'contacts.read',
    'contacts.readwrite',
    'mail.read',
    'mail.readbasic',
    'mail.readwrite',
    'mail.write',
    'mail.send',
    'mailboxsettings.read',
    'calendars.read',
    'calendars.read.shared',
    'calendars.write',
    'calendars.readwrite',
    'calendars.readwrite.shared',
    'files.read',
    'files.read.all',
    'files.readwrite',
    'files.readwrite.all',
    'sites.read.all',
    'sites.readwrite.all',
    'directory.read',
    'directory.read.all',
    'directory.write',
    'directory.readwrite.all',
    'directory.accessAsUser.all',
    'application.read.all',
    'application.readwrite.all',
    'tasks.read',
    'tasks.readwrite',
    'ediscovery.read.all',
    'ediscovery.readwrite.all',
    'group.read.all',
    'group.read.writeall',
    'group.readwrite.all',
    'groupmember.read.all',
    'groupmember.readwrite.all',
    'policy.read.all',
    'policy.readwrite.all',
    'policy.readwrite.applicationconfiguration',
    'approleassignment.readwrite.all',
    'identityriskyuser.read.all',
    'identityriskevent.read.all',
    'team.create',
    'team.read',
    'team.readbasic.all',
    'teamsettings.read.all',
    'teamsettings.readwrite.all',
    'teamstab.read.all',
    'teamstab.readwrite.all',
    'teamsettings.readwriteforteam',
    'teamsappinstallation.readforteam',
    'teamsappinstallation.readwriteforteam',
    'chat.create',
    'chat.read',
    'chat.readbasic',
    'chat.readwrite',
    'chatmember.read',
    'chatmember.readwrite',
    'chatmessage.send',
    'channel.create',
    'channel.read.all',
    'channel.readbasic.all',
    'channelsettings.read.all',
    'channelsettings.readwrite.all',
    'channelmessage.send',
    'channelmessage.read.all',
    'channelmember.read.all',
    'channelmessage.readwrite',
    'externalitem.read.all',
  ],
  'https://outlook.office.com': ['mail.read', 'mail.send', 'mail.write'],
  'https://vault.azure.net': ['user.read', 'contacts.read'],
}

export type UserInfo = {
  '@odata.context': string
  '@odata.id': string
  'businessPhones': string[]
  'displayName': string
  'givenName': string
  'jobTitle': string
  'mail': string
  'mobilePhone': string
  'officeLocation': string
  'preferredLanguage'?: any
  'surname': string
  'userPrincipalName': string
  'id': string
}

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
  }

  /**
   * Configuring the redirect request with defaults
   */
  protected configureRedirectRequest(request: RedirectRequest<AADScopes>) {
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
  public accessDenied() {
    return this.ctx.request.input('error') === 'invalid_grant'
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string) {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the user info from the Google API
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
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
    const user = await this.getUserInfo(accessToken.token, callback)

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
  public async userFromToken(token: string) {
    const user = await this.getUserInfo(token)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}
