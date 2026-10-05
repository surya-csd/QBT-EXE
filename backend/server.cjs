const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env from the project root when present (Node 20.12+ built-in; no-op in the packaged EXE)
const ENV_FILE = path.join(__dirname, '..', '.env');
if (typeof process.loadEnvFile === 'function' && fs.existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const PORT = Number(process.env.PORT || 5000);
const DB_PATH = process.env.QBT_DB_PATH || path.join(__dirname, '..', 'electron', 'qbt.db');

function uuid() { return crypto.randomUUID(); }
function jsonArray(v) {
  if (v == null || v === '') return [];
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v); } catch (_) { return []; }
}
function dbRow(row) { return row || null; }

function openDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  return new sqlite3.Database(DB_PATH);
}

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
}
function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
}
function dbExec(db, sql) {
  return new Promise((resolve, reject) => db.exec(sql, err => err ? reject(err) : resolve()));
}

async function ensureSchema(db) {
  await dbExec(db, `
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY, bill_no TEXT NOT NULL UNIQUE, company_id TEXT NOT NULL, customer_id TEXT NOT NULL,
      quotation_id TEXT NOT NULL, purchase_order_no TEXT, purchase_order_date TEXT, bill_date TEXT, subject TEXT,
      reference TEXT, sac_no TEXT, subtotal NUMERIC, cgst_amount NUMERIC, sgst_amount NUMERIC, igst_amount NUMERIC,
      grand_total NUMERIC, amount_in_words TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS bill_items (
      id TEXT PRIMARY KEY, bill_id TEXT NOT NULL, serial_no INTEGER, job_description TEXT, quantity NUMERIC,
      unit TEXT, rate NUMERIC, amount NUMERIC, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE TABLE IF NOT EXISTS master (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, name TEXT, address TEXT, email TEXT, mobile TEXT,
      vendor_no TEXT, gst_no TEXT, state TEXT, pincode TEXT, through TEXT, cgst_rate INTEGER DEFAULT 0,
      sgst_rate INTEGER DEFAULT 0, igst_rate INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY, quotation_no TEXT NOT NULL UNIQUE, company_id TEXT NOT NULL, customer_id TEXT NOT NULL,
      quotation_date TEXT, subject TEXT, sac_no TEXT, prq_no TEXT, work_completion_days INTEGER,
      subtotal NUMERIC, cgst_amount NUMERIC, sgst_amount NUMERIC, igst_amount NUMERIC, grand_total NUMERIC,
      amount_in_words TEXT, status TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY, quotation_id TEXT NOT NULL, serial_no INTEGER, job_description TEXT,
      quantity NUMERIC, unit TEXT, rate NUMERIC, amount NUMERIC, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE TABLE IF NOT EXISTS task_risk_assessments (
      id TEXT PRIMARY KEY, tara_no TEXT, site TEXT, department TEXT, machine_area TEXT, task_description TEXT,
      performing_task TEXT, others_at_risk TEXT, tara_team TEXT, task_risk_score INTEGER, assessment_date TEXT,
      revision_no INTEGER, revision_date TEXT, next_revision_date TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS task_risk_items (
      id TEXT PRIMARY KEY, assessment_id TEXT NOT NULL, serial_no INTEGER, description TEXT, potential_hazard TEXT,
      safe_practice TEXT, initial_F INTEGER, initial_D INTEGER, initial_N INTEGER, initial_C INTEGER,
      initial_P INTEGER, initial_C2 INTEGER, initial_PXC INTEGER, action_required TEXT, new_control_measures TEXT,
      residual_P INTEGER, residual_C INTEGER, residual_PXC INTEGER, date_completed TEXT, current_risk_total INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES task_risk_assessments(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
    CREATE TABLE IF NOT EXISTS sops (
      id TEXT PRIMARY KEY, task_risk_assessment_id TEXT NOT NULL, heading TEXT, points TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_risk_assessment_id) REFERENCES task_risk_assessments(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bill_items_bill ON bill_items(bill_id);
    CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
    CREATE INDEX IF NOT EXISTS idx_tara_items_assessment ON task_risk_items(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_sops_assessment ON sops(task_risk_assessment_id);
  `);
}

