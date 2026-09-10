# absbox Complete Reference

Quick-lookup tables and exhaustive syntax patterns for the absbox structured finance modeling library.

Documentation: https://absbox-doc.readthedocs.io/en/latest/

---

## 1. Formula Reference (Complete)

### 1.1 Balance Formulas — Pool

| Formula | Returns | Description |
|---------|---------|-------------|
| `("poolBalance",)` | float | Current pool outstanding balance |
| `("poolBegBalance",)` | float | Beginning-of-period pool balance |
| `("originalPoolBalance",)` | float | Original pool balance at issuance |
| `("currentPoolDefaultedBalance",)` | float | Defaulted balance this period |
| `("cumPoolDefaultedBalance",)` | float | Cumulative defaulted balance |
| `("cumPoolNetLoss",)` | float | Cumulative net loss |
| `("cumPoolRecoveries",)` | float | Cumulative recoveries |
| `("cumPoolCollection",field1,field2)` | float | Cumulative collection on fields |
| `("cumPoolCollectionTill",N,field)` | float | Cumulative collection until period N |
| `("curPoolCollection",field1,field2)` | float | Current period collection sum |
| `("schedulePoolValuation",pricing,pool)` | float | Schedule cashflow valuation |

### 1.2 Balance Formulas — Bond

| Formula | Returns | Description |
|---------|---------|-------------|
| `("bondBalance",)` | float | Sum of all bond balances |
| `("bondBalance","A","B")` | float | Sum of specific bonds |
| `("originalBondBalance",)` | float | Total original bond balance |
| `("bondFactor",)` | float | Bond factor |
| `("bondDueInt","A","B")` | float | Due interest on bonds |
| `("lastBondIntPaid","A")` | float | Last interest paid |
| `("behindTargetBalance","A")` | float | Gap to target balance |
| `("bondTxnAmt",None,"A")` | float | Total transaction amount |
| `("bondTxnAmt","<PayInt:A>","A")` | float | Tagged transaction amount |
| `("bondRate","A")` | float | Current rate of bond A |
| `("bondWaRate","A","B")` | float | Weighted average coupon |

### 1.3 Balance Formulas — Account

| Formula | Returns | Description |
|---------|---------|-------------|
| `("accountBalance",)` | float | Sum all accounts |
| `("accountBalance","A","B")` | float | Specific accounts |
| `("reserveGap","A","B")` | float | Reserve shortfall |
| `("reserveExcess","A","B")` | float | Reserve excess |
| `("accountTxnAmt",None,"A")` | float | Total transactions |
| `("accountTxnAmt","<tag>","A")` | float | Tagged transactions |

### 1.4 Balance Formulas — Fee, Liquidity, Ledger

| Formula | Returns | Description |
|---------|---------|-------------|
| `("feeDue","F1","F2")` | float | Fee due amount |
| `("lastFeePaid","F1","F2")` | float | Last fee paid |
| `("feeTxnAmt",None,"F1")` | float | Fee transaction amount |
| `("liqCredit","L1")` | float | Available credit line |
| `("liqBalance","L1")` | float | Drawn balance |
| `("ledgerBalance","L1","L2")` | float | Ledger balance |
| `("ledgerTxnAmount","L1")` | float | Ledger transactions |
| `("rateSwapNet",name)` | float | Rate swap net accrual |
| `("rateCapNet",name)` | float | Rate cap net accrual |

### 1.5 Integer Formulas

| Formula | Returns | Description |
|---------|---------|-------------|
| `("borrowerNumber",)` | int | Number of active borrowers |
| `("monthsTillMaturity","A")` | int | Months to bond maturity |
| `("periodNum",)` | int | Pool collection period count |

### 1.6 Ratio Formulas

