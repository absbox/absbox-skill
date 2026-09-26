# absbox Complete Reference

Lookup tables and exact syntax for the absbox structured finance library.
Verified against `absbox` 0.52.x / Hastructure 0.52.x. Documentation:
https://absbox-doc.readthedocs.io/en/latest/

> Conventions: formulas are tuples with a trailing comma (`("poolBalance",)`).
> Waterfall/collect/effect actions are lists. Enums are dict-wrapped
> (`{"Fixed": 0.05}`). All dates are ISO `YYYY-MM-DD`.

---

## 1. Connection & versioning

### 1.1 EnginePath shortcuts

| Enum | URL |
|------|-----|
| `DEV` | `https://absbox.org/api/dev` |
| `PROD` | `https://absbox.org/api/latest` |
| `LOCAL` | `http://localhost:8081` |
| `NY_DEV` | `https://spv.run/api/dev` |
| `NY_PROD` | `https://spv.run/api/latest` |
| `USE_ENV` | resolves env var `ABSBOX_SERVER` |

```python
API(url, lang='english', check=True)
```

`check=True` (default) requires the client and engine to share MAJOR.MINOR.
Read `api.server_info` / `api.version` for the connected versions.

### 1.2 Endpoints / request types (internal)

`Endpoints`: `RunDeal`, `RunPool`, `RunAsset`, `RunByCombo`, `RunDate`,
`RunRootFinder`, `RunMultiDeal`, `RunDealByScnearios`,
`RunDealByRunScenarios`, `RunPoolByScenarios`, `Version`.
`RunReqType`: `Single`, `MultiScenarios`, `MultiRunScenarios`,
`MultiPoolScenarios`, `MultiStructs`, `ComboSensitivity`, `SinglePool`,
`RootFinder`.

---

## 2. Formula reference

### 2.1 Pool balance / flow

| Formula | Returns | Description |
|---------|---------|-------------|
| `("poolBalance",)` | float | Current pool outstanding |
| `("poolBegBalance",)` | float | Beginning-of-period pool balance |
| `("originalPoolBalance",)` | float | Original pool balance |
| `("currentPoolDefaultedBalance",)` | float | Defaulted balance this period |
| `("cumPoolDefaultedBalance",)` | float | Cumulative defaulted balance |
| `("cumPoolNetLoss",)` | float | Cumulative net loss |
| `("cumPoolRecoveries",)` | float | Cumulative recoveries |
| `("cumPoolCollection",poolNames,field1,...)` | float | Cumulative collection on fields (`poolNames` first; `None` = all pools) |
| `("cumPoolCollectionTill",poolNames,N,field)` | float | Cumulative collection until period N |
| `("curPoolCollection",poolNames,field1,...)` | float | Current-period collection sum |
| `("schedulePoolValuation",pricing,pool)` | float | Schedule cashflow valuation |

### 2.2 Bond

| Formula | Returns | Description |
|---------|---------|-------------|
| `("bondBalance",)` | float | Sum of all bond balances |
| `("bondBalance","A","B")` | float | Sum of named bonds |
| `("originalBondBalance",)` | float | Total original bond balance |
| `("bondFactor",)` | float | Current / original bond balance |
| `("bondDuePrin","A")` | float | Due principal on bond A |
| `("bondDueInt","A")` | float | Due interest |
| `("lastBondIntPaid","A")` | float | Last interest paid |
| `("behindTargetBalance","A")` | float | Gap to target balance |
| `("bondRate","A")` | float | Current rate of bond A |
| `("bondWaRate","A","B")` | float | Weighted-average coupon |
| `("bondTxnAmt",None,"A")` | float | Total transaction amount |
| `("bondTxnAmt","<PayInt:A>","A")` | float | Tagged transaction amount |
| `("activeBondNum",)` | int | Number of active bonds |

### 2.3 Account / fee / liquidity / ledger / swap

| Formula | Returns |
|---------|---------|
| `("accountBalance",)` / `("accountBalance","A","B")` | Sum of accounts / named |
| `("accountTxnAmt",None,"A")` / `("accountTxnAmt","<tag>","A")` | Account transactions |
| `("reserveGap","A")` / `("reserveExcess","A")` | Reserve shortfall / excess |
| `("feeDue","F1")` / `("lastFeePaid","F1")` | Fee due / last paid |
| `("feeTxnAmt",None,"F1")` | Fee transaction amount |
| `("liqCredit","L1")` / `("liqBalance","L1")` | Credit line / drawn balance |
| `("ledgerBalance","L1")` / `("ledgerTxnAmount","L1")` | Ledger balance / txns |
| `("rateSwapNet",name)` / `("rateCapNet",name)` | Swap / cap net accrual |