function masterOut(r) {
  if (!r) return null;
  return {
    id: r.id, type: r.type, name: r.name, address: r.address, email: r.email, mobile: r.mobile,
    vendorNo: r.vendor_no, gstNo: r.gst_no, state: r.state, pincode: r.pincode, through: r.through,
    cgstRate: r.cgst_rate, sgstRate: r.sgst_rate, igstRate: r.igst_rate,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function quotationOut(r, items) {
  if (!r) return null;
  return { ...r, items: items || [] };
}
function billOut(r, items) {
  if (!r) return null;
  return { ...r, items: items || [] };
}

async function startServer() {
  const db = openDb();
  await ensureSchema(db);
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', async (_req, res) => {
    try { await dbGet(db, 'SELECT 1 AS ok'); res.json({ success: true, status: 'ok' }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });

  // Master data
  app.get('/api/master', async (_req, res, next) => {
    try {
      const rows = await dbAll(db, 'SELECT * FROM master ORDER BY type, created_at');
      res.json({ success: true, data: rows.map(masterOut) });
    } catch (e) { next(e); }
  });
  app.get('/api/master/type/:type', async (req, res, next) => {
    try { res.json({ success: true, data: (await dbAll(db, 'SELECT * FROM master WHERE type = ? ORDER BY created_at', [req.params.type])).map(masterOut) }); }
    catch (e) { next(e); }
  });
  app.get('/api/master/:id', async (req, res, next) => {
    try { const r = await dbGet(db, 'SELECT * FROM master WHERE id = ?', [req.params.id]); if (!r) return res.status(404).json({ success:false, message:'Master record not found' }); res.json({ success:true, data:masterOut(r) }); }
    catch(e){next(e)}
  });
  app.put('/api/master/:id', async (req, res, next) => {
    try {
      const b=req.body||{};
      const exists=await dbGet(db,'SELECT id FROM master WHERE id=?',[req.params.id]);
      if(!exists) return res.status(404).json({success:false,message:'Master record not found'});
      await dbRun(db, `UPDATE master SET type=?, name=?, address=?, email=?, mobile=?, vendor_no=?, gst_no=?, state=?, pincode=?, through=?, cgst_rate=?, sgst_rate=?, igst_rate=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [
        b.type, b.name ?? null, b.address ?? null, b.email ?? null, b.mobile ?? null, b.vendorNo ?? b.vendor_no ?? null,
        b.gstNo ?? b.gst_no ?? null, b.state ?? null, b.pincode ?? null, b.through ?? null,
        b.cgstRate ?? b.cgst_rate ?? 0, b.sgstRate ?? b.sgst_rate ?? 0, b.igstRate ?? b.igst_rate ?? 0, req.params.id]);
      res.json({success:true,data:masterOut(await dbGet(db,'SELECT * FROM master WHERE id=?',[req.params.id]))});
    } catch(e){next(e)}
  });

  // Quotations
  async function quotationWithItems(id){
    const q=await dbGet(db,'SELECT * FROM quotations WHERE id=?',[id]);
    if(!q) return null;
    const items=await dbAll(db,'SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY serial_no, created_at',[id]);
    return quotationOut(q,items);
  }
  app.get('/api/quotations', async (_req,res,next)=>{try{const qs=await dbAll(db,'SELECT * FROM quotations ORDER BY created_at DESC'); const out=[]; for(const q of qs) out.push(await quotationWithItems(q.id)); res.json({success:true,data:out});}catch(e){next(e)}});
  app.get('/api/quotations/:id', async (req,res,next)=>{try{const q=await quotationWithItems(req.params.id);if(!q)return res.status(404).json({success:false,message:'Quotation not found'});res.json({success:true,data:q});}catch(e){next(e)}});
  app.post('/api/quotations', async (req,res,next)=>{
    try { const b=req.body||{}, id=uuid();
      await dbRun(db,'BEGIN');
      await dbRun(db,`INSERT INTO quotations (id,quotation_no,company_id,customer_id,quotation_date,subject,sac_no,prq_no,work_completion_days,subtotal,cgst_amount,sgst_amount,igst_amount,grand_total,amount_in_words,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[
        id,b.quotation_no,b.company_id,b.customer_id,b.quotation_date||null,b.subject||null,b.sac_no||null,b.prq_no||null,b.work_completion_days??null,b.subtotal??0,b.cgst_amount??0,b.sgst_amount??0,b.igst_amount??0,b.grand_total??0,b.amount_in_words||null,b.status||'Draft']);
      for(const [i,it] of (b.items||[]).entries()) await dbRun(db,`INSERT INTO quotation_items (id,quotation_id,serial_no,job_description,quantity,unit,rate,amount) VALUES (?,?,?,?,?,?,?,?)`,[uuid(),id,it.serial_no??i+1,it.job_description||null,it.quantity??0,it.unit||'',it.rate??0,it.amount??0]);
      await dbRun(db,'COMMIT'); res.status(201).json({success:true,data:await quotationWithItems(id)});
    } catch(e){try{await dbRun(db,'ROLLBACK')}catch(_){} next(e)}
  });
  app.put('/api/quotations/:id', async(req,res,next)=>{
    try { const b=req.body||{}, id=req.params.id; if(!await dbGet(db,'SELECT id FROM quotations WHERE id=?',[id])) return res.status(404).json({success:false,message:'Quotation not found'});
      await dbRun(db,'BEGIN');
      const fields=['quotation_no','company_id','customer_id','quotation_date','subject','sac_no','prq_no','work_completion_days','subtotal','cgst_amount','sgst_amount','igst_amount','grand_total','amount_in_words','status'];
      const vals=fields.map(k=>b[k]); const set=fields.map(k=>`${k}=?`).join(', ');
      const provided=fields.filter(k=>Object.prototype.hasOwnProperty.call(b,k));
      if(provided.length) await dbRun(db,`UPDATE quotations SET ${provided.map(k=>`${k}=?`).join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id=?`,[...provided.map(k=>b[k]),id]);
      if(Array.isArray(b.items)){ await dbRun(db,'DELETE FROM quotation_items WHERE quotation_id=?',[id]); for(const [i,it] of b.items.entries()) await dbRun(db,`INSERT INTO quotation_items (id,quotation_id,serial_no,job_description,quantity,unit,rate,amount) VALUES (?,?,?,?,?,?,?,?)`,[uuid(),id,it.serial_no??i+1,it.job_description||null,it.quantity??0,it.unit||'',it.rate??0,it.amount??0]); }
      await dbRun(db,'COMMIT'); res.json({success:true,data:await quotationWithItems(id)});
    } catch(e){try{await dbRun(db,'ROLLBACK')}catch(_){} next(e)}
  });
  app.delete('/api/quotations/:id', async(req,res,next)=>{try{const r=await dbRun(db,'DELETE FROM quotations WHERE id=?',[req.params.id]);if(!r.changes)return res.status(404).json({success:false,message:'Quotation not found'});res.json({success:true,message:'Quotation deleted'});}catch(e){next(e)}});

  // Bills
  async function billWithItems(id){const b=await dbGet(db,'SELECT * FROM bills WHERE id=?',[id]);if(!b)return null;return billOut(b,await dbAll(db,'SELECT * FROM bill_items WHERE bill_id=? ORDER BY serial_no,created_at',[id]));}
  app.get('/api/bills',async(_req,res,next)=>{try{const bs=await dbAll(db,'SELECT * FROM bills ORDER BY created_at DESC');const out=[];for(const b of bs)out.push(await billWithItems(b.id));res.json({success:true,data:out});}catch(e){next(e)}});
  app.get('/api/bills/:id',async(req,res,next)=>{try{const b=await billWithItems(req.params.id);if(!b)return res.status(404).json({success:false,message:'Bill not found'});res.json({success:true,data:b});}catch(e){next(e)}});
  app.post('/api/bills',async(req,res,next)=>{try{const b=req.body||{},id=uuid();await dbRun(db,'BEGIN');await dbRun(db,`INSERT INTO bills (id,bill_no,company_id,customer_id,quotation_id,purchase_order_no,purchase_order_date,bill_date,subject,reference,sac_no,subtotal,cgst_amount,sgst_amount,igst_amount,grand_total,amount_in_words) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[id,b.bill_no,b.company_id,b.customer_id,b.quotation_id,b.purchase_order_no??null,b.purchase_order_date??null,b.bill_date??null,b.subject??null,b.reference??null,b.sac_no??null,b.subtotal??0,b.cgst_amount??0,b.sgst_amount??0,b.igst_amount??0,b.grand_total??0,b.amount_in_words??null]);for(const [i,it] of (b.items||[]).entries())await dbRun(db,`INSERT INTO bill_items (id,bill_id,serial_no,job_description,quantity,unit,rate,amount) VALUES (?,?,?,?,?,?,?,?)`,[uuid(),id,it.serial_no??i+1,it.job_description??null,it.quantity??0,it.unit??'',it.rate??0,it.amount??0]);await dbRun(db,'COMMIT');res.status(201).json({success:true,data:await billWithItems(id)});}catch(e){try{await dbRun(db,'ROLLBACK')}catch(_){}next(e)}});
  app.put('/api/bills/:id',async(req,res,next)=>{try{const b=req.body||{},id=req.params.id;if(!await dbGet(db,'SELECT id FROM bills WHERE id=?',[id]))return res.status(404).json({success:false,message:'Bill not found'});await dbRun(db,'BEGIN');const fields=['bill_no','company_id','customer_id','quotation_id','purchase_order_no','purchase_order_date','bill_date','subject','reference','sac_no','subtotal','cgst_amount','sgst_amount','igst_amount','grand_total','amount_in_words'];const provided=fields.filter(k=>Object.prototype.hasOwnProperty.call(b,k));if(provided.length)await dbRun(db,`UPDATE bills SET ${provided.map(k=>`${k}=?`).join(', ')},updated_at=CURRENT_TIMESTAMP WHERE id=?`,[...provided.map(k=>b[k]),id]);if(Array.isArray(b.items)){await dbRun(db,'DELETE FROM bill_items WHERE bill_id=?',[id]);for(const [i,it] of b.items.entries())await dbRun(db,`INSERT INTO bill_items (id,bill_id,serial_no,job_description,quantity,unit,rate,amount) VALUES (?,?,?,?,?,?,?,?)`,[uuid(),id,it.serial_no??i+1,it.job_description??null,it.quantity??0,it.unit??'',it.rate??0,it.amount??0]);}await dbRun(db,'COMMIT');res.json({success:true,data:await billWithItems(id)});}catch(e){try{await dbRun(db,'ROLLBACK')}catch(_){}next(e)}});
  app.delete('/api/bills/:id',async(req,res,next)=>{try{const r=await dbRun(db,'DELETE FROM bills WHERE id=?',[req.params.id]);if(!r.changes)return res.status(404).json({success:false,message:'Bill not found'});res.json({success:true,message:'Bill deleted'});}catch(e){next(e)}});

  // TARA / risk assessment
  async function taraWithChildren(id){const t=await dbGet(db,'SELECT * FROM task_risk_assessments WHERE id=?',[id]);if(!t)return null;const items=await dbAll(db,'SELECT * FROM task_risk_items WHERE assessment_id=? ORDER BY serial_no',[id]);const sops=await dbAll(db,'SELECT * FROM sops WHERE task_risk_assessment_id=? ORDER BY created_at',[id]);return {...t,tara_team:jsonArray(t.tara_team),riskItems:items,sopSteps:sops.map(s=>({...s,points:jsonArray(s.points)}))};}
  app.get('/api/tara',async(_req,res,next)=>{try{const ts=await dbAll(db,'SELECT * FROM task_risk_assessments ORDER BY created_at DESC');const out=[];for(const t of ts)out.push(await taraWithChildren(t.id));res.json(out);}catch(e){next(e)}});
  app.get('/api/tara/:id',async(req,res,next)=>{
    try {
      const key = String(req.params.id || '').trim();
      const row = await dbGet(db, 'SELECT id FROM task_risk_assessments WHERE id = ? OR tara_no = ? LIMIT 1', [key, key]);
      if (!row) return res.status(404).json({success:false,message:'TaRA not found'});
      const t = await taraWithChildren(row.id);
      res.json({success:true,data:t});
    } catch(e) { next(e); }
  });
  app.get('/api/tara-items/assessment/:id',async(req,res,next)=>{try{res.json({success:true,data:await dbAll(db,'SELECT * FROM task_risk_items WHERE assessment_id=? ORDER BY serial_no',[req.params.id])});}catch(e){next(e)}});
  app.get('/api/sops/assessment/:id',async(req,res,next)=>{try{const rows=await dbAll(db,'SELECT * FROM sops WHERE task_risk_assessment_id=? ORDER BY created_at',[req.params.id]);res.json({success:true,data:rows.map(s=>({...s,points:jsonArray(s.points)}))});}catch(e){next(e)}});
  async function saveTara(id,b){
    await dbRun(db,'BEGIN');
    const team=JSON.stringify(b.tara_team||[]);
    const exists=await dbGet(db,'SELECT id FROM task_risk_assessments WHERE id=?',[id]);
    const fields=['tara_no','site','department','machine_area','task_description','performing_task','others_at_risk','tara_team','task_risk_score','assessment_date','revision_no','revision_date','next_revision_date'];
    const vals=[b.tara_no??null,b.site??null,b.department??null,b.machine_area??null,b.task_description??null,b.performing_task??null,b.others_at_risk??null,team,b.task_risk_score??null,b.assessment_date??null,b.revision_no??null,b.revision_date??null,b.next_revision_date??null];
    if(exists) await dbRun(db,`UPDATE task_risk_assessments SET ${fields.map(k=>`${k}=?`).join(', ')},updated_at=CURRENT_TIMESTAMP WHERE id=?`,[...vals,id]);
    else await dbRun(db,`INSERT INTO task_risk_assessments (id,${fields.join(',')}) VALUES (?,${fields.map(()=>'?').join(',')})`,[id,...vals]);
    if (Array.isArray(b.rows)) {
      await dbRun(db, 'DELETE FROM task_risk_items WHERE assessment_id=?', [id]);
      for (const [i, r] of b.rows.entries()) {
        await dbRun(db, `INSERT INTO task_risk_items (id,assessment_id,serial_no,description,potential_hazard,safe_practice,initial_F,initial_D,initial_N,initial_C,initial_P,initial_C2,initial_PXC,action_required,new_control_measures,residual_P,residual_C,residual_PXC,date_completed,current_risk_total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
          uuid(), id, r.serial_no ?? i + 1,
          r.description ?? r.job ?? null,
          r.potential_hazard ?? r.hazard ?? null,
          r.safe_practice ?? r.control ?? null,
          r.initial_F ?? r.f ?? null, r.initial_D ?? r.d ?? null, r.initial_N ?? r.n ?? null,
          r.initial_C ?? r.c1 ?? null, r.initial_P ?? r.p ?? null, r.initial_C2 ?? r.c2 ?? null,
          r.initial_PXC ?? r.pxc ?? null,
          r.action_required ?? r.actionReq ?? null,
          r.new_control_measures ?? r.newControlMeasures ?? null,
          r.residual_P ?? r.resF ?? null, r.residual_C ?? r.resC ?? null,
          r.residual_PXC ?? r.resPxc ?? null,
          r.date_completed ?? r.date ?? null,
          r.current_risk_total ?? r.currentRisk ?? null,
        ]);
      }
    }
    if (Array.isArray(b.sopSteps)) {
      await dbRun(db, 'DELETE FROM sops WHERE task_risk_assessment_id=?', [id]);
      for (const s of b.sopSteps) {
        const points = Array.isArray(s.points)
          ? s.points
          : String(s.instructions || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
        await dbRun(db, `INSERT INTO sops (id,task_risk_assessment_id,heading,points) VALUES (?,?,?,?)`, [uuid(), id, s.heading ?? null, JSON.stringify(points)]);
      }
    }
    await dbRun(db,'COMMIT');
  }
  app.post('/api/tara',async(req,res,next)=>{try{const id=uuid();await saveTara(id,req.body||{});res.status(201).json({success:true,data:await taraWithChildren(id)});}catch(e){try{await dbRun(db,'ROLLBACK')}catch(_){}next(e)}});
  app.put('/api/tara/:id',async(req,res,next)=>{try{if(!await dbGet(db,'SELECT id FROM task_risk_assessments WHERE id=?',[req.params.id]))return res.status(404).json({success:false,message:'TaRA not found'});await saveTara(req.params.id,req.body||{});res.json({success:true,data:await taraWithChildren(req.params.id)});}catch(e){try{await dbRun(db,'ROLLBACK')}catch(_){}next(e)}});
  app.delete('/api/tara/:id',async(req,res,next)=>{try{const r=await dbRun(db,'DELETE FROM task_risk_assessments WHERE id=?',[req.params.id]);if(!r.changes)return res.status(404).json({success:false,message:'TaRA not found'});res.json({success:true,message:'TaRA deleted'});}catch(e){next(e)}});

  app.get('/api/dashboard', async (_req,res,next)=>{
    try {
      const month = new Date().toISOString().slice(0,7);

      // Treat MariaDB's zero-date (0000-00-00) as an empty date and
      // fall back to created_at. This preserves the existing records.
      const validDate = (value) => value && String(value) !== '0000-00-00' ? String(value) : null;
      const formatDate = (value) => {
        const d = validDate(value);
        if (!d) return '—';
        const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? `${m[3]}-${m[2]}-${m[1]}` : d;
      };

      const [q,b,t] = await Promise.all([
        dbGet(db,
          "SELECT COUNT(*) c FROM quotations WHERE substr(COALESCE(NULLIF(quotation_date,'0000-00-00'), created_at),1,7)=?",
          [month]
        ),
        dbGet(db,
          "SELECT COUNT(*) c FROM bills WHERE substr(COALESCE(NULLIF(bill_date,'0000-00-00'), created_at),1,7)=?",
          [month]
        ),
        // This card represents saved TaRA records, so it must match the
        // Saved TaRA list rather than only the current month.
        dbGet(db,
          'SELECT COUNT(*) c FROM task_risk_assessments',
          []
        ),
      ]);

      const quotations = await dbAll(db, `
        SELECT id, quotation_no, subject, status,
               quotation_date, created_at, updated_at
        FROM quotations
        ORDER BY datetime(created_at) DESC
      `);

      const bills = await dbAll(db, `
        SELECT id, bill_no, subject, bill_date,
               created_at, updated_at
        FROM bills
        ORDER BY datetime(created_at) DESC
      `);

      const taras = await dbAll(db, `
        SELECT id, tara_no, task_description, machine_area,
               assessment_date, created_at, updated_at
        FROM task_risk_assessments
        ORDER BY datetime(created_at) DESC
      `);

      // IMPORTANT: the frontend uses these public document identifiers for
      // navigation. Do not expose the internal UUID as the display id.
      const quotationDocs = quotations.map((q) => ({
        id: q.quotation_no || q.id,
        recordId: q.id,
        type: 'quotation',
        company: '',
        description: q.subject || 'Quotation',
        status: q.status || 'DRAFT',
        date: formatDate(validDate(q.quotation_date) || q.created_at),
        sortDate: q.created_at,
      }));

      const billDocs = bills.map((b) => ({
        id: b.bill_no || b.id,
        recordId: b.id,
        type: 'bill',
        company: '',
        description: b.subject || 'Bill',
        status: 'DRAFT',
        date: formatDate(validDate(b.bill_date) || b.created_at),
        sortDate: b.created_at,
      }));

      const taraDocs = taras.map((t) => ({
        id: t.tara_no || t.id,
        recordId: t.id,
        type: 'risk',
        company: t.site || '',
        description: t.task_description || t.machine_area || 'Risk Assessment',
        status: 'DRAFT',
        date: formatDate(validDate(t.assessment_date) || t.created_at),
        sortDate: t.created_at,
      }));

      const allDocuments = [...quotationDocs, ...billDocs, ...taraDocs]
        .sort((a,b) => String(b.sortDate || '').localeCompare(String(a.sortDate || '')))
        .map(({sortDate, ...doc}) => doc);

      res.json({
        success: true,
        data: {
          thisMonthTotalQuotation: q.c || 0,
          thisMonthTotalBill: b.c || 0,
          thisMonthRiskAndHazard: t.c || 0,
          recentDocuments: allDocuments.slice(0, 8),
          allDocuments,
        },
      });
    } catch(e) { next(e); }
  });

  app.use((err,_req,res,_next)=>{console.error('[QBT API]',err);if(!res.headersSent)res.status(500).json({success:false,message:err.message||'Internal server error'});});

  return new Promise((resolve,reject)=>{
    const server=app.listen(PORT,'127.0.0.1',()=>resolve({server,close:()=>new Promise(r=>{server.close(()=>{db.close(()=>r())})})}));
    server.on('error',reject);
  });
}

module.exports = { startServer };

// Allow running the API on its own for development: `npm run dev:api`
if (require.main === module) {
  startServer()
    .then(() => console.log(`[QBT API] Listening on http://127.0.0.1:${PORT} (DB: ${DB_PATH})`))
    .catch((err) => { console.error('[QBT API] Failed to start:', err); process.exit(1); });
}
