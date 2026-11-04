const { DatabaseSync, backup } = require('node:sqlite');
function openDatabase(path) {
 const db = new DatabaseSync(path);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
 CREATE TABLE IF NOT EXISTS drivers(id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '');
 CREATE TABLE IF NOT EXISTS tanks(fuel TEXT PRIMARY KEY CHECK(fuel IN ('Petrol','Diesel')), stock_ml INTEGER NOT NULL DEFAULT 0 CHECK(stock_ml>=0));
 INSERT OR IGNORE INTO tanks(fuel) VALUES('Petrol'),('Diesel');
 CREATE TABLE IF NOT EXISTS transactions(id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, direction TEXT NOT NULL CHECK(direction IN ('IN','OUT')), vehicle TEXT NOT NULL, driver_id INTEGER REFERENCES drivers(id), fuel TEXT NOT NULL REFERENCES tanks(fuel), drums REAL NOT NULL, drum_ml INTEGER NOT NULL, total_ml INTEGER NOT NULL CHECK(total_ml>0), rate_paisa INTEGER NOT NULL CHECK(rate_paisa>0), amount_paisa INTEGER NOT NULL CHECK(amount_paisa>0), payment TEXT NOT NULL CHECK(payment IN ('Cash','Credit')));
 CREATE TABLE IF NOT EXISTS payments(id INTEGER PRIMARY KEY, driver_id INTEGER NOT NULL REFERENCES drivers(id), amount_paisa INTEGER NOT NULL CHECK(amount_paisa>0), created_at TEXT NOT NULL);
 PRAGMA user_version=1;`);
 const atomic = fn => {db.exec('BEGIN IMMEDIATE'); try {const result=fn(); db.exec('COMMIT'); return result;} catch(e){db.exec('ROLLBACK'); throw e;}};
 const balance = id => Number(db.prepare("SELECT COALESCE(SUM(amount_paisa),0) AS n FROM transactions WHERE driver_id=? AND direction='OUT' AND payment='Credit'").get(id).n)-Number(db.prepare('SELECT COALESCE(SUM(amount_paisa),0) AS n FROM payments WHERE driver_id=?').get(id).n);
 function positive(value, label, scale=1) {if(typeof value!=='number'||!Number.isFinite(value)||value<=0) throw Error(label+' must be positive'); const n=Math.round(value*scale); if(!Number.isSafeInteger(n)||n<=0||n>1e12) throw Error(label+' is outside the supported range'); return n;}
 return { db, balance,
 snapshot(){return {tanks:db.prepare('SELECT * FROM tanks').all(),drivers:db.prepare('SELECT * FROM drivers ORDER BY name').all().map(d=>({...d,balance_paisa:balance(d.id)})),transactions:db.prepare('SELECT t.*,d.name AS driver_name FROM transactions t LEFT JOIN drivers d ON t.driver_id=d.id ORDER BY t.id DESC').all(),payments:db.prepare('SELECT * FROM payments ORDER BY id DESC').all()};},
 addDriver(input){const name=String(input.name||'').trim(),phone=String(input.phone||'').trim();if(!name||name.length>100||phone.length>40)throw Error('Enter a name (up to 100 characters) and valid phone'); db.prepare('INSERT INTO drivers(name,phone) VALUES(?,?)').run(name,phone);},
 record(input){return atomic(()=>{const {direction,vehicle,fuel,payment}=input;if(!['IN','OUT'].includes(direction)||!['Zambad','Bowser'].includes(vehicle)||!['Petrol','Diesel'].includes(fuel)||!['Cash','Credit'].includes(payment))throw Error('Invalid transaction options'); if(direction==='IN'&&payment==='Credit')throw Error('Supplier credit is not supported in this version; use Cash for stock received');
 const drums=positive(input.drums,'Drum count',1000)/1000, drumMl=positive(input.litersPerDrum,'Liters per drum',1000), rate=positive(input.rate,'Rate',100);const total=Math.round(drums*drumMl),amount=Math.round(total*rate/1000);if(!Number.isSafeInteger(total)||!Number.isSafeInteger(amount)||total<=0||amount<=0||total>1e12||amount>1e12)throw Error('Transaction is outside supported limits');
 const driver=input.driverId||null;if(driver&&!db.prepare('SELECT id FROM drivers WHERE id=?').get(driver))throw Error('Driver does not exist');if(payment==='Credit'&&!driver)throw Error('Select a driver for credit sales');const stock=db.prepare('SELECT stock_ml FROM tanks WHERE fuel=?').get(fuel).stock_ml;if(direction==='OUT'&&total>stock)throw Error('Insufficient '+fuel+' stock'); if(direction==='IN'&&stock+total>1e12)throw Error('Tank stock limit exceeded');
 db.prepare('UPDATE tanks SET stock_ml=stock_ml+? WHERE fuel=?').run(direction==='IN'?total:-total,fuel);
 return Number(db.prepare('INSERT INTO transactions(created_at,direction,vehicle,driver_id,fuel,drums,drum_ml,total_ml,rate_paisa,amount_paisa,payment) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(new Date().toISOString(),direction,vehicle,driver,fuel,drums,drumMl,total,rate,amount,payment).lastInsertRowid);});},
 pay(input){return atomic(()=>{const n=positive(input.amount,'Payment',100);if(n>balance(input.driverId))throw Error('Payment exceeds outstanding balance');db.prepare('INSERT INTO payments(driver_id,amount_paisa,created_at) VALUES(?,?,?)').run(input.driverId,n,new Date().toISOString());});},
 backup(path){return backup(db,path);},close(){db.close();}
 };
}
module.exports={openDatabase};
