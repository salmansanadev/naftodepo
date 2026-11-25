import type {DepoAdapter,State,Result,Action} from './types';
import {emptyState,applyOperation} from './browser-domain.mjs';
const DB='naftodepo-browser-demo-v1';
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);let blocked=false;request.onupgradeneeded=()=>{request.result.createObjectStore('workspace')};request.onsuccess=()=>{if(blocked)request.result.close();else resolve(request.result)};request.onerror=()=>reject(request.error);request.onblocked=()=>{blocked=true;reject(Error('Close other demo tabs and retry'))};});}
async function browserCall(action:Action,input?:unknown):Promise<Result>{
 if(!['snapshot','driver','record','pay','profile'].includes(action))return {ok:false,error:'This operation requires the desktop application.'};
 let db:IDBDatabase|undefined;
 try{db=await open();const connection=db;const data=await new Promise<State>((resolve,reject)=>{const tx=connection.transaction('workspace',action==='snapshot'?'readonly':'readwrite');const store=tx.objectStore('workspace');let result:State;let failure:unknown;tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(failure??tx.error??Error('Storage transaction aborted'));tx.onerror=()=>{failure=tx.error??failure};const read=store.get('state');read.onsuccess=()=>{try{result=applyOperation(read.result??emptyState(),action,input,new Date().toISOString());if(action!=='snapshot')store.put(result,'state');}catch(error){failure=error;tx.abort();}};});return {ok:true,data};}catch(error){return {ok:false,error:error instanceof Error?error.message:'Browser storage unavailable'};}finally{db?.close();}
}
export function getAdapter():DepoAdapter{return window.depo??{call:browserCall};}
