import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  dummyEvent: (): Promise<number> => ipcRenderer.invoke('dummyEvent'),
  dummyEventFromMain: (callback: (event: IpcRendererEvent, value: number) => void) =>
    ipcRenderer.on('dummyEventFromMain', callback),
})
