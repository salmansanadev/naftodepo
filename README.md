# Nafto Depo

Offline Windows desktop pilot for fuel depots and Zambad operators. Electron + React + TypeScript + SQLite. No login, cloud service, CDN assets, or internet access is required during normal use.

## Customer installation

Give customers **Nafto-Depo-Setup-0.1.0-x64.exe**, not the source ZIP. Double-clicking setup installs for the current Windows account, creates shortcuts, and launches the application. All runtime dependencies are bundled; no npm, Node.js, editor, or internet is needed. Windows may still show an unsigned-publisher/SmartScreen prompt.

The Windows installer workflow runs automatically on main updates. Its customer artifact is uploaded only after database tests, desktop workflow tests, building, silent installation, and tests against the installed executable pass. Download **Nafto-Depo-Customer-Installer** from the successful run. A failed or pending run does not provide a verified installer.

The workflow tests renderer HTTP blocked operation, entry through the actual UI, credit repayment, PDF export, backup/restore, and restart persistence in an isolated temporary data folder. It does not certify field reliability or implement the planned features listed below.

## Run on Windows

Install Node.js 24 LTS, download this repository, then open a terminal in the project folder:

```sh
npm ci
npm test
npm start
```

## Build installer

```sh
npm run dist:win
```

Find the installer in `release/`. Alternatively run **Actions → Windows installer → Run workflow** on GitHub and download its installer artifact. The installer is unsigned; Windows may show a publisher warning. Code signing and installation testing are release tasks, not completed claims.

## Features in this pilot

- Dashboard: petrol/diesel stock, today's sales, outstanding driver credit.
- Receive stock or issue fuel using drums × liters per drum, with 200/210 L presets.
- Cash purchases, cash sales, credit sales tied to a driver; reject insufficient stock.
- Driver directory, outstanding credit, payment collection, credit/payment history.
- Searchable transaction register and offline PDF receipts. Open a saved PDF to print it.
- SQLite backup and restore, with confirmation and an automatic safety backup before restore.
- Fixed-point milliliters and paisa storage; amounts rounded to nearest paisa per transaction.
- SQLite transactions keep stock updates and recorded movements atomic; WAL and full synchronization enabled.

## First use

1. Add drivers in **Driver Khata**.
2. Enter opening stock as **Stock received / purchase**, using actual volume and cost rate.
3. Record **Fuel issued / sale** for daily sales. Choose a driver when using credit.
4. Record collected money in that driver's Khata.
5. Save a backup to a USB drive daily. Keep copies on more than one device.

Database: Electron's userData directory, typically `%APPDATA%/Nafto Depo/naftodepo.sqlite` on Windows (the exact app folder can vary by packaging). Uninstalling does not deliberately remove business data. Back up before upgrading or reinstalling.

## Scope and remaining work

This is a pilot, not a certified commercial release. Opening driver balances, supplier credit/payables, void/reversal entries, tax accounting, profit reports, multi-PC sync, dip calibration and offline licensing are not implemented. Saved transactions cannot yet be edited or deleted. Supplier purchases currently support Cash only. Receipts show the transaction amount, not a historical running balance.

Tank stock starts at zero and is derived from recorded movements; it is not a physical dip reading. Dip-to-liter conversion must use the actual tank's verified calibration chart or dimensions. Do not infer liters from capacity alone.

Before sale: test on a physical Windows PC with networking disabled; verify restart persistence, power-loss recovery, PDF printing, full backup/restore, installer upgrades, and operation alongside the manual register for 3–5 days. Automated database tests cover arithmetic, insufficient-stock rollback, repayments, persistence, and readable backups. They do not replace Windows/operator testing.

The repository is currently public. No commercial licensing protection is included; private signing keys must never be committed when licensing is added.
