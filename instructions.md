The package has been configured successfully!

Make sure to first define the mapping inside the `contracts/ally.ts` file as follows.

```ts
import { AAD, AADConfig } from 'adonis-ally-azure-ad/build/standalone'

declare module '@ioc:Adonis/Addons/Ally' {
  interface SocialProviders {
    // ... other mappings
    AzureAD: {
      config: AADConfig
      implementation: AAD
    }
  }
}
```

```ts
const allyConfig: AllyConfig = {
  // ... other configs
  /*
  |--------------------------------------------------------------------------
  | AzureAD driver
  |--------------------------------------------------------------------------
  */
  AzureAD: {
    driver: 'AzureAD',
    authorizeUrl: Env.get('AAD_AUTHORIZE_ENDPOINT'),
    userInfoUrl: Env.get('AAD_USER_ENDPOINT'),
    accessTokenUrl: Env.get('AAD_TOKEN_ENDPOINT'),
    clientId: Env.get('AAD_CLIENT_ID'),
    clientSecret: Env.get('AAD_CLIENT_SECRET'),
    callbackUrl: `http://localhost:${process.env.PORT}/azuread/callback`,
    scopes: ['user.read', 'User.ReadBasic.All', 'openid', 'profile', 'email', 'offline_access'],
  },
}
```