| Formula | Returns | Description |
|---------|---------|-------------|
| `("poolFactor",)` | float | Current/Original pool balance |
| `("bondFactor",)` | float | Current/Original bond balance |
| `("cumPoolDefaultedRate",)` | float | Cumulative default rate |
| `("cumPoolDefaultedRate",N)` | float | Default rate at period N |
| `("cumPoolNetLossRate",)` | float | Cumulative net loss rate |
| `("poolWaRate",)` | float | Pool weighted avg coupon |
| `("bondWaRate","A","B")` | float | Bond weighted avg coupon |

### 1.7 Bool Formulas

| Formula | Returns | Description |
|---------|---------|-------------|
| `("isPaidOff","A","B")` | bool | Bonds fully paid off |
| `("trigger","AfterCollect","name")` | bool | Trigger status |
| `("isMostSenior","A",["B","C"])` | bool | Is A most senior |
| `("status","Amortizing")` | bool | Deal in given status |
| `("allTest",True,bool1,bool2)` | bool | All booleans match |
| `("anyTest",True,bool1,bool2)` | bool | Any boolean matches |

### 1.8 Combination Formulas (Arithmetic)

| Formula | Description |
|---------|-------------|
| `("*",F1,F2)` or `("factor",F,N)` | Multiply |
| `("/",F1,F2)` or `("divide",F1,F2)` | Divide |
| `("subtract",F1,F2)` or `("-",F1,F2)` | Subtract |
| `("sum",F1,F2)` or `("+",F1,F2)` | Add |
| `("max",F1,F2)` | Maximum |
| `("min",F1,F2)` | Minimum |
| `("avg",F1,F2)` | Average |
| `("abs",F)` | Absolute value |
| `("floorWithZero",F)` | max(0, F) |
| `("floorWith",F1,F2)` | max(F1, F2) as floor |
| `("capWith",F1,F2)` | min(F1, F2) as cap |
| `("excess",F,*Fs)` | max(0, F - sum(Fs)) |
| `("floorCap",floor,cap,value)` | Clamp value |
| `("constant",N)` or `("const",N)` | Constant value |
| `("custom","myDataName")` | User-defined data |
| `("ratio",F1,F2)` | F1 / F2 |

---

## 2. Condition Reference (Complete)

| Condition | Syntax | Description |
|-----------|--------|-------------|
| Greater than | `[formula, ">", value]` | Numeric comparison |
| Less than | `[formula, "<", value]` | Numeric comparison |
| Greater or equal | `[formula, ">=", value]` | Numeric comparison |
| Less or equal | `[formula, "<=", value]` | Numeric comparison |
| Equal | `[formula, "=", value]` | Numeric comparison |
| Bool check | `[formula, True]` or `[formula, False]` | Boolean formula |
| Date before | `["<", "2025-01-01"]` | Current date comparison |
| Date after | `[">", "2025-01-01"]` | Current date comparison |
| Period count | `["period", ">", 5]` | Period-based |
| Status check | `["status", "Amortizing"]` | Deal status |
| All (AND) | `["all", cond1, cond2]` | All conditions true |
| Any (OR) | `["any", cond1, cond2]` | Any condition true |
| Not | `["not", cond]` | Negation |
| Against curve | `[formula, ">", [["2021-01-01",0.03],["2022-01-01",0.05]]]` | Compare with curve |
| Always true | `("alwaysTrue",)` | Constant true |
| Always false | `("alwaysFalse",)` | Constant false |

---

## 3. DatePattern Reference (Complete)

| Pattern | Syntax | Description |
|---------|--------|-------------|
| Month End | `"MonthEnd"` | Last day of each month |
| Month First | `"MonthFirst"` | First day of each month |
| Quarter End | `"QuarterEnd"` | Mar/Jun/Sep/Dec last day |
| Quarter First | `"QuarterFirst"` | Mar/Jun/Sep/Dec 1st |
| Year End | `"YearEnd"` | Dec 31 |
| Year First | `"YearFirst"` | Jan 1 |
| Daily | `"Daily"` | Every day |
| Day of Month | `["DayOfMonth", D]` | Day D of each month |
| Month+Day of Year | `["MonthDayOfYear", M, D]` | Specific M/D yearly |
| Weekday | `["Weekday", N]` | N=0(Mon)..6(Sun) |
| Custom dates | `["CustomDate", "2021-01-01", "2021-06-01"]` | Explicit dates |
| Every N months | `["EveryNMonth", "2021-01-01", N]` | Every N months from start |
| After date | `["After", "2021-01-01", dp]` | dp only after date |
| Union | `["+", dp1, dp2]` | Combine patterns |
| Difference | `["-", dp1, dp2]` | Exclude dp2 from dp1 |
| Offset | `["OffsetDatePattern", dp, N]` | Shift by N days |