### 2.4 Ratio / integer / bool

| Formula | Returns |
|---------|---------|
| `("cumPoolDefaultedRate",)` / `("cumPoolDefaultedRateTill",N)` | Cumulative default rate (optionally through period N) |
| `("cumPoolNetLossRate",)` | Cumulative net loss rate |
| `("poolWaRate",)` / `("bondWaRate","A","B")` | Weighted-average coupon |
| `("borrowerNumber",)` | int |
| `("monthsTillMaturity","A")` | int |
| `("periodNum",)` | int |
| `("isPaidOff","A","B")` | bool |
| `("trigger","AfterCollect","name")` | bool |
| `("isMostSenior","A",["B","C"])` | bool |
| `("status","Amortizing")` | bool |
| `("allTest",True,bool1,...)` / `("anyTest",True,bool1,...)` | bool |
| `("always",True)` / `("always",False)` | bool |

### 2.5 Arithmetic / combination

| Formula | Description |
|---------|-------------|
| `("*",F1,F2)` / `("factor",F,N)` | Multiply |
| `("/",F1,F2)` / `("divide",F1,F2)` / `("ratio",F1,F2)` | Divide |
| `("subtract",F1,F2)` / `("-",F1,F2)` | Subtract |
| `("sum",F1,F2)` / `("+",F1,F2)` | Add |
| `("max",F1,F2)` / `("min",F1,F2)` / `("avg",F1,F2)` | Max / min / average |
| `("abs",F)` | Absolute value |
| `("floorWithZero",F)` | `max(0, F)` |
| `("floorWith",F1,F2)` / `("capWith",F1,F2)` | Floor / cap |
| `("excess",F,*Fs)` | `max(0, F - sum(Fs))` |
| `("floorCap",floor,cap,value)` | Clamp |
| `("constant",N)` / `("const",N)` | Constant |
| `("custom","myDataName")` | User-defined data |

---

## 3. Condition reference

| Condition | Syntax |
|-----------|--------|
| Numeric compare | `[formula, ">" | "<" | ">=" | "<=" | "=", value]` |
| Bool check | `[formula, True]` / `[formula, False]` |
| Date compare | `["<", "2025-01-01"]` / `[">", "2025-01-01"]` / `["=", "2022-08-20"]` |
| Period | `["period", "in", [1,2,3]]` |
| Status | `["status", "Amortizing"]` |
| All (AND) | `["all", cond1, cond2]` |
| Any (OR) | `["any", cond1, cond2]` |
| Not | `["not", cond]` |
| Against curve | `[formula, ">", [["2021-01-01",0.03],["2022-01-01",0.05]]]` |
| Always true/false | `("always",True)` / `("always",False)` |

Date equality `["=", "YYYY-MM-DD"]` is commonly used inside `If` to fire an
action on a specific pay date.

---

## 4. DatePattern reference

| Pattern | Syntax |
|---------|--------|
| Month end / first | `"MonthEnd"` / `"MonthFirst"` |
| Quarter end / first | `"QuarterEnd"` / `"QuarterFirst"` |
| Year end / first | `"YearEnd"` / `"YearFirst"` |
| Daily | `"Daily"` |
| Day of month | `["DayOfMonth", D]` |
| Month/day of year | `["MonthDayOfYear", M, D]` |
| Weekday | `["Weekday", N]` (0=Mon) |
| Custom dates | `["CustomDate", "2021-01-01", "2021-06-01"]` |
| Every N months | `["EveryNMonth", "2021-01-01", N]` |
| After date | `["After", "2021-01-01", dp]` |
| Union | `["+", dp1, dp2]` |
| Difference | `["-", dp1, dp2]` |
| Offset | `["Offset", dp, N]` |

---

## 5. Asset types

Each pool entry is `[assetType, originDict, currentDict]`.

### 5.1 Mortgage

```python
["Mortgage",
 {"originBalance": 12000, "originRate": ["fix", 0.045], "originTerm": 120,
  "freq": "Monthly", "type": "Level", "originDate": "2021-02-01"},
 {"currentBalance": 10000, "currentRate": 0.075, "remainTerm": 80,
  "status": "Current"}]
```

