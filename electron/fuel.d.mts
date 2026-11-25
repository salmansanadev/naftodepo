export const DEFAULT_DRUM_LITERS: number;
export function positive(value:number,label:string,scale?:number):number;
export function calculateFuel(drumsInput:number,litersPerDrum:number,rateInput:number):{drums:number;drumMl:number;rate:number;total:number;amount:number};
