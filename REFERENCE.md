# absbox Complete Reference

Lookup tables and exact syntax for the absbox structured finance library.
Verified against `absbox` 0.52.9 (wrapper) / Hastructure 0.52.13 (engine).
Documentation: https://absbox-doc.readthedocs.io/en/latest/

> Conventions: formulas are tuples with a trailing comma (`("poolBalance",)`).
> Waterfall/collect/effect actions are lists. Enums are dict-wrapped
> (`{"Fixed": 0.05}`). All dates are ISO `YYYY-MM-DD`.

---

## 1. Connection & versioning

### 1.1 EnginePath shortcuts

| Enum | URL |
|------|-----|
| `DEV` | `https://absbox.org/api/dev` (China server) |
| `PROD` | `https://absbox.org/api/latest` (China server) |
| `LOCAL` | `http://localhost:8081` (Docker engine) |
| `NY_DEV` | `https://spv.run/api/dev` (New York server) |
| `NY_PROD` | `https://spv.run/api/latest` (New York server) |
| `USE_ENV` | resolves env var `ABSBOX_SERVER` |

There are no London endpoints in 0.52.x.

```python
API(url, lang='english', check=True, verify=False)
```

The version check (`check=True`, default) compares only the **minor (tenth)
segment** of client vs engine version; major/patch are ignored — e.g. client
0.52.9 happily talks to server 0.52.13. It prints
`✅Connected, local lib:x.y.z, server:x.y.z` on success and raises
`VersionMismatch` otherwise. Read `api.server_info` / `api.version` for the
connected versions. `check=False` disables all of this. `verify=False`
(default) keeps TLS verification off for self-signed engine servers.

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
| `("cumPoolCollection",poolSel,field1,...)` | float | Cumulative collection on fields; `poolSel` = `None` (all pools) or a list of pool names |
| `("cumPoolCollectionTill",poolSel,N,fields...)` | float | Cumulative collection up to period `N` |
| `("curPoolCollection",poolSel,field1,...)` | float | Current-period collection sum; same `poolSel` form |
| `("schedulePoolValuation",pricingMethod,poolName...)` | float | Schedule cashflow valuation (pricing method first, then pool names) |

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
| `("cumPoolDefaultedRate",)` | Cumulative default rate (no args; `("cumPoolDefaultedRateTill", N, poolNames...)` for until-period-N — `N` comes first) |
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
| `("always", True)` / `("always", False)` | bool (constant) |

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
| Always true/false | `("always", True)` / `("always", False)` |

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
| Weekday | `["Weekday", N]` (0 = Sunday, 5 = Friday) |
| Custom dates | `["CustomDate", "2021-01-01", "2021-06-01"]` |
| Every N months | `["EveryNMonth", "2021-01-01", N]` |
| After date | `["After", "2021-01-01", dp]` |
| Union | `["+", dp1, dp2]` |
| Difference | `["-", dp1, dp2]` |
| Offset | `["OffsetDatePattern", dp, N]` |

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

Types: `"i_p"` (interest-only then principal), `"Level"`/`"Even"`, or a
custom schedule: `("Schedule", [[date, remaining-ratio], ...])` or
`("Schedule", rows, datePattern)`, e.g.
`("Schedule", [["2025-01-01", 0.6], ["2030-01-01", 0.0]], "MonthEnd")` —
values are remaining-balance ratios by date. A bare `"Schedule"` string is
**not** a valid amortization type.

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

The current dict needs **`currentBalance`** (not `balance`). `amortize`:
`"Straight"` / `"DecliningBalance"`. `capacity`: `("Fixed", v)` or
`("ByTerm", ...)`.

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
# PDeal: begin (balance, date), scheduled rows, then the row frequency
["ProjectedCashflow",
 120000, "2024-01-01",
 [["2024-02-01", 0, 500], ["2024-03-01", 10000, 497]],   # [date, principal, interest]
 "MonthEnd"]
# row = (date, principal, interest); treat these as *scheduled* flows

# PDeal via priced factors: shares of the pool run with a fixed vs floating rate
["ProjectedByFactor",
 [["2024-01-01", 100000], ["2024-06-01", 96000]], "MonthEnd",   # [date, balance]
 (0.7, 0.05),                                                  # (fix share, fix rate)
 [(0.3, 0.045, 0.01, "SOFR1M")]]   # float rows: (share, rate, spread, index)
