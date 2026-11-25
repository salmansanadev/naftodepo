export const DEFAULT_DRUM_LITERS: number;
export function positive(value:number,label:string,scale?:number):number;
export function calculateFuel(drumsInput:number,litersPerDrum:number,rateInput:number):{drums:number;drumMl:number;rate:number;total:number;amount:number};

export function measuredVolume(values:number[]):{volumes:number[];total:number};
export function calculateMovement(input:{drums:number;litersPerDrum:number;rate:number;drumVolumes?:number[]}):{drums:number;drumMl:number;rate:number;total:number;amount:number;volumes:number[]|null};

export function splitPayment(input:{payment:string;direction:string;driverId?:number|null;cashPaid?:number;onlinePaid?:number},amount:number):{cash:number;online:number;credit:number;payment:string};
export function paymentParts(t:{payment:string;amount_paisa:number;cash_paisa?:number|null;online_paisa?:number|null;credit_paisa?:number|null}):{cash:number;online:number;credit:number};
