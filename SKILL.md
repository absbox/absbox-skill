---
name: absbox
description: Model, project, and analyze structured finance deals (ABS, MBS, CLO, SRT) using the absbox Python library and Hastructure engine. Use when the user asks about securitization modeling, pool cashflow projection, bond waterfall design, tranche pricing, sensitivity analysis, or any structured product analytics.
version: 3.0.0
---

# absbox — Structured Finance Modeling Toolkit

## When to Use

- User wants to model/project cashflows for ABS, MBS, CLO, SRT, or any securitization deal
- User needs to construct deal waterfalls with tranches, triggers, accounts, fees
- User wants pool-level or asset-level performance assumptions (CDR, CPR, recovery)
- User needs sensitivity analysis, scenario comparison, or root finding (first-loss, breakeven spread)
- User asks about bond pricing, IRR, WAL, duration for structured notes
- User wants to debug or visualize deal cashflow projections
- NOT for: general fixed-income analytics without structured products, equity valuation, plain bond pricing without waterfall structure

---

## 1. Setup & Connection

### Installation

```bash
pip install absbox
```

Requirements:
- Python 3.10+
- The MINOR version of the `absbox` Python package must match the MINOR version of the Hastructure engine it connects to. Mismatches cause silent failures.

### API Connection

```python
from absbox import API, EnginePath

# Shortcut paths
api = API(EnginePath.DEV, lang='english', check=False)   # Development server
api = API(EnginePath.PROD, check=False)                  # Production server
api = API(EnginePath.LOCAL, check=False)                 # Local Docker instance

# Explicit URL
api = API("https://absbox.org/api/latest", 'english')

# Auto-connect: tries multiple endpoints in order, uses first available
from absbox import PickApiFrom
api = PickApiFrom(
    [EnginePath.PROD, EnginePath.DEV, "http://your_server:8081"],
    check=False, lang='english'
)
```

### Docker Setup (Local Engine)

```bash
docker pull yellowbean/hastructure
docker run -p 8081:8081 yellowbean/hastructure
```

Then connect locally:
```python
api = API("http://localhost:8081", lang='english', check=False)
```

---

## 2. Deal Construction Overview

All deals are created with `mkDeal()` which takes a single dictionary (the "deal map").

```python
from absbox import mkDeal

d = mkDeal({
    "name": "MY_DEAL",
    "dates": {
        "cutoff": "2021-03-01",
        "closing": "2021-06-15",
        "firstPay": "2021-07-26",
        "payFreq": ["DayOfMonth", 20],
        "poolFreq": "MonthEnd",
        "stated": "2030-01-01"
    },
    "pool": {"assets": [...]},
    "accounts": {...},
    "bonds": {...},
    "waterfall": {"Amortizing": [...]},
    "collect": [...],
    "fees": {...},
    "triggers": {...},
    "liqFacility": {...},
    "rateSwap": {...},
    "ledgers": {...},
    "status": ("PreClosing", "Amortizing")
})
```

### Deal Map Keys

| Key | Required | Description |
|-----|----------|-------------|
| `name` | Yes | Deal identifier string |
| `dates` | Yes | Cutoff, closing, first pay, frequencies, stated maturity |
| `pool` | Yes | Asset pool with `{"assets": [...]}` |
| `accounts` | Yes | Cash accounts for waterfall distribution |
| `bonds` | Yes | Tranches / notes with types and rates |
| `waterfall` | Yes | Distribution rules keyed by deal status |
| `collect` | Yes | Maps pool cashflow sources to accounts |
| `status` | Yes | Tuple of (initial status, next status) |
| `fees` | No | Service fees, trustee fees, etc. |
| `triggers` | No | Performance triggers that change deal behavior |
| `liqFacility` | No | Liquidity facilities / credit lines |
| `rateSwap` | No | Interest rate hedges |
| `ledgers` | No | Booking ledgers for tracking |

### Minimal Complete Example

```python
from absbox import mkDeal

d = mkDeal({
    "name": "SimpleDeal",
    "dates": {
        "cutoff": "2021-03-01",
        "closing": "2021-06-15",
        "firstPay": "2021-07-26",
        "payFreq": ["DayOfMonth", 20],
        "poolFreq": "MonthEnd",
        "stated": "2030-01-01"
    },
    "pool": {"assets": [
        ["Mortgage",
         {"originBalance": 12000, "originRate": ["fix", 0.045],
          "originTerm": 120, "freq": "Monthly", "type": "Level",
          "originDate": "2021-02-01"},
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
    "waterfall": {
        "Amortizing": [
            ["accrueAndPayInt", "acc01", ["A"]],
            ["payPrin", "acc01", ["A"]],
            ["payPrinResidual", "acc01", ["EQ"]]
        ]
    },
    "collect": [
        ["CollectedInterest", "acc01"],
        ["CollectedPrincipal", "acc01"],
        ["CollectedPrepayment", "acc01"]
    ],
    "status": ("PreClosing", "Amortizing")
})
```

---

## 3. Asset Types

### Mortgage (Level / Even / I_P)

```python
["Mortgage",
 {"originBalance": 12000, "originRate": ["fix", 0.045], "originTerm": 120,
  "freq": "Monthly", "type": "Level", "originDate": "2021-02-01"},
 {"currentBalance": 10000, "currentRate": 0.075, "remainTerm": 80, "status": "Current"}]
```

Amortization types: `"Level"` (even payment), `"Even"` (even principal), `"I_P"` (interest-only then bullet).

