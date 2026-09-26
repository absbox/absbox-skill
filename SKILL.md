---
name: absbox
description: >-
  Model, project, and analyze structured finance deals (ABS, MBS, CLO, SRT)
  with the absbox Python library and Hastructure engine. Use for securitization
  modeling, deal maps, pool cashflow projection, bond waterfalls, tranche
  pricing, IRR/WAL, sensitivity analysis, root finding, and debugging
  projections. Python 3.10+.
metadata:
  author: absbox
  version: "4.0.0"
license: Apache-2.0
---

# absbox — Structured Finance Modeling Toolkit

absbox builds deal dictionaries ("deal maps"), sends them to a Hastructure
engine over HTTP, and returns pandas DataFrames. This file is the router; keep
it loaded. Pull detail from the files it points to.

- `REFERENCE.md` — exhaustive lookup tables (formulas, actions, constants, API).
- `golden-paths/` — verified end-to-end recipes. **Read the matching one before
  improvising a multi-step script.**
- `README.md` — human quick start.
- `doc/CHANGELOG.md` — release history tied to engine versions.

## When to use

- Model/project cashflows for ABS, MBS, CLO, SRT, or any securitization.
- Build waterfalls with tranches, triggers, accounts, fees, swaps, reserves.
- Pool/asset assumptions (CDR, CPR, recovery), sensitivity, scenario comparison.
- Bond pricing, IRR, WAL, duration, root finding / deal structuring.
- Debug or visualize a projection.

Not for: plain bond pricing with no waterfall, equity valuation, or generic
fixed-income analytics.

## Step 0 — how to approach

1. **Pick the asset type(s).** `Mortgage`, `Loan`, `Lease`, `Installment`,
   `FixedAsset`, `Invoice`, `ProjectedCashflow`, `ProjectedByFactor`.
2. **Build the pool** — `{"assets": [ [type, originDict, currentDict], ... ]}`.
3. **Choose assumptions** — pool performance (`CDR`/`CPR`/recovery) plus any
   interest-rate curves.
4. **Define the deal** — dates, accounts, bonds, waterfall, collect, status.
5. **Run** — `api.run(...)`, then read `r['bonds']`, `r['pool']`, `r['result']`.
6. **Check** `r['result']['logs']` before trusting anything.

If a golden path matches the task, follow it instead of re-deriving from these
tables.

## Setup & connection

```bash
pip install absbox      # Python 3.10+
```

```python
from absbox import API, EnginePath

api = API(EnginePath.PROD)                       # default: version check on
api = API(EnginePath.DEV, lang='english', check=False)
api = API(EnginePath.LOCAL)                      # localhost:8081 (Docker)
api = API("https://absbox.org/api/latest", 'english')
```

`EnginePath` shortcuts: `DEV`, `PROD`, `LOCAL`, `LDN_DEV`, `LDN_PROD`,
`NY_DEV`, `NY_PROD`, `USE_ENV` (reads env var `ABSBOX_SERVER`). `PROD` =
`https://absbox.org/api/latest`.

**Version rule:** the client and engine must share the same **MAJOR.MINOR**
version; the patch may differ. `check=True` (the default) enforces this at
connect and prints `local lib:x.y.z, server:x.y.z`. `check=False` disables the
check — fine for experiments, not for reproducible work. Inspect at runtime
with `api.server_info` and `api.version`.

Local engine:

```bash
docker pull yellowbean/hastructure
docker run -p 8081:8081 yellowbean/hastructure
```

Auto-select the first reachable endpoint:

```python
from absbox import PickApiFrom
api = PickApiFrom([EnginePath.PROD, EnginePath.DEV, "http://host:8081"], lang='english')
```

## Minimal complete deal (verified against the DEV engine)

