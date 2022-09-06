import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AZureADProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const Ally = this.app.container.resolveBinding('Adonis/Addons/Ally')
    const { AZureADDriver } = await import('../src/AzureAD')

    Ally.extend('azuread', (_, __, config, ctx) => {
      return new AZureADDriver(ctx, config)
    })
  }
}