Floating-rate mortgage — replace rate with floater:
```python
"originRate": ["floater", 0.045, {"index": "SOFR3M", "spread": 0.01, "reset": "QuarterEnd"}]
```

With cap/floor on floater:
```python
"originRate": ["floater", 0.045, {"index": "SOFR3M", "spread": 0.01,
               "reset": "QuarterEnd", "cap": 0.09, "floor": 0.03}]
```

### ARM (Adjustable Rate Mortgage)

Add `"arm"` field to origin dict:
```python
["Mortgage",
 {"originBalance": 12000,
  "originRate": ["floater", 0.045, {"index": "SOFR3M", "spread": 0.01, "reset": "QuarterEnd"}],
  "originTerm": 120, "freq": "Monthly", "type": "Level", "originDate": "2021-02-01",
  "arm": {"initPeriod": 60, "firstCap": 0.02, "periodicCap": 0.01,
           "lifeCap": 0.06, "lifeFloor": 0.02}},
 {"currentBalance": 10000, "currentRate": 0.075, "remainTerm": 80, "status": "Current"}]
```

Variants: Buy-To-Let, IO/NoPayment period, prepayment penalty types.

### Loan

```python
["Loan",
 {"originBalance": 80000,
  "originRate": ["floater", 0.045, {"index": "SOFR3M", "spread": 0.01, "reset": "QuarterEnd"}],
  "originTerm": 60, "freq": "SemiAnnually", "type": "i_p", "originDate": "2021-03-01"},
 {"currentBalance": 65000, "currentRate": 0.06, "remainTerm": 48, "status": "Current"}]
```

Types: `"i_p"` (interest-only then principal at maturity), `"Schedule"` (custom repayment schedule).

### Lease

```python
["Lease",
 {"rental": ("byDay", 24.0, ["DayOfMonth", 25]), "originTerm": 36,
  "originDate": "2023-01-01", "stepUp": ("flatRate", 0.05)},
 {"currentBalance": 150, "status": "Current", "remainTerm": 30}]
```

Rental types: `("byDay", amount, datePattern)`, `("byPeriod", amount, datePattern)`.
StepUp options: `("flatRate", rate)`, `("fixAmount", amount)`, `None`.

### Installment

```python
["Installment",
 {"originBalance": 1000, "feeRate": ["fix", 0.01], "originTerm": 12,
  "freq": "Monthly", "type": "f_p", "originDate": "2022-01-01"},
 {"status": "Current", "currentBalance": 1000, "remainTerm": 10}]
```

Types: `"f_p"` (fee plus principal), `"PO_FirstN"`.

### FixedAsset

```python
["FixedAsset",
 {"start": "2023-11-01", "originBalance": 1000000, "originTerm": 120,
  "residual": 100000, "period": "Monthly", "amortize": "Straight",
  "capacity": ("Fixed", 24*25*120*30)},
 {"remainTerm": 120, "balance": 30000}]
```

Amortize: `"Straight"` (straight-line), `"DecliningBalance"`.
Capacity: `("Fixed", value)`, `("ByTimeSeries", [[date, value], ...])`.

### Receivable / Invoice

```python
["Invoice",
 {"start": "2024-04-01", "originBalance": 2000, "originAdvance": 1500,
  "dueDate": "2024-06-01", "feeType": ("Fixed", 150)},
 {"status": "Current"}]
```

Fee types: `("Fixed", amount)`, `("ByRate", rate)`, `("ByRateOnOriginal", rate)`.

### ProjectedCashflow

```python
["ProjectedCashflow",
 [["2024-01-01", 100, 50], ["2024-02-01", 100, 45], ["2024-03-01", 100, 40]],
 "MonthEnd"]
```

Each row: `[date, principal, interest]`.

### ProjectedByFactor

```python
["ProjectedByFactor",
 [["2024-01-01", 10000], ["2024-06-01", 8000]],
 "MonthEnd",
 (0.02, 0.05),   # (default rate, prepay rate)
 None]
```

---

## 4. Building Blocks

### DatePattern

| Pattern | Syntax |
|---------|--------|
| Month End | `"MonthEnd"` |
| Month First | `"MonthFirst"` |
| Quarter First | `"QuarterFirst"` |
| Quarter End | `"QuarterEnd"` |
| Year First | `"YearFirst"` |
| Year End | `"YearEnd"` |
| Daily | `"Daily"` |
| Day of Month | `["DayOfMonth", D]` |
| Month-Day of Year | `["MonthDayOfYear", M, D]` |
| Weekday | `["Weekday", 0]` (0=Monday) |
| Custom Date | `["CustomDate", "2021-01-01"]` |
| Every N Months | `["EveryNMonth", "2021-01-01", 3]` |
| After Date+Pattern | `["After", "2021-01-01", dp]` |
| Union of patterns | `["+", dp1, dp2]` |
| Difference | `["-", dp1, dp2]` |

### Formula (all use tuple syntax)

**Pool formulas:**
`("poolBalance",)`, `("poolFactor",)`, `("originalPoolBalance",)`, `("cumPoolDefaultedRate",)`, `("cumPoolDefaultedBalance",)`, `("cumPoolNetLoss",)`, `("cumPoolRecoveries",)`, `("poolWaRate",)`, `("poolBegBalance",)`, `("currentPoolDefaultedBalance",)`, `("curPoolCollection",field1,field2)`, `("cumPoolCollection",field1,field2)`

