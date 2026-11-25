import type {Profile} from '../../electron/profile.mjs';
export type Driver={id:number;name:string;phone:string;balance_paisa:number};
export type Tx={id:number;created_at:string;direction:string;fuel:string;driver_id:number|null;driver_name:string|null;vehicle:string;drums:number;drum_ml:number;total_ml:number;rate_paisa:number;amount_paisa:number;payment:string;drum_volumes_json?:string|null;cash_paisa?:number|null;online_paisa?:number|null;credit_paisa?:number|null;profile_json?:string|null};
export type State={profile?:Profile;tanks:{fuel:string;stock_ml:number}[];drivers:Driver[];transactions:Tx[];payments:{id:number;driver_id:number;amount_paisa:number;created_at:string}[]};
export type Action = 'profile' | 'snapshot' | 'driver' | 'record' | 'pay' | 'receipt' | 'backup' | 'restore';
export type Result = {ok:boolean;data?:State;error?:string;message?:string};
export type DepoAdapter = {call:(action:Action,input?:unknown)=>Promise<Result>};
declare global {interface Window{depo?:DepoAdapter}}