| `type` | Meaning |
|--------|---------|
| `"Level"` | French / annuity amortization |
| `"Even"` | Straight-line principal |
| `"I_P"` | Interest-only, bullet at maturity |
| `("IO_FirstN", N, "Level")` | IO for N periods, then Level |
| `("NO_FirstN", N, "Level")` | No payment for N periods |
| `("Balloon", N)` | Balloon over N-period schedule |

Floating rate:

```python
"originRate": ["floater", 0.045, {"index": "SOFR3M", "spread": 0.01, "reset": "QuarterEnd"}]
# with cap/floor:
"originRate": ["floater", 0.045, {"index": "SOFR3M", "spread": 0.01,
                                  "reset": "QuarterEnd", "cap": 0.09, "floor": 0.03}]
```

ARM: add an `"arm"` field to the origin dict —
`{"initPeriod": 60, "firstCap": 0.02, "periodicCap": 0.01, "lifeCap": 0.06,
"lifeFloor": 0.02}`. Variants: Buy-To-Let, IO/No-payment period, prepayment
penalty types (`{"byTerm": [...]}`, `{"fixPct": [...]}`, `{"sliding": [...]}`,
`{"stepDown": [...]}`).

### 5.2 Loan

```python
["Loan",
 {"originBalance": 80000, "originRate": ["fix", 0.08], "originTerm": 36,
  "freq": "Monthly", "type": "i_p", "originDate": "2021-02-01"},
 {"currentBalance": 65000, "currentRate": 0.06, "remainTerm": 30,
  "status": "Current"}]
```

Types: `"i_p"` (interest-only then principal), `"Schedule"` (custom schedule).

### 5.3 Lease

```python
["Lease",
 {"rental": ("byDay", 2.0, ["DayOfMonth", 5]), "originTerm": 24,
  "originDate": "2021-03-01"},
 {"currentBalance": 1, "status": "Current", "remainTerm": 24}]
```

Rental: `("byDay", dailyRate, datePattern)` or `("byPeriod", amount, period)`.
Step-up: `("flatRate", r)`, `("flatAmount", a)`, `("byRates", ...)`,
`("byAmounts", ...)`.

### 5.4 Installment

```python
["Installment",
 {"originBalance": 1000, "feeRate": ["fix", 0.01], "originTerm": 12,
  "freq": "Monthly", "type": "f_p", "originDate": "2022-01-01"},
 {"status": "Current", "currentBalance": 1000, "remainTerm": 10}]
```

### 5.5 FixedAsset

```python
 ["FixedAsset",
 {"start": "2023-11-01", "originBalance": 1000000, "originTerm": 120,
  "residual": 100000, "period": "Monthly", "amortize": "Straight",
  "capacity": ("Fixed", 24*25*120*30)},
 {"remainTerm": 120, "currentBalance": 30000}]
```

`amortize`: `"Straight"` / `"DecliningBalance"`. `capacity`:
`("Fixed", v)` or `("ByTerm", [[date, v], ...])`.

### 5.6 Invoice / Receivable

```python
["Invoice",
 {"start": "2024-04-01", "originBalance": 2000, "originAdvance": 1500,
  "dueDate": "2024-06-01", "feeType": ("Fixed", 150)},
 {"status": "Current"}]
```

Fee types: `("Fixed", amount)`, `("FixedRate", rate)`,
`("AdvanceRate", rate)`, `("FactorFee", rate, days, rounding)`,
`("CompoundFee", feeType1, feeType2)`.

### 5.7 Projected cashflows

```python
["ProjectedCashflow",
 10000, "2024-01-01",                                  # beginning balance, beginning date
 [["2024-01-01", 100, 50], ["2024-02-01", 100, 45]], "MonthEnd"]
# each row: [date, principal, interest]

["ProjectedByFactor",
 [["2024-01-01", 10000], ["2024-06-01", 8000]], "MonthEnd",
 (0.02, 0.05), None]   # (default rate, prepay rate), extra
```

---

## 6. Fee types (exact)

```python
"fees": {
    "trusteeFee": {"type": {"fixFee": 30}, "feeStart": "2021-06-15"}
}
```

