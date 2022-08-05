import type { LiteralStringUnion } from '@ioc:Adonis/Addons/Ally'

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

export type UserFields = {
  id: string
  avatarUrl: string | null
  nickName: string
  displayName?: string | undefined
  name: string
  email: string | null
  emailVerificationState: 'verified' | 'unverified' | 'unsupported'
  original: UserInfo | null
}

export interface UserFieldsAndToken extends UserFields {
  token: {
    token: string
    type: const
  }
}