---

## 4. Constants Reference

### 4.1 Day Count Conventions

| Constant | Convention |
|----------|------------|
| `DC_30E_360` | 30E/360 (European) |
| `DC_30Ep_360` | 30E+/360 |
| `DC_ACT_360` | Actual/360 |
| `DC_ACT_365` | Actual/365 (Fixed) |
| `DC_ACT_365A` | Actual/365 (Actual) |
| `DC_ACT_365L` | Actual/365 (Leap) |
| `DC_NL_365` | NL/365 |
| `DC_ACT_365F` | Actual/365F |
| `DC_ACT_ACT` | Actual/Actual (ISDA) |
| `DC_30_360_ISDA` | 30/360 (ISDA) |
| `DC_30_360_German` | 30/360 (German) |
| `DC_30_360_US` | 30/360 (US) |

### 4.2 Interest Rate Indexes

| Region | Indexes |
|--------|---------|
| China | `LPR5Y`, `LPR1Y` |
| US (Legacy) | `LIBOR1M`, `LIBOR3M`, `LIBOR6M`, `LIBOR1Y` |
| US (Current) | `SOFR1M`, `SOFR3M`, `SOFR6M`, `SOFR1Y` |
| US Treasury | `USTSY1Y` through `USTSY30Y`, `USCMT1Y` |
| US Other | `PRIME`, `COFI` |
| Europe | `EURIBOR1M`, `EURIBOR3M`, `EURIBOR6M`, `EURIBOR12M` |
| Spain | `IRPH` |
| UK | `SONIA` |

### 4.3 Periods

`Daily`, `Weekly`, `Monthly`, `Quarterly`, `SemiAnnually`, `Annually`

### 4.4 Deal Status Enums

| Status | Description |
|--------|-------------|
| `PreClosing` | Before closing (warehousing) |
| `Warehousing` | Accumulation/warehouse period |
| `RampUp` | Ramp-up period |
| `Revolving` | Active revolving |
| `Amortizing` | Normal amortization |
| `Accelerated` | Accelerated repayment |
| `Defaulted` | Deal default |
| `Called` | Clean-up call exercised |
| `Ended` | Deal terminated |

### 4.5 Pool Source Enums

`CollectedInterest`, `CollectedPrincipal`, `CollectedRecoveries`, `CollectedPrepayment`, `CollectedRental`, `CollectedFeePaid`, `CollectedCash`

### 4.6 Pricing Methods

| Method | Syntax | Description |
|--------|--------|-------------|
| Current/Default factor | `["Current|Defaulted", 0.9, 0.2]` | Factor on performing/defaulted |
| With delinquency | `["Current|Delinquent|Defaulted", 0.95, 0.8, 0.2]` | Three-state factor |
| PV + default factor | `["PV|Defaulted", curve, 0.2]` | PV for performing |
| PV curve | `["PVCurve", ts]` | PV discount all assets |
| PV rate | `["PvRate", 0.05]` | Fixed annualized rate |

---

## 5. Asset Type Quick Reference

### 5.1 Mortgage Variants

| Variant | `type` field | Description |
|---------|-------------|-------------|
| Level payment | `"Level"` | French amortization (annuity) |
| Even principal | `"Even"` | Linear amortization |
| Interest only | `"I_P"` | Interest only, bullet at maturity |
| IO first N | `("IO_FirstN", N, "Level")` | IO for N periods then Level |
| No pay first N | `("NO_FirstN", N, "Level")` | No payment for N periods |
| Balloon | `("Balloon", N)` | Balloon with N-period amort schedule |