**Bond formulas:**
`("bondBalance",)`, `("bondBalance","A","B")`, `("originalBondBalance",)`, `("bondFactor",)`, `("bondWaRate","A","B")`, `("bondDueInt","A")`, `("lastBondIntPaid","A")`, `("behindTargetBalance","A")`

**Account formulas:**
`("accountBalance",)`, `("accountBalance","A","B")`, `("reserveGap","A")`, `("reserveExcess","A")`

**Fee formulas:**
`("feeDue","F1")`, `("lastFeePaid","F1")`

**Liquidity & Ledger:**
`("liqCredit","L1")`, `("liqBalance","L1")`, `("ledgerBalance","L1")`, `("ledgerTxnAmount","L1")`

**Integer formulas:**
`("borrowerNumber",)`, `("monthsTillMaturity","A")`, `("periodNum",)`

**Boolean formulas:**
`("isPaidOff","A","B")`, `("trigger","AfterCollect","name")`, `("isMostSenior","A",["B","C"])`, `("status","Amortizing")`

**Combination / Arithmetic:**
`("*",F1,F2)`, `("factor",F,N)`, `("max",F1,F2)`, `("min",F1,F2)`, `("sum",F1,F2)`, `("/",F1,F2)`, `("subtract",F1,F2)`, `("abs",F)`, `("floorWithZero",F)`, `("excess",F,Fs)`, `("floorCap",floor,cap,val)`, `("constant",N)`, `("custom","name")`

### Condition

```python
# Numeric comparison (supports >, <, >=, <=, =)
[("cumPoolDefaultedRate",), ">", 0.05]
[("bondBalance", "A"), "<=", 1000]
[("accountBalance", "acc01"), "=", 0]

# Boolean check
[("isPaidOff", "A"), True]
[("trigger", "AfterCollect", "myTrig"), False]

# Date comparison
["<", "2025-01-01"]

# Status check
["status", "Amortizing"]

# Logical combination
["all", condition1, condition2]   # AND
["any", condition1, condition2]   # OR
["not", condition]                # NOT
```

### Curve & Table Syntax

Time-series curve (used for rate projections, pricing):
```python
[["2021-01-01", 0.05], ["2022-01-01", 0.06], ["2023-01-01", 0.055]]
```

### Pricing Method

```python
("pricing", {"date": "2021-08-22", "curve": [["2021-01-01", 0.025]]})
```

---

## 5. Accounts

```python
"accounts": {
    "acc01": {"balance": 0},                                         # Basic passthrough
    "reserveAcc": {"balance": 50000, "type": ("fix", 50000)},       # Fixed target reserve
    "targetRes": {"balance": 5000,
                  "type": ("target", ("*", ("poolBalance",), 0.0035))},  # Formula target
    "condReserve": {"balance": 100,
        "type": ("when",
                 [("isPaidOff", "A"), True],
                 ("fix", 0),
                 ("target", ("*", ("poolBalance",), 0.0035)))},      # Conditional reserve
    "intAcc": {"balance": 1000, "rate": ("fixed", 0.02)},           # Fixed interest
    "floatAcc": {"balance": 1000, "rate": ("floater", "SOFR3M", 0.005)}  # Floating interest
}
```

Reserve types:
- `("fix", amount)` — fixed target balance
- `("target", formula)` — dynamic target based on formula
- `("when", condition, type_if_true, type_if_false)` — conditional target

Interest accrual: `("fixed", rate)` or `("floater", index, spread)`.

---

## 6. Bonds / Tranches

### Bond Definition

```python
"bonds": {
    "A1": {
        "balance": 1000,
        "rate": 0.07,
        "originBalance": 1000,
        "originRate": 0.07,
        "startDate": "2020-01-03",
        "rateType": {"Fixed": 0.08},
        "bondType": {"Sequential": None}
    },
    "B": {
        "balance": 500,
        "rate": 0.0,
        "originBalance": 500,
        "originRate": 0.0,
        "startDate": "2020-01-03",
        "rateType": {"Fixed": 0.00},
        "bondType": {"Equity": None}
    }
}
```

### Bond Types

| Type | Syntax | Description |
|------|--------|-------------|
| Sequential | `{"Sequential": None}` | Pays in seniority order |
| PAC | `{"PAC": [["2021-07-20", 800]], "anchorBonds": ["A2"]}` | Planned amortization class |
| Lockout | `{"Lockout": "2023-01-01"}` | No principal until date |
| Equity | `{"Equity": None}` | Residual tranche |
| IO | `{"IO": None}` | Interest-only tranche |
| Z-Bond | `{"Z": None}` | Accrues interest, pays later |
| BalanceByPeriod | `{"BalanceByPeriod": [[0, 900], [5, 800], [6, 0]]}` | Scheduled balance |

### Rate Types

| Type | Syntax |
|------|--------|
| Fixed | `{"Fixed": 0.08}` |
| Floater | `{"Floater": {"index": "SOFR3M", "spread": 0.015, "reset": "MonthEnd"}}` |
| Floater w/ cap/floor | `{"Floater": {"index": "LIBOR1M", "spread": 0.02, "reset": "QuarterEnd", "cap": 0.09, "floor": 0.03}}` |
| StepUp (once) | `{"stepUp": ("once", "2024-01-01", 0.01)}` |
| StepUp (ladder) | `{"stepUp": ("ladder", "2024-01-01", 0.01, "QuarterEnd")}` |
| Cap wrapper | `("cap", 0.06, floater_rate_type)` |
| Floor wrapper | `("floor", 0.005, floater_rate_type)` |
| RefBalance | `("refBalance", formula, rateType)` |
| Ref pool rate | `("ref", 0.05, ("poolWaRate",), 1.0, "MonthEnd")` |
| InterestOverInterest | `("withIntOverInt", ("inflate", 0.2), {"fix": 0.0569})` |

