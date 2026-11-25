export const DEFAULT_DRUM_LITERS: number;
export function positive(value:number,label:string,scale?:number):number;
export function calculateFuel(drumsInput:number,litersPerDrum:number,rateInput:number):{drums:number;drumMl:number;rate:number;total:number;amount:number};

export function measuredVolume(values:number[]):{volumes:number[];total:number};
export function calculateMovement(input:{drums:number;litersPerDrum:number;rate:number;drumVolumes?:number[]}):{drums:number;drumMl:number;rate:number;total:number;amount:number;volumes:number[]|null};