### 5.2 Prepayment Penalty Types

| Type | Syntax |
|------|--------|
| By term | `{"byTerm": [N, rate1, rate2]}` |
| Fixed amount | `{"fixAmount": [amount, term]}` |
| Fixed pct | `{"fixPct": [pct, term]}` |
| Sliding | `{"sliding": [pct, step]}` |
| Step down | `{"stepDown": [(N1, r1), (N2, r2)]}` |

### 5.3 Lease Rental Types

| Type | Syntax |
|------|--------|
| By day | `("byDay", dailyRate, datePattern)` |
| By period | `("byPeriod", amount, period)` |

### 5.4 Lease Step-Up Types

| Type | Syntax |
|------|--------|
| Flat rate | `("flatRate", 0.05)` |
| Flat amount | `("flatAmount", 50)` |
| By rates | `("byRates", 1.05, 1.065, 1.06)` |
| By amounts | `("byAmounts", 50, 100, 150)` |

### 5.5 Invoice Fee Types

| Type | Syntax |
|------|--------|
| Fixed fee | `("Fixed", amount)` |
| Fixed rate | `("FixedRate", rate)` |
| Advance rate | `("AdvanceRate", rate)` |
| Factor fee | `("FactorFee", rate, days, rounding)` |
| Compound fee | `("CompoundFee", feeType1, feeType2)` |

---

## 6. Fee Type Quick Reference

| Fee Type | Syntax | Auto-Accrue |
|----------|--------|-------------|
| One-off fixed | `{"fixFee": 100}` | Yes |
| Recurring | `{"recurFee": [datePattern, amount]}` | Yes |
| Percentage | `{"pctFee": [formula, 0.02]}` | No |
| Annual percentage | `{"annualPctFee": [formula, 0.005]}` | No |
| Custom flow | `{"customFee": [["2024-01-01", 100]]}` | Yes |
| Count-based | `{"numFee": [datePattern, formula, unitCost]}` | Yes |
| Target balance | `{"targetBalanceFee": [formula_target, formula_current]}` | No |
| By period (v0.23.5) | `{"byPeriod": 15}` | Yes |
| By table (v0.23.5) | `{"byTable": [datePattern, formula, table]}` | Yes |
| By index (v0.23.5) | `{"byCollectPeriod": [N, formula, rate]}` | Yes |

---

## 7. Bond Rate Type Quick Reference

| Rate Type | Syntax |
|-----------|--------|
| Fixed | `{"Fixed": 0.08}` or `{"fix": 0.08}` |
| Fixed + day count | `{"fix": 0.08, "dayCount": "DC_ACT_365"}` |
| Floater (tuple) | `{"floater": [0.05, "SOFR1Y", -0.0169, "MonthEnd"]}` |
| Floater (dict, v0.52.3) | `{"rate": 0.03, "reset": "QuarterEnd", "index": "SOFR1Y", "spread": -0.0169}` |
| Floater + cap/floor | `{"floater": [...], "cap": 0.10, "floor": 0.05}` |
| Step-up (once) | `{"stepUp": ("once", "2024-01-01", 0.01)}` |
| Step-up (ladder) | `{"stepUp": ("ladder", "2024-01-01", 0.01, "QuarterEnd")}` |
| Step-up (v0.52.3) | `{"date": "2024-01-01", "spread": 0.01}` |
| Cap wrapper | `("cap", 0.06, innerRateType)` |
| Floor wrapper | `("floor", 0.005, innerRateType)` |
| Cap + Floor | `("floor", 0.005, ("cap", 0.06, innerRateType))` |
| Inverse floater | `{"InverseFloater": {"index": "SOFR3M", "cap": 0.12, "floor": 0.0}}` |
| Ref balance | `("refBalance", formula, rateType)` |
| Ref formula | `("ref", 0.05, ("poolWaRate",), 1.0, "MonthEnd")` |
| Interest over interest | `("withIntOverInt", ("inflate", 0.2), {"fix": 0.0569})` |
| Int over int (v0.52.3) | `{"intOverInt": {"inflate": 0.03}, "rateType": {"fix": 0.05}}` |
| Multi-rate | bond with `"rates": [r1, r2]` and `"rateTypes": [rt1, rt2]` |