### Bond Group

Add `"bondGroup": "Senior"` to bond definition to enable group-level waterfall actions.

### Optional Bond Fields

- `maturityDate` — legal final maturity date
- `lastAccrueDate` — override last accrual date
- `dueInt` — initial due interest amount
- `bondGroup` — group name for group actions

---

## 7. Fees

```python
"fees": {
    "serviceFee": {"type": {"annualPctFee": [("poolBalance",), 0.005]}, "feeStart": "2021-06-15"},
    "trusteeFee": {"type": {"fixFee": 1500}, "feeStart": "2021-06-15"}
}
```

| Type | Syntax | Description |
|------|--------|-------------|
| fixFee | `{"fixFee": 1500}` | Fixed amount per period |
| recurFee | `{"recurFee": 500}` | Recurring fixed fee |
| pctFee | `{"pctFee": [formula, 0.005]}` | Percentage of formula value |
| annualPctFee | `{"annualPctFee": [formula, 0.005]}` | Annual % prorated per period |
| customFee | `{"customFee": [["2021-01-01", 100], ["2022-01-01", 200]]}` | Custom schedule |
| numFee | `{"numFee": [("borrowerNumber",), 10]}` | Per-unit fee |
| targetBalanceFee | `{"targetBalanceFee": ("reserveGap", "acc01")}` | Fee to fill reserve target |
| byPeriod | `{"byPeriod": [[1, 500], [6, 300]]}` | By period number |
| byTable | `{"byTable": [["2021-01-01", 500], ["2022-01-01", 300]]}` | By date schedule |

---

## 8. Collection Rules

Collection rules map pool cashflow sources to accounts.

```python
# Simple: all to one account
"collect": [
    ["CollectedInterest", "acc01"],
    ["CollectedPrincipal", "acc01"],
    ["CollectedPrepayment", "acc01"],
    ["CollectedRecoveries", "acc01"]
]

# Percentage allocation
"collect": [["CollectedInterest", [["acc01", 0.8], ["acc02", 0.2]]]]

# Multiple pools
"collect": [[["PoolA"], "CollectedInterest", "acc01"],
            [["PoolB"], "CollectedInterest", "acc02"]]

# Dict syntax (v0.52.3+)
"collect": [{"source": "CollectedInterest", "accountByPct": {"acc01": 0.8, "acc02": 0.2}}]
```

### Pool Source Enums

`CollectedInterest`, `CollectedPrincipal`, `CollectedPrepayment`, `CollectedRecoveries`, `CollectedRental`, `CollectedFeePaid`, `CollectedCash`

---

## 9. Waterfall Actions (Complete Reference)

The waterfall is a dict keyed by deal status, each containing a list of actions:
```python
"waterfall": {"Amortizing": [...], "Accelerated": [...]}
```

### Fee Actions

```python
["calcFee", "acc01", ["fee1"]]                   # Calculate fee due only
["payFee", "acc01", ["fee1", "fee2"]]            # Pay fees pro-rata
["payFeeBySeq", "acc01", ["fee1", "fee2"]]       # Pay fees sequentially
["calcAndPayFee", "acc01", ["fee1"]]             # Calculate then pay in one step
["payFeeResidual", "acc01", "fee1"]              # Pay any remaining fee due
```

### Interest Actions

```python
["calcInt", "acc01", ["A1"]]                         # Calculate interest only
["payInt", "acc01", ["A1"]]                          # Pay interest pro-rata
["payIntBySeq", "acc01", ["A1", "A2"]]               # Pay interest sequentially
["accrueAndPayInt", "acc01", ["A1", "A2"]]           # Accrue then pay pro-rata
["accrueAndPayIntBySeq", "acc01", ["A1", "A2"]]      # Accrue then pay sequentially
["payIntResidual", "acc01", "B"]                     # Pay residual interest to bond
["payIntByIndex", "acc01", ["A1"], 0]                # Pay interest by rate index
```

### Principal Actions

```python
["payPrin", "acc01", ["A1"]]                     # Pay principal pro-rata
["payPrinBySeq", "acc01", ["A1", "A2"]]          # Pay principal sequentially
["payPrinResidual", "acc01", ["B"]]              # Pay all remaining to residual
["payPrinWithDue", "acc01", ["A1"]]              # Pay scheduled principal due
["writeOff", "A1"]                               # Write off bond balance
["fundWith", "acc01", "A1"]                      # Fund bond from account
```

### Account Actions

```python
["transfer", "acc01", "acc02"]                               # Transfer entire balance
["transfer", "acc01", "acc02", {"balCapAmt": 100}]           # Transfer with cap
["transfer", "acc01", "acc02", {"reserve": "gap"}]           # Transfer to fill reserve
["transfer", "acc01", "acc02", {"reserve": "excess"}]        # Transfer excess only
["transferMultiple", ["acc01", "acc02"], "acc03"]             # Multiple sources to one
```

### Asset Actions

```python
["sellAsset", ["Current|Defaulted", 0.9, 0.2], "acc01"]
["buyAsset", ["PvRate", 0.05], "acc01", None]
["buyAsset2", ["PvRate", 0.05], "acc01", None, "revolving_pool", "deal_pool"]
```