# fix share + sum of float shares MUST equal 1.0
# float rows additionally require ("interest", (index, ...)) in the run assumptions
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

**`"feeStart"` is required** on every fee since 0.45.x; it raises
`AbsboxParseError: feeStart not found` without it. Optional keys: `feeDueDate`,
`feeDue`, `feeArrears`, `feeLastPaidDate` (there is no `"feeEnd"` key). A fee
must be paid by a waterfall action (`payFee`, `calcAndPayFee`, ...) to affect
cashflow.

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
| Sequential | `{"Sequential": None}` (`"Seq"` / `"Sequential"` also work as bare strings) |
| PAC | `{"PAC": [["2021-07-20", 800]], "anchorBonds": ["A2"]}` |
| Lockout | `{"Lockout": "2023-01-01"}` |
| Equity | `{"Equity": None}` |
| IO | `"IO"` — bare string only; `{"IO": None}` is **not** a valid type |
| Z-bond | `{"Z": None}` (`"Z"`, `"Z-Tranche"` also work) |
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

### 7.4 Bond rate types

| Rate type | Syntax |
|-----------|--------|
| Fixed | `{"fix": 0.08}` / `("fix", 0.08)` (default day count `DC_ACT_365F`) |
| Fixed + day count | `{"fix": 0.08, "dayCount": "DC_ACT_365"}` |
| Floater (list form) | `{"floater": [0.05, "SOFR3M", 0.015, "MonthEnd"]}` — `[currentRate, index, spread, resetDatePattern]` |
| Floater (extended) | `{"rate": 0.05, "index": "SOFR3M", "spread": 0.015, "reset": "MonthEnd", "dayCount": ..., "cap": 0.09, "floor": 0.03}` |
| Floater conv. | `("floater", (0.05, "SOFR3M", 0.015, "MonthEnd"), "DC_ACT_365F")` |
| Step-up (once) | `{"stepUp": ("once", "2024-01-01", 0.01)}` |
| Step-up (ladder) | `{"stepUp": ("ladder", "2024-01-01", 0.01, "QuarterEnd")}` |
| Cap wrapper | `("cap", 0.06, innerRateType)` |
| Floor wrapper | `("floor", 0.005, innerRateType)` |
| Ref balance | `("refBalance", ("poolBalance",), {"fix": 0.05})` — rate tied to a formula-derived balance |
| Ref pool rate | `("ref", 0.05, ("poolWaRate",), 1.0, "MonthEnd")` — `[rate, stats, factor, reset]` |
| Interest over interest | `("withIntOverInt", ("inflate", 0.2), {"fix": 0.0569})` |

`None` as a bond rate becomes a `Fix [0, DC_ACT_365F]` (zero-coupon) bond —
but prefer an explicit `{"fix": 0}` (see H-warning about refinance events with
implicit rates). Asset `originRate` accepts the same `("fix", rate)` /
`["floater", rate, {...}]` tuple forms via the asset rate parser.

---

## 8. Accounts

```python
"accounts": {
    "acc01":     {"balance": 0},
    "reserve":   {"balance": 50000, "type": ("fix", 50000)},
    "targetRes": {"balance": 5000, "type": ("target", ("poolBalance",), 0.0035)},
    "condRes":   {"balance": 100, "type": ("when", [("isPaidOff","A"), True],
                                           ("fix", 0), ("target", ("poolBalance",), 0.0035))},
    "intAcc":    {"balance": 1000, "interest": {"period": "MonthEnd", "rate": 0.02,
                                                "lastSettleDate": "2021-06-15"}},
    "floatAcc":  {"balance": 1000, "interest": {"period": "MonthEnd", "reset": "MonthEnd",
                                                "index": "SOFR1M", "spread": 0.001,
                                                "lastSettleDate": "2021-06-15", "rate": 0.02}}
}
```

Account const `rate` is not a thing — interest-bearing uses the `"interest"`
dict: bank form `{"period", "rate", "lastSettleDate"}`, investment form
`{"period", "reset", "index", "spread", "lastSettleDate", "rate"}`.