| Fee type | Syntax |
|----------|--------|
| One-off fixed | `{"fixFee": 100}` |
| Recurring | `{"recurFee": [datePattern, amount]}` |
| Percentage | `{"pctFee": [formula, rate]}` |
| Annual percentage | `{"annualPctFee": [formula, rate]}` |
| Custom flow | `{"customFee": [["2024-01-01", 100], ["2025-01-01", 200]]}` |
| Count-based | `{"numFee": [datePattern, formula, unitCost]}` |
| Target balance | `{"targetBalanceFee": [formula_target, formula_current]}` |
| By period | `{"byPeriod": amount}` |
| By table | `{"byTable": [datePattern, formula, table]}` |
| By bond period | `{"flowByBondPeriod": [[index, amount], ...]}` |
| By pool period | `{"flowByPoolPeriod": [[index, amount], ...]}` |

`"feeStart"` is **required** (omitting it raises since 0.45.x); `"feeEnd"` is not
accepted. A fee must be paid by a waterfall
action (`payFee`, `calcAndPayFee`, ...) to affect cashflow.

---

## 7. Bond types & rate types

### 7.1 Bond definition

```python
"bonds": {
    "A1": {"balance": 1000, "rate": 0.07, "originBalance": 1000,
           "originRate": 0.07, "startDate": "2020-01-03",
           "rateType": {"Fixed": 0.08}, "bondType": {"Sequential": None}}
}
```

Optional: `maturityDate`, `lastAccrueDate`, `dueInt`. Multi-rate bond:
`"rates": [r1, r2]` with `"rateTypes": [rt1, rt2]`.

### 7.2 Bond types (dict-wrapped)

| Type | Syntax |
|------|--------|
| Sequential | `{"Sequential": None}` |
| PAC | `{"PAC": [["2021-07-20", 800]], "anchorBonds": ["A2"]}` |
| Lockout | `{"Lockout": "2023-01-01"}` |
| Equity | `{"Equity": None}` |
| IO | `{"IO": None}` |
| Balance schedule | `{"BalanceByPeriod": [[0, 900], [5, 800], [6, 0]]}` |

### 7.3 Bond groups

Groups are **structural** — nest bonds under the group name:

```python
"bonds": {
    "Senior": {"A1": {...}, "A2": {...}},
    "Mezz":   {"B":  {...}},
    "EQ":     {"E":  {"bondType": {"Equity": None}, ...}}
}
```

Group waterfall actions then reference `"Senior"` / `"Mezz"`. A `"bondGroup"`
key inside an individual bond is not the mechanism.

### 7.4 Rate types

| Rate type | Syntax |
|-----------|--------|
| Fixed | `{"Fixed": 0.08}` / `{"fix": 0.08}` |
| Fixed + day count | `{"fix": 0.08, "dayCount": "DC_ACT_365F"}` |
| Floater (dict) | `{"rate": 0.0, "index": "SOFR3M", "spread": 0.015, "reset": "MonthEnd"}` |
| Floater (list) | `{"floater": [0.0, "SOFR3M", 0.015, "MonthEnd"]}` |
| Floater + cap **or** floor | `{"rate": 0.0, "index": "SOFR3M", "spread": 0.015, "reset": "MonthEnd", "cap": 0.09}` (cap and floor together are not supported) |
| Step-up (once) | `{"stepUp": ("once", "2024-01-01", 0.01)}` |
| Step-up (ladder) | `{"stepUp": ("ladder", "2024-01-01", 0.01, "QuarterEnd")}` |
| Cap wrapper | `("cap", 0.06, innerRateType)` |
| Floor wrapper | `("floor", 0.005, innerRateType)` |
| Ref balance | `("refBalance", formula, rateType)` |
| Ref pool rate | `("ref", 0.05, ("poolWaRate",), 1.0, "MonthEnd")` |
| Interest over interest | `("withIntOverInt", ("inflate", 0.2), {"fix": 0.0569})` |

---

## 8. Accounts

```python
"accounts": {
    "acc01":     {"balance": 0},
    "reserve":   {"balance": 50000, "type": ("fix", 50000)},
    "targetRes": {"balance": 5000, "type": ("target", ("*", ("poolBalance",), 0.0035))},
    "condRes":   {"balance": 100, "type": ("when", [("isPaidOff","A"), True],
                                          ("fix", 0), ("target", ("*",("poolBalance",),0.0035)))},
    "intAcc":    {"balance": 1000,
                  "interest": {"period": "MonthEnd", "rate": 0.02,
                               "lastSettleDate": "2021-06-15"}},
    "floatAcc":  {"balance": 1000,
                  "interest": {"period": "MonthEnd", "reset": "MonthEnd",
                               "index": "SOFR3M", "spread": 0.005, "rate": 0.0,
                               "lastSettleDate": "2021-06-15"}}
}
```