### Liquidity Actions

```python
["liqSupport", "liq1", "account", ["acc01"], {"formula": ("constant", 500)}]
["liqRepay", ["int", "bal"], "acc01", "liq1", None]
["liqRepayResidual", "acc01", "liq1"]
["liqAccrue", "liq1"]
```

### Swap Actions

```python
["settleSwap", "acc01", "swap1"]     # Net settlement
["paySwap", "acc01", "swap1"]        # Pay swap leg
["receiveSwap", "acc01", "swap1"]    # Receive swap leg
```

### Control Flow

```python
["If", condition, action_true, action_false]
["IfElse", condition, [true_actions_list], [false_actions_list]]
["changeStatus", "Accelerated"]
["changeStatusIf", condition, "Accelerated"]
```

### Group Actions

```python
["calcIntByGroup", "GroupName", "ByRate"]
["accrueAndPayIntByGroup", "GroupName", "ByRate"]
["payIntByGroup", "GroupName", "ByName"]
["payPrinByGroup", "GroupName", "ByName"]
```

### Inspect Action

```python
["inspect", "label_comment", ("poolBalance",), ("bondBalance",)]
```

### Booking / Ledger Actions

```python
["transfer", "acc01", "acc02", limit, "book", "Debit", "ledgerName"]
```

### Limit Syntax

| Limit | Syntax | Description |
|-------|--------|-------------|
| Cap amount | `{"balCapAmt": 100}` | Max absolute amount |
| Balance pct | `{"balPct": 0.1}` | Percentage of source |
| Formula | `{"formula": formula}` | Dynamic limit |
| Reserve gap | `{"reserve": "gap"}` | Fill reserve shortfall |
| Reserve excess | `{"reserve": "excess"}` | Only excess over target |

### Support Syntax

```python
["account", "accName"]       # Support from account
["facility", "liqName"]     # Support from liquidity facility
```

---

## 10. Triggers

```python
"triggers": {
    "AfterCollect": {
        "defaultTrigger": {
            "condition": [("cumPoolDefaultedRate",), ">", 0.05],
            "effects": ("newStatus", "Accelerated"),
            "status": False,
            "curable": False
        }
    }
}
```

### Trigger Points

| Point | When It Fires |
|-------|---------------|
| `BeforeCollect` | Before pool cashflow collection |
| `AfterCollect` | After pool cashflow collection |
| `BeforeDistribution` | Before waterfall distribution |
| `AfterDistribution` | After waterfall distribution |
| `InDistribution` | During waterfall (between actions) |
| `EndOfPoolCollection` | At end of pool collection cycle |

### Effects

| Effect | Syntax |
|--------|--------|
| Change deal status | `("newStatus", "Accelerated")` |
| Accrue fees | `["accrueFees", "fee1"]` |
| New reserve balance | `["newReserveBalance", "acc1", {"fixReserve": 1000}]` |
| Fire new trigger | `("newTrigger", trigger_definition)` |
| Multiple effects | `("Effects", effect1, effect2)` |
| Execute actions | `("actions", action1, action2)` |

### Curable Flag

- `"curable": False` — once triggered, permanent
- `"curable": True` — cures if condition no longer met

---

## 11. Liquidity Facilities

```python
"liqFacility": {
    "LiqProvider": {
        "start": "2021-06-15",
        "balance": 500000,
        "rate": {"Fixed": 0.03},
        "type": "Unlimited"
    }
}
```

### Facility Types

| Type | Syntax | Description |
|------|--------|-------------|
| Unlimited | `"Unlimited"` | No credit limit |
| Fixed total | `{"total": 5000}` | Fixed maximum draw |
| Reset quota | `{"reset": "QuarterEnd", "quota": 2000}` | Resets each period |
| Formula-based | `{"formula": ("poolBalance",), "pct": 0.05}` | Dynamic limit |

Optional fields: `balance` (initial drawn), `rate` (`{"Fixed": r}` or `{"Floater": {...}}`), `fee`/`premium`.

---

## 12. Rate Hedges

### Rate Swap

```python
"rateSwap": {
    "IRS_01": {
        "start": "2021-06-15",
        "settleDates": ["QuarterEnd"],
        "pair": [("LPR5Y", 0.01), 0.05],
        "base": {"formula": ("poolBalance",)}
    }
}
```

The `pair` field: `[(index, spread), fixedRate]` defines the floating vs fixed legs.

### Rate Cap

```python
"rateSwap": {
    "cap1": {
        "index": "LIBOR6M",
        "strike": ["2023-01-01", 0.03, "2024-01-01", 0.05],
        "base": {"fix": 10000},
        "start": "2022-01-01",
        "end": "2025-01-01",
        "settleDates": "QuarterEnd",
        "rate": 0.035
    }
}
```

---

## 13. Running Deals

```python
# Single run
r = api.run(deal, poolAssump=poolAssump, runAssump=runAssump, read=True)

# Multi-scenario pool assumptions
rs = api.runByScenarios(deal, poolAssump={"base": pa1, "stress": pa2})

# Multi-scenario deal assumptions
rs = api.runByDealScenarios(deal, runAssump={"low": ra1, "high": ra2})

# Multi-structure
rs = api.runStructs({"DealA": deal1, "DealB": deal2},
                    poolAssump=poolAssump, runAssump=runAssump)

# Combo (cross-product of scenarios)
rs = api.runByCombo({"DealA": deal1},
                    poolAssump={"base": pa1, "stress": pa2},
                    runAssump={"low": ra1, "high": ra2})

# Pool-only (no deal structure)
r = api.runPool(pool, poolAssump)

# Single asset
r = api.runAsset("2024-01-01", [asset], poolAssump)
```