---

## 8. Bond Type Quick Reference

| Bond Type | Syntax | Description |
|-----------|--------|-------------|
| Sequential | `{"Sequential": None}` | Pay in order of seniority |
| PAC | `{"PAC": [[date, bal], ...]}` | Planned amortization class |
| PAC + anchor | `{"PAC": [...], "anchorBonds": ["A2"]}` | PAC with companion |
| Lockout | `{"Lockout": "2023-01-01"}` | No principal until date |
| Equity | `{"Equity": None}` | Residual tranche |
| IO | `{"IO": None}` | Interest-only strip |
| Z-bond | `{"Z": None}` | Accrual bond |
| Balance schedule | `{"BalanceByPeriod": [[0,900],[5,800],[6,0]]}` | Scheduled balance |

---

## 9. Waterfall Action Quick Reference

### 9.1 Fee Actions

```python
["calcFee", "fee1", "fee2"]                           # calculate fees due
["payFee", "acc", ["fee1", "fee2"]]                   # pay pro-rata
["payFeeBySeq", "acc", ["fee1", "fee2"]]              # pay sequentially
["calcAndPayFee", "acc", ["fee1"]]                    # calc + pay
["payFeeResidual", "acc", "fee1"]                     # pay regardless of due
```

### 9.2 Interest Actions

```python
["calcInt", "A1", "A2"]                               # accrue only
["payInt", "acc", ["A1", "A2"]]                       # pay pro-rata
["payIntBySeq", "acc", ["A1", "A2"]]                  # pay sequentially
["accrueAndPayInt", "acc", ["A1", "A2"]]              # accrue + pay pro-rata
["accrueAndPayIntBySeq", "acc", ["A1", "A2"]]         # accrue + pay seq
["payIntResidual", "acc", "B"]                        # pay all as interest
["payIntByIndex", "acc", ["A1"], 0]                   # pay specific rate index
```

### 9.3 Principal Actions

```python
["payPrin", "acc", ["A1", "A2"]]                      # pay pro-rata
["payPrinBySeq", "acc", ["A1", "A2"]]                 # pay sequentially
["payPrinResidual", "acc", ["B"]]                     # pay all remaining
["payPrinWithDue", "acc", ["A1"]]                     # pay up to due
["writeOff", "A1"]                                    # write off balance
["writeOff", ["A1","A2"], {"formula":("constant",100)}]  # with limit
["fundWith", "acc", "A1"]                             # increase bond balance
```

### 9.4 Account Actions

```python
["transfer", "src", "tgt"]                            # transfer all
["transfer", "src", "tgt", {"balCapAmt": 100}]        # with amount cap
["transfer", "src", "tgt", {"balPct": 0.1}]           # with pct cap
["transfer", "src", "tgt", {"formula": formula}]      # with formula
["transfer", "src", "tgt", {"reserve": "gap"}]        # fill reserve gap
["transfer", "src", "tgt", {"reserve": "excess"}]     # sweep excess
["transferMultiple", ["a1","a2"], "tgt"]               # multiple sources
```

### 9.5 Asset Actions

```python
["sellAsset", ["Current|Defaulted", 0.9, 0.2], "acc"]
["sellAsset", {"PvRate": 0.05}, "acc"]
["buyAsset", ["PvRate", 0.05], "acc", None]
["buyAsset", ["PvRate", 0.05], "acc", {"formula": formula}]
["buyAsset2", ["PvRate", 0.05], "acc", None, "rev_pool", "deal_pool"]
```

### 9.6 Liquidity Actions