Account interest lives under the `"interest"` key (a dict, see `mkAccInt`); a
`"rate"` key is silently ignored. Reserve targets: `("fix", amount)`,
`("target", formula)`, `("when", cond, ifTrue, ifFalse)`. Without `type`, an
account is a plain passthrough.

---

## 9. Waterfall actions (exact signatures)

The waterfall is a dict keyed by deal status. Standard keys: `"Amortizing"`,
`"Accelerated"`, `"Defaulted"`, `"Revolving"`, `"cleanUp"`, `"Warehousing"`.
`"amortizing"` (lowercase) is also accepted.

### 9.1 Fees

```python
["calcFee", "fee1", "fee2"]                    # calculate due only (no source)
["payFee", "acc", ["fee1", "fee2"]]            # pay pro-rata
["payFeeBySeq", "acc", ["fee1", "fee2"]]       # pay sequentially
["calcAndPayFee", "acc", ["fee1"]]
["payFeeResidual", "acc", "fee1"]              # pay remaining due
```

### 9.2 Interest

```python
["calcInt", "A1", "A2"]                        # accrue only (no source)
["payInt", "acc", ["A1", "A2"]]
["payIntBySeq", "acc", ["A1", "A2"]]
["accrueAndPayInt", "acc", ["A1", "A2"]]
["accrueAndPayIntBySeq", "acc", ["A1", "A2"]]
["payIntResidual", "acc", "B"]
["payIntByIndex", "acc", ["A1"], 0]
["payIntOverInt", "acc", ["A1"]]               # penalty interest
```

### 9.3 Principal

```python
["payPrin", "acc", ["A1", "A2"]]
["payPrinBySeq", "acc", ["A1", "A2"]]
["payPrinResidual", "acc", ["B"]]
["payPrinWithDue", "acc", ["A1"]]              # pay scheduled principal due
["calcBondPrin", ["A1"], None]                 # accrue due principal only (bonds, limit)
["calcBondPrin", "acc", ["A1"], None]          # accrue from acc (source, bonds, limit)
["writeOff", "A1", None]                       # limit required (None ok)
["writeOff", ["A1","A2"], {"formula": ("constant", 100)}]
["fundWith", "acc", "A1", None]                # limit required
```

### 9.4 Accounts

```python
["transfer", "src", "tgt"]
["transfer", "src", "tgt", {"balCapAmt": 100}]
["transfer", "src", "tgt", {"balPct": 0.1}]
["transfer", "src", "tgt", {"formula": formula}]
["transfer", "src", "tgt", {"reserve": "gap"}]     # fill target account's gap
["transfer", "src", "tgt", {"reserve": "excess"}]  # sweep excess
["transferMultiple", ["a1", "a2"], "tgt"]
```

### 9.5 Assets

```python
["sellAsset", ["Current|Defaulted", 0.9, 0.2], "acc"]
["sellAsset", ["PvRate", 0.05], "acc"]
["buyAsset", ["Current|Defaulted", 1.0, 0], "acc"]
["buyAsset", ["PvRate", 0.05], "acc", None]
["buyAsset2", ["Current|Defaulted", 1.0, 0], "acc", None, "revPool", "dealPool"]
```

### 9.6 Liquidity

```python
["liqSupport", "liq1", "account", ["acc01"], {"formula": ("constant", 500)}]
["liqSupport", "liq1", "fee", ["fee1"], None]
["liqSupport", "liq1", "interest", ["A1"], None]
["liqRepay", ["int", "bal"], "acc", "liq1"]        # 4 args; add a 5th limit if needed
["liqRepayResidual", "acc", "liq1"]
["liqAccrue", "liq1"]
```

### 9.7 Swaps & caps

```python
["settleSwap", "acc", "swap1"]
["paySwap", "acc", "swap1"]
["receiveSwap", "acc", "swap1"]
["settleCap", "acc", "cap1"]
```

### 9.8 Control flow & inspection

```python
["If", condition, action]                # actions are variadic
["IfElse", condition, [true_actions], [false_actions]]
["changeStatus", "Accelerated"]
["changeStatusIf", condition, "Defaulted"]
["inspect", "label", formula1, formula2]
["bookBy", bookType]
# with ledger booking:
["transfer", "src", "tgt", limit, "book", "Debit", "ledgerName"]
```