---

## 14. Pool Assumptions

### By Pool Level

```python
poolAssump = ("Pool",
    ("Mortgage", {"CDR": 0.01}, {"CPR": 0.01}, {"Rate": 0.7, "Lag": 18}, None),
    None,   # delinquency
    None    # extra
)
```

Structure: `("Pool", (assetType, default, prepay, recovery, extra), delinq, extra_pool)`

### By Index

```python
poolAssump = ("ByIndex",
    ([0, 1], ("Mortgage", {"CDR": 0.02}, {"CPR": 0.01}, {"Rate": 0.5, "Lag": 12}, None)),
    ([2, 3], ("Mortgage", {"CDR": 0.05}, None, {"Rate": 0.3, "Lag": 24}, None))
)
```

### By Obligor

```python
# By tag
poolAssump = ("ByObligor",
    ("ByTag", ["GroupA"], "TagEq", assump1),
    ("ById", ["OB001"], assump2),
    ("ByDefault", assump3))

# By field
poolAssump = ("ByObligor",
    ("ByField", [("fieldName", "in", ["optionA"])], assump),
    ("ByDefault", assump))
```

### By Pool Name / Id

```python
poolAssump = ("ByName", {"poolA": (assump, None, None), "poolB": (assump, None, None)})
poolAssump = ("ByPoolId", {0: assump1, 1: assump2})
```

### Default Assumptions

| Type | Syntax |
|------|--------|
| Constant CDR | `{"CDR": 0.01}` |
| CDR Vector | `{"CDR": [0.01, 0.02, 0.03]}` |
| CDR Padding | `{"CDRPadding": [...]}` |
| By Amount | `{"ByAmount": (amount, [pcts])}` |
| Default at End | `{"DefaultAtEndByRate": (r1, r2)}` |
| By Term | `{"ByTerm": [[v1], [v2]]}` |

### Prepayment Assumptions

| Type | Syntax |
|------|--------|
| Constant CPR | `{"CPR": 0.01}` |
| CPR Vector | `{"CPR": [0.01, 0.02]}` |
| CPR Padding | `{"CPRPadding": [...]}` |
| PSA Multiple | `{"PSA": 1.5}` |
| By Term | `{"ByTerm": [...]}` |

### Recovery Assumptions

| Type | Syntax |
|------|--------|
| Rate + Lag | `{"Rate": 0.7, "Lag": 18}` (months) |
| Rate + Timing | `{"Rate": 0.45, "Timing": [0.3, 0.3, 0.4]}` |

### Extra Stress

```python
{"StressByCurve": [curve, baseAssump]}
```

### Lease-Specific Assumptions

```python
("byContinuation", 0.02)      # Continuation probability
("byTermination", 0.05)       # Early termination rate
("days", 30)                   # Gap days between leases
("byAnnualRate", -0.3)        # Annual rental change
("byDate", "2026-09-20")      # Pool end date
```

### FixedAsset-Specific Assumptions

Utilization curve: `[["2024-01-01", 0.9], ["2025-01-01", 0.85]]`
Cash value curve: `[["2024-01-01", 800000], ["2025-01-01", 700000]]`

---

## 15. Run Assumptions (Deal-Level)

Run assumptions is a list of tuples controlling the simulation:

```python
runAssump = [
    ("stop", "2030-01-01"),
    ("call", ("CleanUp", ("poolBalance", 200))),
    ("interest", ("SOFR3M", [["2021-01-01", 0.05], ["2022-01-01", 0.06]])),
    ("pricing", {"date": "2021-08-22", "curve": [["2021-01-01", 0.025]]}),
    ("inspect", ["MonthEnd", ("poolFactor",)]),
    ("report", {"dates": "MonthEnd"}),
    ("revolving", ["constant", asset], poolAssumpForNewAssets),
    ("fireTrigger", [("2021-10-01", "AfterCollect", "triggerName")]),
    ("refinance", ("byRate", "2022-04-01", "acc01", "A1", {"Fixed": 0.05})),
    ("issueBond", "2022-04-02", "A", "acc01", bondDetail),
    ("estimateExpense", ("tsFee", [["2021-09-01", 10]])),
    ("makeWhole", "2022-04-20", 0.001, [[0.08, 0.005], [0.55, 0.01], [100, 0.02]])
]
```

### Key Run Assumption Types

**Stop:** `("stop", "2030-01-01")`

**Call:** `("call", ("CleanUp", ("poolBalance", 200)))` or `("call", ("Conditional", condition))`

**Interest curves:** `("interest", ("SOFR3M", [["2021-01-01", 0.05]]))` or flat: `("interest", ("SOFR3M", 0.04))`

**Revolving:** `("revolving", ["constant", asset], poolAssumpForNewAssets)`

**Pricing (PV):** `("pricing", {"date": "2021-08-22", "curve": [["2021-01-01", 0.025]]})`

**Pricing (Z-spread):** `("pricing", {"bonds": {"A1": ("2021-07-26", 100)}, "curve": [...]})`

**Pricing (IRR hold):** `("pricing", {"IRR": {"B": ("holding", [("2021-04-01", -500)], 500)}})`

**Pricing (IRR buy):** `("pricing", {"IRR": {"A1": ("buy", price, settlement_date)}})`

