const {test}=require('node:test');
const assert=require('node:assert/strict');
test('standard drum and fractional volume calculations',async()=>{
 const {calculateFuel,DEFAULT_DRUM_LITERS}=await import('../electron/fuel.mjs');
 assert.equal(DEFAULT_DRUM_LITERS,210);
 assert.deepEqual(calculateFuel(2,210,250),{drums:2,drumMl:210000,rate:25000,total:420000,amount:10500000});
 assert.equal(calculateFuel(0.5,210,275.5).amount,2892750);
 assert.equal(calculateFuel(0.001,210,250).total,210);
 assert.equal(calculateFuel(1,1.005,1).amount,101);
 for(const input of [[0,210,250],[-1,210,250],[1,210,NaN],[1e9,210,250]]) assert.throws(()=>calculateFuel(...input));
});