### 9.9 Group actions

`source` is the paying account; `target` is the group name; `order` is one of
`"byName"`, `"byMaturity"`, `"byCurRate"`, `"byProrata"` (or
`("byName", "A1", "A2")` for a custom order). Groups must be defined as nested
bond maps (§7.3).

```python
["calcIntByGroup", ["Senior"]]
["accrueAndPayIntByGroup", "acc", "Senior", "byName"]
["payIntByGroup", "acc", "Senior", "byName"]
["payPrinByGroup", "acc", "Senior", "byName"]
```

### 9.10 Limit syntax

| Limit | Syntax |
|-------|--------|
| Amount cap | `{"balCapAmt": 100}` |
| Balance pct | `{"balPct": 0.1}` |
| Formula | `{"formula": formula}` |
| Reserve gap / excess | `{"reserve": "gap"}` / `{"reserve": "excess"}` |

---

## 10. Collection rules & pool sources

```python
"collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"]]

# percentage split
"collect": [["CollectedInterest", [["acc01", 0.8], ["acc02", 0.2]]]]

# multi-pool: [[poolName], source, account]
"collect": [[["PoolA"], "CollectedInterest", "acc01"],
            [["PoolB"], "CollectedInterest", "acc02"]]
```

Pool sources: `CollectedInterest`, `CollectedPrincipal`, `CollectedPrepayment`,
`CollectedRecoveries`, `CollectedRental`, `CollectedFeePaid`, `CollectedCash`,
plus `NewDefaults`, `NewDelinquencies`, `NewLosses`, `CurBalance`,
`CurBegBalance`.

---

## 11. Triggers

```python
"triggers": {
    "AfterCollect": {
        "cumLoss": {
            "condition": [("cumPoolDefaultedRate",), ">", 0.03],
            "effects": ("newStatus", "Accelerated"),
            "status": False,
            "curable": True        # True = cures when condition clears
        }
    }
}
```

Trigger points: `BeforeCollect`, `AfterCollect`, `BeforeDistribution`,
`AfterDistribution`, `InDistribution`. (`EndOfPoolCollection` is not mapped by
the client, so `("trigger", "EndOfPoolCollection", ...)` raises.)

Effects:

| Effect | Syntax |
|--------|--------|
| Change status | `("newStatus", "Accelerated")` |
| Run actions | `("actions", action1, action2)` |
| Accrue fees | `["accrueFees", "fee1"]` |
| Set reserve target | `["newReserveBalance", "acc1", {"fixReserve": 1000}]` |
| Add trigger | `["newTrigger", {...}]` |
| Multiple | `["Effects", effect1, effect2]` |
| Change bond rate | `("changeBondRate", bondName, rateType, newRate)` |

---

## 12. Pool assumptions

Structure: `("Pool", (assetType, default, prepay, recovery, extra), delinq, extra)`.

```python
("Pool", ("Mortgage", {"CDR": 0.01}, {"CPR": 0.05}, {"Rate": 0.7, "Lag": 18}, None), None, None)
```

### 12.1 Default

| Type | Syntax |
|------|--------|
| Constant CDR | `{"CDR": 0.01}` |
| CDR vector | `{"CDR": [0.01, 0.02, 0.03]}` |
| CDR padding | `{"CDRPadding": [0.01, 0.02, 0.04]}` |
| By amount | `{"ByAmount": (2000, [0.25, 0.25, 0.50])}` |
| Default at end | `{"DefaultAtEndByRate": (0.05, 0.10)}` |
| By term | `{"byTerm": [[vec1], [vec2]]}` |

### 12.2 Prepayment / recovery / extra

| Type | Syntax |
|------|--------|
| Constant CPR | `{"CPR": 0.01}` |
| CPR vector / padding | `{"CPR": [...]}` / `{"CPRPadding": [...]}` |
| PSA multiple | `{"PSA": 1.5}` |
| Recovery | `{"Rate": 0.7, "Lag": 18}` or `{"Rate": 0.45, "Timing": [0.3,0.3,0.4]}` |
| Stress by curve | `{"StressByCurve": [curve, baseAssump]}` |

### 12.3 Application scope