**Inspect:** `("inspect", ["MonthEnd", ("poolFactor",), ("bondBalance",)])`

**Report:** `("report", {"dates": "MonthEnd"})`

**Fire Trigger:** `("fireTrigger", [("2021-10-01", "AfterCollect", "triggerName")])`

**Refinance:** `("refinance", ("byRate", "2022-04-01", "acc01", "A1", {"Fixed": 0.05}))`

**Issue Bond:** `("issueBond", "2022-04-02", "A", "acc01", bondDetail)`

**Estimate Expense:** `("estimateExpense", ("tsFee", [["2021-09-01", 10]]))`

**Make Whole:** `("makeWhole", "2022-04-20", 0.001, [[0.08, 0.005], [0.55, 0.01], [100, 0.02]])`

---

## 16. Reading Results

```python
r = api.run(deal, poolAssump=poolAssump, runAssump=runAssump, read=True)

# Cashflow DataFrames
r['pool']['flow']            # Pool cashflow
r['bonds']['A1']             # Bond A1 cashflow
r['accounts']['acc01']       # Account cashflow
r['fees']                    # Fee cashflow

# Non-cashflow results
r['result']['status']        # Final deal status
r['result']['waterfall']     # Which waterfalls ran each period
r['result']['inspect']       # Inspection formula values
r['result']['logs']          # Errors and warnings
r['result']['report']        # Financial reports (cash, balanceSheet)

# Pricing
r['pricing']                 # WAL, duration, price, spread per bond
```

### Helper Functions

```python
from absbox import readBondsCf, readFeesCf, readAccsCf, readInspect, unifyTs

bonds_df = readBondsCf(r)                  # Combined bonds DataFrame
fees_df = readFeesCf(r)                    # Combined fees DataFrame
accs_df = readAccsCf(r)                    # Combined accounts DataFrame
inspect_df = readInspect(r['result'])      # Joint inspection
unified = unifyTs(r)                       # Unified time-series
```

### Export

```python
from absbox import toHtml, toExcel, compResult

toHtml(r, "report.html")                   # HTML report
toExcel(r, "report.xlsx")                  # Excel report
comparison = compResult(result1, result2)   # Compare two results
```

---

## 17. Sensitivity & Structuring

```python
from absbox import prodDealsBy, mkDealsBy, prodAssumpsBy, runYieldTable
from lenses import lens

# Vary deal parameters (cross-product)
deals = prodDealsBy(d,
    (lens.bonds[0][1]["rate"], [0.06, 0.075]),
    (lens.dates['closing'], ["2021-06-15", "2021-08-15"]))

# Vary pool assumptions
scenarios = prodAssumpsBy(base_assump,
    (lens[1][1]['CDR'], [0.01, 0.02, 0.03]))

# Create deal variants
deals = mkDealsBy(base_deal, modifications_list)

# Yield table
results = runYieldTable(api, deal, "A1", pool_assumps_map, pricing_assump)
```

---

## 18. Root Finder

```python
r = api.runRootFinder(deal, poolAssump, runAssump, (tweak, stopCondition))
```

### Tweaks

| Tweak | Syntax | Description |
|-------|--------|-------------|
| Stress Default | `("stressDefault", 0.5, 10.0)` | Scale default rate (start, max) |
| Stress Prepay | `("stressPrepayment", 0.5, 10.0)` | Scale prepay rate |
| Max Spread | `("maxSpread", "A")` | Find max spread for bond |
| Split Balance | `("splitBalance", "A1", "A2")` | Find optimal split |

### Stop Conditions

| Condition | Syntax | Description |
|-----------|--------|-------------|
| Any loss | `("bondIncurLoss", "B")` | Bond incurs any loss |
| Principal loss | `("bondIncurPrinLoss", "A1")` | Principal write-down |
| Interest loss | `("bondIncurIntLoss", "A1")` | Interest shortfall |
| Pricing = origin | `("bondPricingEqOrigin", "A1")` | Break-even spread |
| Target IRR | `("bondMetTargetIrr", "A1", 0.05)` | Meet target IRR |

### First-Loss Shortcut

```python
r = api.runRootFinder(deal, poolAssump, [], ("firstLoss", "A1"))
```

Finds the CDR level at which tranche A1 first incurs loss.

---

## 19. Debugging & Visualization

```python
# Check error/warning logs
r['result']['logs']

# Financial reports (requires ("report",{"dates":"MonthEnd"}) in runAssump)
r['result']['report']['cash']           # Cash report
r['result']['report']['balanceSheet']   # Balance sheet

# Account transactions (all debits/credits per period)
r['accounts']['acc01']

# Which waterfalls ran
r['result']['waterfall']

# Joint inspection reader
from absbox import readInspect
inspect_df = readInspect(r['result'])

# Graphviz deal structure visualization
from absbox.local.chart import viz
viz(deal)

# IRR calculation
from absbox.local.analytics import irr
result = irr(r['bonds']['EQ'], init=('2024-01-01', -7000))
```

---

## 20. Deal Library

```python
from absbox import LIBRARY

library = LIBRARY("http://localhost:8082/api")
library.login("user", "pass")       # or library.safeLogin() for interactive
deal_info = library.query(("id", 1))           # by ID
deals = library.query(("tag", "RMBS"))         # by tag
deal_info = library.query(("name", "MY_DEAL")) # by name

(info, result) = library.run(
    ("id", 1),
    runAssump=runAssump,
    poolAssump=poolAssump,
    runType="S",        # "S" = single, "M" = multi-scenario
    read=True,
    engine="ldn-dev"
)
```

