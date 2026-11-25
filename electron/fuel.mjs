// Pure fixed-point arithmetic shared by Electron and the browser.
export const DEFAULT_DRUM_LITERS = 210;
export function positive(value,label,scale=1) {
  if(typeof value!=='number'||!Number.isFinite(value)||value<=0) throw Error(label+' must be positive');
  const n=Math.round(value*scale);
  if(!Number.isSafeInteger(n)||n<=0||n>1e12) throw Error(label+' is outside the supported range');
  return n;
}
export function calculateFuel(drumsInput,litersPerDrum,rateInput) {
  const count=positive(drumsInput,'Drum count',1000);
  const drumMl=positive(litersPerDrum,'Liters per drum',1000);
  const rate=positive(rateInput,'Rate',100);
  const total=Number((BigInt(count)*BigInt(drumMl)+500n)/1000n);
  if(!Number.isSafeInteger(total)||total<=0||total>1e12) throw Error('Transaction is outside supported limits');
  const amount=Number((BigInt(total)*BigInt(rate)+500n)/1000n);
  if(!Number.isSafeInteger(amount)||amount<=0||amount>1e12) throw Error('Transaction is outside supported limits');
  return {drums:count/1000,drumMl,rate,total,amount};
}

export function measuredVolume(values) {
 if(!Array.isArray(values)||values.length===0||values.length>500) throw Error('Enter between 1 and 500 measured drums');
 const volumes=values.map((v,i)=>positive(v,'Drum '+(i+1)+' liters',1000));
 const total=volumes.reduce((a,b)=>a+b,0);
 if(!Number.isSafeInteger(total)||total>1e12)throw Error('Transaction is outside supported limits');
 return {volumes,total};
}
export function calculateMovement(input) {
 if(input.drumVolumes===undefined)return {...calculateFuel(input.drums,input.litersPerDrum,input.rate),volumes:null};
 const {volumes,total}=measuredVolume(input.drumVolumes);
 const rate=positive(input.rate,'Rate',100);
 const amount=Number((BigInt(total)*BigInt(rate)+500n)/1000n);
 if(!Number.isSafeInteger(amount)||amount<=0||amount>1e12)throw Error('Transaction is outside supported limits');
 return {drums:volumes.length,drumMl:Math.round(total/volumes.length),rate,total,amount,volumes};
}
