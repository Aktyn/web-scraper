/**
 * NOTE: ElectronToRendererMessage and RendererToElectronMessage keys must equal to its corresponding values and be written in camelCase
 */

export enum ElectronToRendererMessage {
  dummyEventFromMain = 'dummyEventFromMain',
}

export enum RendererToElectronMessage {
  dummyEvent = 'dummyEvent',
}

export type ElectronApi = {
  [ElectronToRendererMessage.dummyEventFromMain]: (
    callback: (event: Event, value: number) => void,
  ) => void
  [RendererToElectronMessage.dummyEvent]: () => Promise<number>
}