---

## 21. Loading Real Data

### Freddie Mac Example

```python
import pandas as pd

loan_tape = pd.read_csv("freddie_mac_data.txt", sep="|")

assets = [
    ["Mortgage",
     {"originBalance": row['orig_bal'],
      "originRate": ["fix", row['rate']],
      "originTerm": row['orig_term'],
      "freq": "Monthly",
      "type": "Level",
      "originDate": str(row['orig_date'])},
     {"currentBalance": row['cur_bal'],
      "currentRate": row['cur_rate'],
      "remainTerm": row['rem_term'],
      "status": "current"}]
    for _, row in loan_tape.iterrows()
]

d = mkDeal({..., "pool": {"assets": assets}, ...})
```

Key mapping considerations:
- Convert date columns to ISO "YYYY-MM-DD" strings
- Map loan status to: "current", "defaulted", "prepaid"
- Determine amortization type from loan characteristics
- Handle ARM vs fixed using rate type field
- Match column names to absbox fields precisely

---

## 22. Constants

**Day Count Conventions:**
`DC_30E_360`, `DC_30Ep_360`, `DC_ACT_360`, `DC_ACT_365`, `DC_ACT_365A`, `DC_ACT_365L`, `DC_NL_365`, `DC_ACT_365F`, `DC_ACT_ACT`, `DC_30_360_ISDA`, `DC_30_360_German`, `DC_30_360_US`

**Interest Rate Indexes:**
`LPR5Y`, `LPR1Y`, `LIBOR1M`, `LIBOR3M`, `LIBOR6M`, `LIBOR1Y`, `USTSY1Y` through `USTSY30Y`, `USCMT1Y`, `PRIME`, `COFI`, `SOFR1M`, `SOFR3M`, `SOFR6M`, `SOFR1Y`, `EURIBOR1M`, `EURIBOR3M`, `EURIBOR6M`, `EURIBOR12M`, `IRPH`, `SONIA`

**Periods:**
`Daily`, `Weekly`, `Monthly`, `Quarterly`, `SemiAnnually`, `Annually`

**Deal Status Enums:**
`PreClosing`, `Warehousing`, `RampUp`, `Revolving`, `Amortizing`, `Accelerated`, `Defaulted`, `Called`, `Ended`

**Pool Sources:**
`CollectedInterest`, `CollectedPrincipal`, `CollectedRecoveries`, `CollectedPrepayment`, `CollectedRental`, `CollectedFeePaid`, `CollectedCash`

---

## Pitfalls

1. **MINOR version mismatch** — The absbox Python package MINOR version must match the Hastructure engine MINOR version. Mismatches cause silent failures or cryptic errors with no clear root cause indication.

2. **Pool assumptions tuple is positional** — Format: `(assetType, default, prepay, recovery, extra)`. Use `None` for unused positions. Omitting a position shifts all subsequent values incorrectly.

3. **`read=True` required for DataFrames** — Without `read=True` in `api.run()`, results are raw JSON instead of pandas DataFrames, causing confusing downstream errors.

4. **Date strings must be ISO format** — Always use `"YYYY-MM-DD"`. Other formats like `"MM/DD/YYYY"` fail silently or raise cryptic parse errors.

5. **Waterfall action names are case-sensitive** — `"payPrin"` works but `"PayPrin"` or `"payprin"` will fail. Match exact camelCase.

6. **Single-element tuples need trailing comma** — `("poolBalance",)` is a tuple; `("poolBalance")` is just a parenthesized string. This causes formula parsing failures.

7. **Bond types and rate types use dict wrappers** — Write `{"Sequential": None}` not `"Sequential"`. The dict wrapper is required for engine parsing.

8. **Missing collection mappings lose cashflows silently** — If a pool source (e.g., `CollectedRecoveries`) is not mapped in `"collect"`, those cashflows vanish without warning.

9. **EnginePath.DEV results may change** — The DEV engine updates frequently. Use pinned Docker image or PROD for reproducible results.

10. **Network latency for large pools** — Pools with 10,000+ assets can be slow over network. Use local Docker for production workloads.

11. **Bond group actions reference group name** — Use the `bondGroup` name (e.g., `"Senior"`) in group actions, not individual bond names.

12. **Reserve account requires `type` field** — Without the `"type"` field, an account has no target and acts as a simple passthrough. Add `"type": ("fix", amount)` or `"type": ("target", formula)` explicitly.

---

## Verification

1. **Run with minimal assumptions and check logs** — After constructing a deal, call `api.run(deal, read=True)` with basic pool assumptions. Inspect `r['result']['logs']` for errors or warnings indicating structural issues.

2. **Verify pool cashflow totals** — Confirm total principal collected plus losses approximates the original pool balance. Large discrepancies indicate incorrect asset definitions or missing assumptions.

3. **Check bond paydown completeness** — For amortizing tranches, verify bond balance reaches zero by stated maturity. Non-zero residual suggests waterfall logic gaps.

4. **Compare multi-scenario results** — When running scenarios, confirm differentiated outcomes. Identical results across scenarios means the varied assumption is not affecting the model.

5. **Visualize deal structure** — Use `viz(deal)` to render a Graphviz diagram. Visually confirm accounts, bonds, and flows connect as intended.

6. **Cross-check pricing metrics** — Compare WAL, duration, and yield outputs against market benchmarks or third-party analytics to validate assumptions.