```python
["liqSupport", "liq1", "account", ["acc1"], {"formula": ("constant", 500)}]
["liqSupport", "liq1", "fee", ["fee1"], None]
["liqSupport", "liq1", "interest", ["A1"], None]
["liqRepay", "bal", "acc", "liq1", None]
["liqRepay", ["int", "bal", "premium"], "acc", "liq1", None]
["liqRepayResidual", "acc", "liq1"]
["liqAccrue", "liq1"]
```

### 9.7 Swap Actions

```python
["settleSwap", "acc", "swap1"]                        # settle net
["paySwap", "acc", "swap1"]                           # pay obligation
["receiveSwap", "acc", "swap1"]                       # receive payment
```

### 9.8 Control Flow

```python
["If", condition, action_true, action_false]
["IfElse", condition, [true_actions], [false_actions]]
["changeStatus", "Accelerated"]
["changeStatusIf", condition, "Defaulted"]
["inspect", "comment", formula1, formula2]
```

### 9.9 Group Actions

```python
["calcIntByGroup", "A"]
["accrueAndPayIntByGroup", "A", "ByRate"]
["payIntByGroup", "A", "ByMaturity", {"limit": {...}}]
["payPrinByGroup", "A", "ByName"]
```

### 9.10 Booking/Ledger Actions

```python
["transfer", "src", "tgt", limit, "book", "Debit", "ledgerName"]
["bookBy", ["PDL", default, [(ledger, cap)]]]
["bookBy", ["formula", ledger, "Debit", formula]]
```

### 9.11 Limit Syntax

| Limit | Syntax |
|-------|--------|
| Amount cap | `{"balCapAmt": 500}` |
| Percentage cap | `{"balPct": 0.1}` |
| Formula | `{"formula": formula}` |
| Reserve gap | `{"reserve": "gap"}` |
| Reserve excess | `{"reserve": "excess"}` |

### 9.12 Support Syntax

```python
["account", "accName"]
["facility", "liqName"]
["support", ["account", "a1"], ["facility", "l1"]]
```

---

## 10. Pool Assumption Patterns

### 10.1 Default Assumptions

| Type | Syntax |
|------|--------|
| Constant CDR | `{"CDR": 0.01}` |
| CDR vector | `{"CDR": [0.01, 0.02, 0.03]}` |
| CDR padding | `{"CDRPadding": [0.01, 0.02, 0.04]}` |
| By amount | `{"ByAmount": (2000, [0.25, 0.25, 0.50])}` |
| Default at end | `{"DefaultAtEndByRate": (0.05, 0.10)}` |
| By term | `{"ByTerm": [[vec1], [vec2]]}` |
| Stress by curve | `{"StressByCurve": [curve, baseAssump]}` |

### 10.2 Prepayment Assumptions

| Type | Syntax |
|------|--------|
| Constant CPR | `{"CPR": 0.01}` |
| CPR vector | `{"CPR": [0.01, 0.02, 0.03]}` |
| CPR padding | `{"CPRPadding": [0.01, 0.02, 0.04]}` |
| PSA multiple | `{"PSA": 1.5}` |
| By term | `{"ByTerm": [...]}` |
| Stress by curve | `{"StressByCurve": [curve, baseAssump]}` |

### 10.3 Recovery Assumptions

| Type | Syntax |
|------|--------|
| Rate + lag | `{"Rate": 0.7, "Lag": 18}` |
| Rate + timing | `{"Rate": 0.45, "Timing": [0.3, 0.3, 0.4]}` |

### 10.4 Lease-Specific Assumptions

| Component | Options |
|-----------|---------|
| Default | `('byContinuation', 0.02)`, `('byTermination', 0.05)` |
| Turnover gap | `('days', 30)`, `('byCurve', [["2023-01-01", 15]])` |
| Rental change | `('byAnnualRate', -0.3)`, `('byRateCurve', [[date, rate]])`, `('byRateVec', -0.1, -0.3)` |
| End type | `("byDate", "2026-09-20")`, `("byExtTimes", 1)`, `("earlierOf", date, N)`, `("laterOf", date, N)` |

### 10.5 Assumption Application Methods

