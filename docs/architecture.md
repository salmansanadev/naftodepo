# Nafto Depo — Phase 1 architecture baseline

## Audited baseline
React/Vite renderer in src/main.tsx calls window.depo directly. Electron preload and main expose IPC actions; electron/database.cjs stores stock, drivers, transactions and payments in SQLite schema version 1. Existing prices are paisa per liter. Browser currently renders a read-only layout. Existing Windows installer and tests must remain supported.

## Architecture decisions
- Keep a shared renderer and a typed asynchronous storage/operations port. Desktop implementation delegates to existing IPC; browser implementation will use IndexedDB with transactional updates. Android native storage is a later adapter. Never silently fall back to browser storage when desktop IPC fails.
- Vercel serves the static Vite build (npm run build, dist). Browser testing data must be isolated, clearly labeled and synthetic; no cloud credentials or real customer records in the repository. A service worker and offline cache require separate testing before offline browser claims.
- Preserve schema v1 and historical price semantics. Introduce additive versioned migrations, backup before migration, restore validation and migration tests before integrating new transaction fields.
- New pricing uses exactly 210 liters (210000 ml) as divisor, independent of measured volume. Sum actual measured milliliters; compute fuel amount in integer paisa, round half-up once, add loading labour or subtract unloading labour. No conversion from uncalibrated dip readings. Keep rate per drum, divisor, actual volume, labour, net total and calculation version on finalized records.
- Mixed payments are separate records with method, amount, reference and verification state. Payment recording is not bank verification. Stock movement, invoice and ledger entries must commit atomically. Preserve original receipts; corrections use auditable reversals.
- Loading as sale and unloading as purchase are provisional workflow mappings; internal transfers are separate. Confirm with depot operators before commercial rollout.
- Single-device offline operation first; simultaneous laptop/tablet use requires deliberate local-network synchronization, not independent databases presented as synchronized.
- Preserve native PDF/backup functions; browser capabilities must be explicit. No production customer use until persistence, restore, accounting, printer and device tests pass.

## Gates
1. Audit and isolate architecture decisions (this document).
2. Extract typed operations boundary and implement tested storage adapters.
3. Configure and verify Vercel preview using synthetic data.
4. UI/navigation and business branding.
5. Integrate versioned 210-liter calculation, measured quantities, loading/unloading, labour and mixed payments.
6. Invoices, party ledgers, inventory, rates, expenses, accounting, reports, permissions, backups, device packaging, sync and licensing.
7. Physical device and field acceptance testing before commercial release.

No existing database or transaction record is changed by this baseline.