Reserve targets (`"type"`):

| Target | Syntax |
|--------|--------|
| Fixed amount | `("fix", amt)` / `{"fixReserve": amt}` |
| Percent of formula | `("target", formula, rate)` / `{"targetReserve": [formula, rate]}` |
| Percent of sum | `("target", ("sum", f1, f2), rate)` |
| Higher/lower of | `("max", t1, t2)` / `("min", t1, t2)` |
| Conditional | `("when", condition, ifTrue, ifFalse)` |

Without `type`, an account is a plain passthrough.

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
["calcBondPrin", "acc", ["A1"]]                # accrue due principal only
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

Order for buy actions: `[liqMethod, sourceAccount, limit?, poolId?]`.

```python
["sellAsset", ["Current|Defaulted", 0.9, 0.2], "acc"]            # + optional [poolIds...]
["sellAsset", ["PvRate", 0.05], "acc"]
["buyAsset", ["Current|Defaulted", 1.0, 0], "acc"]               # + optional limit / single pool id
["buyAsset", ["PvRate", 0.05], "acc", None]
["buyAsset2", ["Current|Defaulted", 1.0, 0], "acc", None, "fromPool", "toPool"]
```

Pool pricing methods (`liqMethod`): `["Current|Defaulted", curFactor,
defaultFactor]`, `["PvRate", rate]` (`["PvRate", formula]` also maps a
formula), `["PVCurve", curve]`, `["PV|Defaulted", pv, defaultFactor]`.

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
["If", condition, action]                # actions are variadic ("if"/"条件执行" too)
["IfElse", condition, [true_actions], [false_actions]]
["changeStatus", "Accelerated"]
["changeStatusIf", condition, "Defaulted"]
["inspect", "label", formula1, formula2]
["runTriggers", "trigger1", "trigger2"]  # force-evaluate trigger(s) in-waterfall
["bookBy", ["PDL", "Debit", ("cumPoolNetLoss",), [["L1", ("poolBalance",)]]]]
# with ledger booking:
["transfer", "src", "tgt", limit, "book", "Debit", "ledgerName"]
```

### 9.9 Group actions

`source` is the paying account; `target` is the group name; `order` is one of
`"byName"`, `"byMaturity"`, `"byCurRate"`, `"byProrata"`, `"byStartDate"`,
`("byName", "A1", "A2")` (custom order), or `("reverse", order)`. Groups must
be defined as nested bond maps (§7.3).

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
`AfterDistribution`, `InDistribution`. (`"endOfCollection"` exists only as a
**waterfall** key, not a trigger point.) A trigger box may also carry a
`"name"` label.

Effects:

| Effect | Syntax |
|--------|--------|
| Change status | `("newStatus", "Accelerated")` |
| Run actions | `("actions", action1, action2)` |
| Accrue fees | `["accrueFees", "fee1"]` |
| Set reserve target | `["newReserveBalance", "acc1", {"fixReserve": 1000}]` |
| Add trigger | `["newTrigger", {...}]` — **engine caveat: dynamically added triggers are not implemented in the current Hastructure engine** |
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
| Default at end | `"DefaultAtEnd"` (bare string) or `{"DefaultAtEndByRate": (rate, pct)}` |
| By term | `{"byTerm": [[vec1], [vec2]]}` (lowercase) |
| Stress by curve | `{"StressByCurve": [stressCurve, baseDefaultAssump]}` |

### 12.2 Prepayment / recovery / extra

| Type | Syntax |
|------|--------|
| Constant CPR | `{"CPR": 0.01}` |
| CPR vector / padding | `{"CPR": [...]}` / `{"CPRPadding": [...]}` |
| PSA multiple | `{"PSA": 1.5}` |
| By term | `{"byTerm": [[vec1], [vec2]]}` |
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
| Stop at date | `("stop", "2030-01-01", ...predicates)` |
| Legacy call | `("call", option)` where `option` is one of `("poolBalance", amt)`, `("bondBalance", amt)`, `("poolFactor", pct)`, `("bondFactor", pct)`, `("afterDate", date)`, `("if", predicate)`, `("any", o1, o2)`, `("and", o1, o2)` — there is **no `("CleanUp", ...)` legacy option** in 0.52.x |
| Conditional call | `("call", ("if", condition))` |
| Modern call | `("callWhen", ("onDates", datePattern, predicates...))` or `("callWhen", ("if", predicates...))` |
| Flat rate | `("interest", ("SOFR3M", 0.05))` |
| Rate curve | `("interest", ("SOFR3M", [["2021-01-01", 0.05], ["2022-01-01", 0.06]]))` |
| Revolving | `("revolving", ["constant", asset], poolAssumpForNew)` |
| Revolving map | `("revolving", {"PoolX": (pool, assumps)})` |
| Pricing (PV) | `("pricing", {"date": "2021-07-26", "curve": [["2021-07-26", 0.04]]})` |
| Pricing (Z-spread) | `("pricing", {"bonds": {"A1": ("2021-07-26", 100)}, "curve": [...]})` |
| Pricing (IRR hold) | `("pricing", {"IRR": {"B": ("holding", [("2021-04-01", -500)], 500)}})` |
| Pricing (IRR sell) | `("pricing", {"IRR": {"A1": ("holding", [("2021-04-01", -500)], 500, "2021-08-19", ("byFactor", 1.0))}})` |
| Pricing (IRR buy) | `("pricing", {"IRR": {"A1": ("buy", "2021-08-01", ("byFactor", 0.99), ("byCash", 200))}})` |
| Inspect | `("inspect", [("MonthEnd", ("poolBalance",)), ("QuarterEnd", [("bondFactor","A"), ("poolBalance",)])])` — list of `(datePattern, formula | list-of-formulas)` |
| Report | `("report", {"dates": "MonthEnd"})` |
| Fire trigger | `("fireTrigger", [("2021-10-01", "AfterCollect", "name")])` |
| Refinance | `("refinance", ("byRate", date, account, bondName, rateType))` — the `rateType` must be explicit, e.g. `{"fix": 0.06}`; an implicit `None` produces a zero `Fix[0,...]` rate the engine rejects as a bad refi plan |
| Issue bond | `("issueBond", ("bond", date, predicate, bondName, account, balance))` or `("issueBond", (date, predicate, bondName, account, bondDict))` or 4-arg `("issueBond", (date, bondName, account, bondDict))` |
| Estimate expense | `("estimateExpense", ("myFeeName", [["2021-09-01", 10]]))` — `(feeLabel, balance-curve)` pairs |
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
r['ledgers']                      # ledger dicts when defined
r['liqProvider'] / r['rateSwap'] / r['rateCap']   # component statements
r['triggers']                     # per-point per-trigger statement frames
r['agg_accounts']                 # aggregated account view
r['_deal']                        # deal echo (name/date info)
# pass rtn=["AssetLevelFlow"] to api.run for per-asset projections under
# r['pool']['AssetLevelFlow']
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

**Periods:** the asset/frequency parser accepts `Weekly`, `BiWeekly`,
`Monthly`, `Quarterly`, `SemiAnnually`, `Annually` (plus lowercase forms) —
there is no `Daily` asset period; `"Daily"` exists only for date patterns.

**Statuses:** `PreClosing`, `Warehousing`, `Revolving`, `Amortizing`,
`Accelerated`, `Defaulted`, `Called`, `Ended`. Note the wrapper's status DSL
(`"status"` deal key / `changeStatus`) accepts `PreClosing` (optionally as
`("PreClosing", nextState)`), `Warehousing`, `Revolving`, `Amortizing`,
`Accelerated`, `Defaulted`, `Ended` — **`Called` has no DSL spelling in
0.52.x** and a `"RampUp"` spell is flat-out rejected by `mkStatus`.

---

## 18. Deal Library

`absbox` can also talk to a separate deal-library service (`absbox/library.py`):

```python
from absbox import LIBRARY, LibraryPath