| Method | Syntax |
|--------|--------|
| Pool level | `("Pool", (assetType, default, prepay, recovery, extra), None, None)` |
| By index | `("ByIndex", ([0,1], assump1), ([2,3], assump2))` |
| By obligor tag | `("ByObligor", ("ByTag", ["GroupA"], "TagEq", assump), ("ByDefault", assump))` |
| By obligor id | `("ByObligor", ("ById", ["OB001"], assump), ("ByDefault", assump))` |
| By obligor field | `("ByObligor", ("ByField", [("field", "in", ["A"])], assump), ("ByDefault", assump))` |
| By pool name | `("ByName", {"poolA": (assump, None, None)})` |
| By pool id | `("ByPoolId", {"poolA": assump})` |

---

## 11. Run Assumption Patterns

| Assumption | Syntax |
|------------|--------|
| Stop at date | `("stop", "2030-01-01")` |
| Clean-up call | `("call", ("CleanUp", ("poolBalance", 200)))` |
| Conditional call | `("call", ("if", condition))` |
| Interest flat | `("interest", ("SOFR3M", 0.05))` |
| Interest curve | `("interest", ("SOFR3M", [["2021-01-01", 0.05], ["2022-01-01", 0.06]]))` |
| Revolving | `("revolving", ["constant", asset], poolAssumpForNew)` |
| Pricing PV | `("pricing", {"date": "2021-08-22", "curve": [...]})` |
| Pricing Z-spread | `("pricing", {"bonds": {"A1": ("2021-07-26", 100)}, "curve": [...]})` |
| Pricing IRR hold | `("pricing", {"IRR": {"B": ("holding", [(date, -amt)], bal)}})` |
| Pricing IRR buy | `("pricing", {"IRR": {"B": ("buy", date, ("byFactor", 0.99), ("byCash", 200))}})` |
| Inspect | `("inspect", [datePattern, formula], ...)` |
| Report | `("report", {"dates": "MonthEnd"})` |
| Fire trigger | `("fireTrigger", [(date, location, name)])` |
| Refinance | `("refinance", ("byRate", date, account, bond, rateType))` |
| Issue bond | `("issueBond", date, group, account, bondDetail)` |
| Estimate expense | `("estimateExpense", ("tsFee", [[date, amount]]))` |
| Make whole | `("makeWhole", date, precision, [[factor, spread], ...])` |

---

## 12. Root Finder Reference

### 12.1 Tweaks (What to Stress)

| Tweak | Syntax |
|-------|--------|
| Stress defaults | `("stressDefault", min, max)` |
| Stress prepay | `("stressPrepayment", min, max)` |
| Max spread | `("maxSpread", "bondName")` |
| Split balance | `("splitBalance", "bond1", "bond2")` |
| First loss | `("firstLoss", "bondName")` |

### 12.2 Stop Conditions

| Condition | Syntax |
|-----------|--------|
| Bond any loss | `("bondIncurLoss", "B")` |
| Bond principal loss | `("bondIncurPrinLoss", "A1")` |
| Bond interest loss | `("bondIncurIntLoss", "A1")` |
| Bond principal loss > threshold | `("bondIncurPrinLoss", "A1", 0.01)` |
| Bond interest loss > threshold | `("bondIncurIntLoss", "A1", 0.005)` |
| Bond prices at par | `("bondPricingEqOrigin", "A1")` |
| Bond meets IRR | `("bondMetTargetIrr", "A1", 0.05)` |

---

## 13. Trigger Reference

### 13.1 Trigger Points

| Point | Fires when |
|-------|-----------|
| `BeforeCollect` | Before pool cash collection |
| `AfterCollect` | After pool cash collection |
| `BeforeDistribution` | Before waterfall execution |
| `AfterDistribution` | After waterfall execution |
| `InDistribution` | During waterfall (between actions) |
| `EndOfPoolCollection` | End of pool collection cycle |

### 13.2 Trigger Effects

