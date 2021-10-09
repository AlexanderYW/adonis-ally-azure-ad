import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AADProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const Ally = this.app.container.resolveBinding('Adonis/Addons/Ally')
    const { AAD } = await import('../src/AzureAD')

    Ally.extend('AzureAD', (_, __, config, ctx) => {
      return new AAD(ctx, config)
    })
  }
}
