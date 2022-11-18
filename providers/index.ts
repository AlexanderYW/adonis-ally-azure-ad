import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AADProvider {
  constructor(protected app: ApplicationContract) {}

  public async boot() {
    const Ally = this.app.container.resolveBinding('Adonis/Addons/Ally')
    const { AzureADDriver } = await import('../src/AzureADDriver')

    Ally.extend('AzureAD', (_, __, config, ctx) => {
      return new AzureADDriver(ctx, config)
    })
  }
}