| Effect | Syntax |
|--------|--------|
| Change status | `("newStatus", "Accelerated")` |
| Accrue fees | `["accrueFees", "fee1"]` |
| New reserve balance | `["newReserveBalance", "acc1", {"fixReserve": 1000}]` |
| Add new trigger | `[("newTrigger", {...})]` |
| Multiple effects | `["Effects", effect1, effect2]` |
| Execute actions | `("actions", action1, action2)` |
| Swap waterfall | `["swapWaterfall", "accelerated"]` |

---

## 14. Account Reserve Types

| Reserve Type | Syntax |
|--------------|--------|
| Fixed amount | `{"fixReserve": 1000}` or `("fix", 1000)` |
| Formula target | `{"targetReserve": [formula, pct]}` or `("target", formula, pct)` |
| Max of targets | `{"max": [reserve1, reserve2]}` |
| Conditional | `{"when": [condition, ifTrue, ifFalse]}` |
| Nested formula | `("target", ("max", ("*", ("poolBalance",), 0.01), ("const", 1000)))` |

---

## 15. API Methods Reference

| Method | Purpose | Returns |
|--------|---------|---------|
| `api.run(deal, poolAssump, runAssump, read)` | Run single deal | Result dict |
| `api.runByScenarios(deal, poolAssump, runAssump)` | Multi pool scenarios | Dict of results |
| `api.runByDealScenarios(deal, runAssump)` | Multi deal scenarios | Dict of results |
| `api.runStructs(deals, poolAssump, runAssump)` | Multiple structures | Dict of results |
| `api.runByCombo(deals, poolAssump, runAssump)` | Combinatorial | Nested dict |
| `api.runPool(pool, poolAssump)` | Pool only | (cashflow, stats) |
| `api.runAsset(date, assets, poolAssump)` | Single asset | (cashflow, stats, pricing) |
| `api.runRootFinder(deal, poolAssump, runAssump, (tweak, stop))` | Find breakeven | (factor, result) |

### Helper Functions

| Function | Purpose |
|----------|---------|
| `readBondsCf(r['bonds'])` | Combine bond cashflows |
| `readFeesCf(r['fees'])` | Combine fee cashflows |
| `readAccsCf(r['accounts'])` | Combine account cashflows |
| `readInspect(r['result'])` | Joint inspection reader |
| `unifyTs(r['result']['inspect'].values())` | Unify time series |
| `toHtml(r, "file.html")` | Export HTML report |
| `toExcel(r, "file.xlsx")` | Export Excel report |
| `compResult(r1, r2, names=(...))` | Compare two results |
| `readAeson(raw)` | Parse raw response |
| `mkDealsBy(deal, plan)` | Build deal variants |
| `prodDealsBy(deal, ...)` | Cartesian product deals |
| `prodAssumpsBy(base, ...)` | Cartesian product assumptions |
| `runYieldTable(api, deal, bond, assumps, pricing)` | Yield table |
| `viz(deal)` | Graphviz visualization |
| `irr(bondCf, init=(date, amount))` | IRR calculation |

---

## 16. Result Structure Reference

```python
r = api.run(deal, poolAssump=..., runAssump=..., read=True)

# Cashflow DataFrames
r['pool']['flow']              # Pool cashflow
r['pool_outstanding']['flow']  # Uncollected pool (v0.50+)
r['bonds']['A1']               # Bond cashflow
r['accounts']['acc01']         # Account transactions
r['fees']['trusteeFee']        # Fee cashflow

# Non-Cashflow
r['result']['status']          # Deal status transitions
r['result']['waterfall']       # Waterfall execution log
r['result']['inspect']         # Inspected variable values
r['result']['logs']            # Error/Warning messages
r['result']['report']          # Financial reports (if requested)
r['result']['report']['cash']  # Cash inflow/outflow report
r['result']['report']['balanceSheet']  # Balance sheet snapshots

# Pricing (if pricing assumption provided)
r['pricing']                   # WAL, duration, yield per bond

# Ledgers
r['ledgers']                   # Ledger balances and transactions
```