| Scope | Syntax |
|-------|--------|
| By index | `("ByIndex", ([0,1], assump1), ([2,3], assump2))` |
| By obligor tag | `("ByObligor", ("ByTag", ["GroupA"], "TagEq", assump), ("ByDefault", assump))` |
| By obligor id | `("ByObligor", ("ById", ["OB001"], assump), ("ByDefault", assump))` |
| By obligor field | `("ByObligor", ("ByField", [("field","in",["A"])], assump), ("ByDefault", assump))` |
| By pool name | `("ByName", {"PoolA": (assump, None, None)})` |
| By pool id | `("ByPoolId", {0: assump})` |

Lease extras: `("byContinuation", p)`, `("byTermination", p)`, `("days", 30)`,
`("byAnnualRate", -0.3)`, `("byDate", "2026-09-20")`, `("byExtTimes", 3)`,
`("byRateVec", -0.25, -0.22, -0.1)`, `("earlierOf", date, N)`,
`("laterOf", date, N)`.

---

## 13. Run assumptions

A list of tuples controlling the simulation.

| Assumption | Syntax |
|------------|--------|
| Stop at date | `("stop", "2030-01-01")` |
| Clean-up call | `("call", {"poolBalance": 200})` (legacy form) |
| Conditional call | `("call", ("if", condition))` |
| Modern call | `("callWhen", options...)` |
| Flat rate | `("interest", ("SOFR3M", 0.05))` |
| Rate curve | `("interest", ("SOFR3M", [["2021-01-01", 0.05], ["2022-01-01", 0.06]]))` |
| Revolving | `("revolving", ["constant", asset], poolAssumpForNew)` |
| Revolving map | `("revolving", {"PoolX": (pool, assumps)})` |
| Pricing (PV) | `("pricing", {"date": "2021-07-26", "curve": [["2021-07-26", 0.04]]})` |
| Pricing (Z-spread) | `("pricing", {"bonds": {"A1": ("2021-07-26", 100)}, "curve": [...]})` |
| Pricing (IRR hold) | `("pricing", {"IRR": {"B": ("holding", [("2021-04-01", -500)], 500)}})` |
| Pricing (IRR sell) | `("pricing", {"IRR": {"A1": ("holding", [("2021-04-01", -500)], 500, "2021-08-19", ("byFactor", 1.0))}})` |
| Pricing (IRR buy) | `("pricing", {"IRR": {"A1": ("buy", "2021-08-01", ("byFactor", 0.99), ("byCash", 200))}})` |
| Inspect | `("inspect", (datePattern, formula))` — one tuple per inspected series |
| Report | `("report", {"dates": "MonthEnd"})` |
| Fire trigger | `("fireTrigger", [("2021-10-01", "AfterCollect", "name")])` |
| Refinance | `("refinance", ("byRate", date, account, bond, rateType))` |
| Issue bond | `("issueBond", date, group, account, bondDetail)` |
| Estimate expense | `("estimateExpense", ("tsFee", [["2021-09-01", 10]]))` |
| Make whole | `("makeWhole", date, precision, [[factor, spread], ...])` |

The pricing curve's first date must be **on or after** the pricing date.

---

## 14. Root finder

```python
api.runRootFinder(deal, poolAssump, runAssump, (tweak, stopCondition))
api.runFirstLoss(deal, bondName, poolAssump)   # shorthand for stressDefault + bondIncurLoss
```

### 14.1 Tweaks

| Tweak | Syntax |
|-------|--------|
| Stress defaults | `("stressDefault", lo, hi)` (or bare `"stressDefault"`) |
| Stress prepay | `("stressPrepayment", lo, hi)` |
| Max spread | `("maxSpread", "bondName")` (optionally `, lo, hi`) |
| Split balance | `("splitBalance", "bond1", "bond2")` (optionally `, lo, hi`) |

### 14.2 Stop conditions

| Condition | Syntax |
|-----------|--------|
| Bond any loss | `("bondIncurLoss", "B")` |
| Bond principal loss | `("bondIncurPrinLoss", "A1", amount)` |
| Bond interest loss | `("bondIncurIntLoss", "A1", amount)` |
| Prices at par | `("bondPricingEqOriginBal", "A1", bool, bool)` |
| Meets target IRR | `("bondMetTargetIrr", "A1", 0.05)` |
| Balance formula | `("byFormula", formula, target)` |

`runFirstLoss` uses `"stressDefault"` over `[1, 500]` and stops at
`("bondIncurLoss", bondName)`. A senior bond may never incur loss, so the root
finder reports `Not able to bracket the root` — choose a tranche that can take
loss.

---

