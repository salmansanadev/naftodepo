import {positive,calculateMovement,splitPayment} from '../../electron/fuel.mjs';
// Browser pilot preserves legacy per-liter pricing until versioned pricing migration.
export function emptyState(){return {tanks:[{fuel:"Petrol",stock_ml:0},{fuel:"Diesel",stock_ml:0}],drivers:[],transactions:[],payments:[]}}
export function applyOperation(state,action,input,now){
 const s=JSON.parse(JSON.stringify(state));const fail=m=>{throw Error(m)};
 const nextId=rows=>rows.reduce((max,row)=>Math.max(max,row.id),0)+1;
 const driver=id=>s.drivers.find(d=>d.id===id);
 if(action==="snapshot")return s;
 if(!input||typeof input!=="object")fail("Invalid input");
 if(action==="driver"){const name=String(input.name||"").trim(),phone=String(input.phone||"").trim();if(!name||name.length>100||phone.length>40)fail("Enter a name (up to 100 characters) and valid phone");s.drivers.push({id:nextId(s.drivers),name,phone,balance_paisa:0});s.drivers.sort((a,b)=>a.name.localeCompare(b.name));return s}
 if(action==="record"){
 const {direction,vehicle,fuel}=input;if(!["IN","OUT"].includes(direction)||!["Zambad","Bowser"].includes(vehicle)||!["Petrol","Diesel"].includes(fuel))fail("Invalid transaction options");
 const {drums,drumMl:drum_ml,rate:rate_paisa,total:total_ml,amount:amount_paisa,volumes}=calculateMovement(input);
 const {cash,online,credit,payment}=splitPayment(input,amount_paisa);
 const driver_id=input.driverId||null,d=driver(driver_id);if(driver_id&&!d)fail("Driver does not exist");if(payment==="Credit"&&!d)fail("Select a driver for credit sales");const tank=s.tanks.find(t=>t.fuel===fuel);if(direction==="OUT"&&total_ml>tank.stock_ml)fail("Insufficient "+fuel+" stock");if(direction==="IN"&&tank.stock_ml+total_ml>1e12)fail("Tank stock limit exceeded");
 tank.stock_ml+=direction==="IN"?total_ml:-total_ml;if(payment==="Credit"){if(!Number.isSafeInteger(d.balance_paisa+credit))fail("Balance limit exceeded");d.balance_paisa+=credit}
 s.transactions.unshift({id:nextId(s.transactions),created_at:now,direction,vehicle,driver_id,driver_name:d?.name??null,fuel,drums,drum_ml,total_ml,rate_paisa,amount_paisa,payment,cash_paisa:cash,online_paisa:online,credit_paisa:credit,drum_volumes_json:volumes===null?null:JSON.stringify(volumes)});return s
 }
 if(action==="pay"){const d=driver(input.driverId),amount_paisa=positive(input.amount,"Payment",100);if(!d||amount_paisa>d.balance_paisa)fail("Payment exceeds outstanding balance");d.balance_paisa-=amount_paisa;s.payments.unshift({id:nextId(s.payments),driver_id:d.id,amount_paisa,created_at:now});return s}
 fail("Unsupported browser operation");
}