lib = LIBRARY("https://absbox.com.cn/api")   # == str(LibraryPath.CN)
lib = LIBRARY("https://my-library-host/api")
lib.login("user", "password")                 # or lib.safeLogin("user")
lib.libraryInfo                               # ack info from connect
df = lib.query({"q": ...})                    # list deals -> DataFrame
dealRaw = lib.get(deal_id)                    # fetch a stored deal
info, result = lib.run(deal_id, poolAssump=..., runAssump=..., read=True)
# run() kwargs: runType ("S" default), poolAssump, runAssump, engine, tweak, stop
```

- Endpoints (internal): `ack`, `token`, `query`, `run`, `add`, `get`
  (`LibraryEndpoints`).
- `login` stores a bearer token; all query/get/run calls require it.
- `get`/`run` use **pickle** payloads — only talk to library servers you trust.
- `run` returns `(runInfo, Generic.read(result))` on `read=True` — same result
  structure as §16.

---

## 19. Advanced deal keys

Exact shapes for the less-common deal-map keys (all verified in
`absbox/local/generic.py` 0.52.9):

```python
deal = {                                    # (key list: see SKILL.md)
    "name": "MyDeal",
    "dates": dict,                 # optional "cust": {label: datePattern}
    "pool": dict,                  # extras below
    "accounts": {...}, "bonds": {...}, "fees": {...},
    "waterfall": {...}, "collect": [...], "status": ...,
    "liqFacility": {               # liquidity provider, key "start" REQUIRED
        "L1": {"type": {"total": 100000},             # | {"reset": dp, "quota": amt}
               "rateType": {"fix": 0.06},             # | {"formula": ds, "pct": 0.9}
               "feeType": {"fix": 0.002},             # | "unlimit"
               "rate": None, "fee": None,
               "start": "2021-06-15", "end": None,
               "credit": None,                        # None = unlimited; number = cap
               "dueInt": 0, "duePremium": 0, "stmt": []}},
    "rateSwap": {
        "swap1": {"updateDates": "MonthEnd",
                  "pair": (0.05, ("SOFR1M", 0.01)),   # (pay, receive): float=fixed, (idx,spread)=float
                  "base": {"fix": 100000},            # | {"formula": ds} | {"schedule": [[d, bal], ...]}
                  "start": "2021-06-15", "balance": 100000,
                  "settleDates": [("MonthEnd", "DC_ACT_365F")],  # optional (dp, dayCount) rows
                  "payRate": 0.05, "receiveRate": 0.062, "dayCount": "DC_ACT_365F"}},
    "rateCap": {
        "cap1": {"index": "SOFR1M",
                 "strike": [["2021-07-01", 0.04]],    # IRateCurve rows
                 "base": {"formula": ("poolBalance",)}, # | {"fix": bal} | {"schedule": rows}
                 "start": "2021-06-15", "end": "2027-01-01",
                 "settleDates": "MonthEnd", "rate": 0.02,
                 "lastSettleDate": None, "netcash": 0, "stmt": None}},
    "triggers": {...},               # §11
    "ledgers": {"L01": {"balance": 0}},
    "stats": {"BondPaidPeriod": 0, "PoolCollectedPeriod": 2},
    "custom": {"myData": {"const": 2.0}}   # | {"curve": rows} | {"ds": formula}
}
```

Notes:

- `liqFacility` also accepts the aliases `liqProvider`, `liquidity`,
  `insurance`, `cashAdvance`, `担保`; read back as `r['liqProvider']`.
- `stats` in 0.52.9 only surfaces integer stats — `BondPaidPeriod` and
  `PoolCollectedPeriod` (balance/rate/bool stat buckets are wired but empty).
- Pool dict extras: `"extendBy"` (datePattern to extend projections) and
  `"issuanceStat"` (`{"IssuanceBalance": N, "HistoryDefaults": N}`, aliases
  `"发行规模"/"资产池规模"/"CumulativeDefaults"/"累计违约余额"`). Multi-pool
  deals: `{"PoolA": {assets...}, "PoolB": {...}}`; re-securitization:
  `{"deals": {...}}`.
- The `"cust"` key on `dates` maps a label to a datePattern used as a custom
  execution date, e.g. `"cust": {"myDate": ["CustomDate", "2021-10-20"]}`.
- Read-back keys in results: `r['liqProvider']`, `r['rateSwap']`, `r['rateCap']`,
  `r['ledgers']`, `r['triggers']`, `r['accounts']` (plus the aggregated
  `r['agg_accounts']`), and `r['_deal']` (the deal name).