## 15. API methods

| Method | Purpose |
|--------|---------|
| `api.run(deal, poolAssump, runAssump, read=True, showWarning=True, rtn=[], debug=False)` | Single run |
| `api.runByScenarios(deal, poolAssump, runAssump)` | Multiple pool scenarios |
| `api.runByDealScenarios(deal, poolAssump, runAssump)` | Multiple run scenarios |
| `api.runStructs(deals, poolAssump, nonPoolAssump, runAssump)` | Multiple structures |
| `api.runByCombo(dealMap, poolAssump, runAssump)` | Cross-product |
| `api.runPool(pool, poolAssump, rateAssump)` | Pool only; returns `{poolName: {"flow": DataFrame, ...}}` |
| `api.runPoolByScenarios(pool, poolAssump, rateAssump)` | Pool scenarios |
| `api.runAsset(date, assets, poolAssump, rateAssump, pricing)` | Single asset |
| `api.runFirstLoss(deal, bondName, poolAssump, runAssump)` | First-loss stress |
| `api.runRootFinder(deal, poolAssump, runAssump, p)` | Root finder |
| `api.runDates(d, dp, eDate)` | Dates from a date pattern |

`debug=True` returns the request JSON without sending it.

### Helper functions

| Function | Purpose |
|----------|---------|
| `readBondsCf(r)`, `readFeesCf(r)`, `readAccsCf(r)` | Combine cashflows |
| `readInspect(r['result'])` | Joint inspection frame |
| `readLedgers(r)` | Ledger balances / transactions |
| `unifyTs(r['result']['inspect'].values())` | Unify inspection series |
| `readFlowsByScenarios(rs)`, `readMultiFlowsByScenarios(rs)`, `readFieldsByScenarios(rs)` | Multi-result readers |
| `toHtml(r, path)`, `toExcel(r, path)` | Export |
| `compResult(r1, r2, names=...)` | Compare results |
| `mkDealsBy(deal, plan)`, `prodDealsBy(deal, ...)`, `prodAssumpsBy(base, ...)` | Build variants |
| `runYieldTable(api, deal, bond, assumps, pricing)` | Yield table |
| `viz(deal)` (`absbox.local.chart`) | Graphviz diagram |

---

## 16. Result structure

```python
r = api.run(deal, poolAssump=..., runAssump=..., read=True)

r['pool']['flow']                 # pool cashflow (per pool: r['pool']['flow']['PoolConsol'])
r['pool_outstanding']['flow']     # uncollected pool
r['bonds']['A1']                  # columns: balance, interest, principal, rate, cash,
                                  # intDue, intOverInt, factor, memo
r['accounts']['acc01']            # accounts is a dict keyed by account name
r['fees']['trusteeFee']           # fees is a dict keyed by fee name
                                  # (columns: balance, payment, due)
r['result']['logs']               # warnings / errors — read first
r['result']['status']             # status transitions
r['result']['waterfall']          # waterfall execution log
r['result']['waterfallInspect']   # inspect-action output
r['result']['report']['cash']     # if ("report", ...) requested
r['result']['report']['balanceSheet']
r['pricing']['summary']           # IRR / WAL / spread per bond
r['pricing']['breakdown']['A1']   # pricing detail
r['ledgers']
```

For `runByScenarios` the return value is a dict keyed by scenario name; each
value has the same structure as above.

---

## 17. Constants

**Day count:** `DC_30E_360`, `DC_30Ep_360`, `DC_ACT_360`, `DC_ACT_365`,
`DC_ACT_365A`, `DC_ACT_365L`, `DC_NL_365`, `DC_ACT_365F`, `DC_ACT_ACT`,
`DC_30_360_ISDA`, `DC_30_360_German`, `DC_30_360_US`.

**Rate indexes:** `LPR5Y`, `LPR1Y`, `LIBOR1M/3M/6M/1Y`, `USTSY1Y`–`USTSY30Y`,
`USCMT1Y`, `PRIME`, `COFI`, `SOFR1M/3M/6M/1Y`, `EURIBOR1M/3M/6M/12M`, `IRPH`,
`SONIA`.

**Periods:** `Daily`, `Weekly`, `Monthly`, `Quarterly`, `SemiAnnually`,
`Annually`.

**Statuses:** `PreClosing`, `Warehousing`, `RampUp`, `Revolving`, `Amortizing`,
`Accelerated`, `Defaulted`, `Called`, `Ended`.