```python
from absbox import API, EnginePath, mkDeal

deal = mkDeal({
    "name": "SimpleDeal",
    "dates": {
        "cutoff": "2021-03-01", "closing": "2021-06-15",
        "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
        "poolFreq": "MonthEnd", "stated": "2030-01-01"
    },
    "pool": {"assets": [
        ["Mortgage",
         {"originBalance": 12000, "originRate": ["fix", 0.045], "originTerm": 120,
          "freq": "Monthly", "type": "Level", "originDate": "2021-02-01"},
         {"currentBalance": 10000, "currentRate": 0.075,
          "remainTerm": 80, "status": "Current"}]
    ]},
    "accounts": {"acc01": {"balance": 0}},
    "bonds": {
        "A": {"balance": 8000, "rate": 0.05, "originBalance": 8000,
              "originRate": 0.05, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.05}, "bondType": {"Sequential": None}},
        "EQ": {"balance": 2000, "rate": 0.0, "originBalance": 2000,
               "originRate": 0.0, "startDate": "2021-06-15",
               "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}
    },
    "waterfall": {"Amortizing": [
        ["accrueAndPayInt", "acc01", ["A"]],
        ["payPrin", "acc01", ["A"]],
        ["payPrinResidual", "acc01", ["EQ"]]
    ]},
    "collect": [
        ["CollectedInterest", "acc01"],
        ["CollectedPrincipal", "acc01"],
        ["CollectedPrepayment", "acc01"]
    ],
    "status": ("PreClosing", "Amortizing")
})

api = API(EnginePath.DEV, lang='english')
poolAssump = ("Pool",
    ("Mortgage", {"CDR": 0.01}, {"CPR": 0.05}, {"Rate": 0.7, "Lag": 18}, None),
    None, None)
r = api.run(deal, poolAssump=poolAssump, read=True)

print(r['result']['logs'])   # check warnings first
print(r['bonds']['A'].tail())
print(r['pool']['flow'].tail())
```

`stated` must extend past the assets' remaining life, or the engine ends the
deal immediately with no cashflow.

## Deal map keys

| Key | Required | Description |
|-----|----------|-------------|
| `name` | yes | Deal identifier |
| `dates` | yes | cutoff/closing/firstPay/payFreq/poolFreq/stated |
| `pool` | yes | `{"assets": [...]}`; multi-pool = `{"PoolA": {...}, "PoolB": {...}}` |
| `accounts` | yes | Cash accounts, optional reserve targets and rates |
| `bonds` | yes | Tranches; nested map = bond group |
| `waterfall` | yes | Actions keyed by deal status |
| `collect` | yes | Maps pool sources to accounts |
| `status` | yes | `(initial, next)` e.g. `("PreClosing", "Amortizing")` |
| `fees` | no | Service/trustee fees |
| `triggers` | no | Performance triggers by point |
| `liqFacility` | no | Liquidity facilities |
| `rateSwap` | no | Swaps and caps |
| `ledgers` | no | Booking ledgers |

## Where to look next

| Topic | File |
|-------|------|
| Formula / condition / date-pattern syntax | `REFERENCE.md` §2–4 |
| Asset type fields | `REFERENCE.md` §5 |
| Waterfall action signatures | `REFERENCE.md` §9 |
| Fee types, bond/rate types | `REFERENCE.md` §6–8 |
| Pool & run assumptions, root finder | `REFERENCE.md` §12–14 |
| API methods & result structure | `REFERENCE.md` §15–16 |
| Minimal deal | `golden-paths/01-minimal-abs.md` |
| Assumptions & scenario sensitivity | `golden-paths/02-assumptions-and-scenarios.md` |
| Triggers / status switches | `golden-paths/03-triggers.md` |
| CLO-style tranche waterfall | `golden-paths/04-clo-waterfall.md` |
| Root finder / target IRR | `golden-paths/05-root-finder.md` |
| Revolving pool | `golden-paths/06-revolving.md` |
| Real loan tape | `golden-paths/07-loan-tape.md` |
| Fees, reserves, ledgers | `golden-paths/08-fees-reserves-ledgers.md` |

## Running & reading

