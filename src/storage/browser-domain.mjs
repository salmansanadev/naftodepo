// Browser pilot preserves legacy per-liter pricing until versioned pricing migration.
export function emptyState(){return {tanks:[{fuel:"Petrol",stock_ml:0},{fuel:"Diesel",stock_ml:0}],drivers:[],transactions:[],payments:[]}}
export function applyOperation(state,action,input,now){
 const s=JSON.parse(JSON.stringify(state));const fail=m=>{throw Error(m)};
 const positive=(v,label,scale=1)=>{if(typeof v!=="number"||!Number.isFinite(v)||v<=0)fail(label+" must be positive");const n=Math.round(v*scale);if(!Number.isSafeInteger(n)||n<=0||n>1e12)fail(label+" is outside the supported range");return n};
 const nextId=rows=>rows.reduce((max,row)=>Math.max(max,row.id),0)+1;
 const driver=id=>s.drivers.find(d=>d.id===id);
 if(action==="snapshot")return s;
 if(!input||typeof input!=="object")fail("Invalid input");
 if(action==="driver"){const name=String(input.name||"").trim(),phone=String(input.phone||"").trim();if(!name||name.length>100||phone.length>40)fail("Enter a name (up to 100 characters) and valid phone");s.drivers.push({id:nextId(s.drivers),name,phone,balance_paisa:0});s.drivers.sort((a,b)=>a.name.localeCompare(b.name));return s}
 if(action==="record"){
 const {direction,vehicle,fuel,payment}=input;if(!["IN","OUT"].includes(direction)||!["Zambad","Bowser"].includes(vehicle)||!["Petrol","Diesel"].includes(fuel)||!["Cash","Credit"].includes(payment))fail("Invalid transaction options");if(direction==="IN"&&payment==="Credit")fail("Supplier credit is not supported in this version; use Cash for stock received");
 const drums=positive(input.drums,"Drum count",1000)/1000,drum_ml=positive(input.litersPerDrum,"Liters per drum",1000),rate_paisa=positive(input.rate,"Rate",100);const total_ml=Math.round(drums*drum_ml),amount_paisa=Math.round(total_ml*rate_paisa/1000);if(!Number.isSafeInteger(total_ml)||!Number.isSafeInteger(amount_paisa)||total_ml<=0||amount_paisa<=0||total_ml>1e12||amount_paisa>1e12)fail("Transaction is outside supported limits");
 const driver_id=input.driverId||null,d=driver(driver_id);if(driver_id&&!d)fail("Driver does not exist");if(payment==="Credit"&&!d)fail("Select a driver for credit sales");const tank=s.tanks.find(t=>t.fuel===fuel);if(direction==="OUT"&&total_ml>tank.stock_ml)fail("Insufficient "+fuel+" stock");if(direction==="IN"&&tank.stock_ml+total_ml>1e12)fail("Tank stock limit exceeded");
 tank.stock_ml+=direction==="IN"?total_ml:-total_ml;if(payment==="Credit"){if(!Number.isSafeInteger(d.balance_paisa+amount_paisa))fail("Balance limit exceeded");d.balance_paisa+=amount_paisa}
 s.transactions.unshift({id:nextId(s.transactions),created_at:now,direction,vehicle,driver_id,driver_name:d?.name??null,fuel,drums,drum_ml,total_ml,rate_paisa,amount_paisa,payment});return s
 }
 if(action==="pay"){const d=driver(input.driverId),amount_paisa=positive(input.amount,"Payment",100);if(!d||amount_paisa>d.balance_paisa)fail("Payment exceeds outstanding balance");d.balance_paisa-=amount_paisa;s.payments.unshift({id:nextId(s.payments),driver_id:d.id,amount_paisa,created_at:now});return s}
 fail("Unsupported browser operation");
}
