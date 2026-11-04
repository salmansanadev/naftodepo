const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('depo',{call:(action,payload)=>ipcRenderer.invoke('depo',action,payload)});