```python
r = api.run(deal, poolAssump=..., runAssump=[...], read=True)   # read defaults True
rs = api.runByScenarios(deal, poolAssump={"base": pa1, "stress": pa2})
rs = api.runByDealScenarios(deal, runAssump={"low": ra1, "high": ra2})
rs = api.runStructs({"DealA": d1, "DealB": d2}, poolAssump=pa)
rs = api.runByCombo({"DealA": d1}, poolAssump={...}, runAssump={...})
cf = api.runPool(pool, poolAssump)          # {poolName: {"flow": DataFrame, ...}}
cf = api.runAsset("2024-01-01", [asset], poolAssump)
fl = api.runFirstLoss(deal, "B", poolAssump)   # first-loss stress factor
roots = api.runRootFinder(deal, poolAssump, runAssump, (tweak, stop))
dates = api.runDates("2021-01-01", "MonthEnd", "2022-01-01")
```

Result keys: `r['pool']['flow']`, `r['bonds'][name]`, `r['accounts'][name]`,
`r['fees']`, `r['result']['logs' | 'status' | 'waterfall' | 'inspect' | 'report']`,
`r['pricing']`. Helpers: `readBondsCf`, `readFeesCf`, `readAccsCf`,
`readInspect`, `readLedgers`, `unifyTs`, `readFlowsByScenarios`,
`readMultiFlowsByScenarios`, `readFieldsByScenarios`, `toHtml`, `toExcel`,
`compResult`. See `REFERENCE.md` §15–16.

Pass `debug=True` to `api.run`/`runRootFinder` to get the request JSON without
sending it — the cheapest way to validate a deal map offline.

## Pitfalls

1. **Version skew** — client and engine must share MAJOR.MINOR. `check=False`
   skips the check; don't ship results built with it.
2. **`read` defaults to `True`** — pass `read=False` only when you want raw
   JSON. The common mistake is expecting DataFrames after `read=False`.
3. **`stated` too short ends the deal at closing** — extend stated maturity
   past the assets' remaining term.
4. **Tuple positions are positional** — pool assumptions are
   `(assetType, default, prepay, recovery, extra)`; use `None` for gaps.
5. **Single-element formulas need a trailing comma** — `("poolBalance",)`, not
   `("poolBalance")`.
6. **Enums are dict-wrapped** — `{"Sequential": None}`, `{"Equity": None}`,
   `{"Fixed": 0.05}`; a bare string fails.
7. **Action names and group order are exact, lowercase-sensitive** —
   `payPrin`, `accrueAndPayInt`; group order is `"byName"`/`"byMaturity"`/
   `"byCurRate"`/`"byProrata"` (not `"ByName"`).
8. **Bond groups are structural, not a field** — nest the bonds:
   `"bonds": {"Senior": {"A1": {...}, "A2": {...}}}`, then reference
   `"Senior"` in group actions. A `"bondGroup"` key inside a bond is ignored.
9. **Date strings are ISO `YYYY-MM-DD`** — other formats fail or raise.
10. **Unmapped pool sources vanish silently** — every source you care about
    must appear in `"collect"`.
11. **Reserve accounts need `type`** — otherwise the account is a plain
    passthrough with no target.
12. **Group/`writeOff`/`fundWith`/`liqRepay` arg counts** — `writeOff` and
    `fundWith` need an explicit limit (`None` is fine); use the 4-arg
    `liqRepay`. See `REFERENCE.md` §9.
13. **Large responses can truncate behind proxies** — pool projections grow with
    assets × periods; keep test deals small or use a local engine.

## Verification

1. Construct the deal, run with basic assumptions, and read
   `r['result']['logs']` before anything else.
2. Pool principal + losses should approximate the original balance.
3. Amortizing tranches should reach zero by stated maturity.
4. Scenario results must differ; identical output means the varied input had
   no effect.
5. `viz(deal)` (from `absbox.local.chart`) renders a Graphviz diagram.
6. Compare pricing (WAL/duration/yield) against a benchmark.
