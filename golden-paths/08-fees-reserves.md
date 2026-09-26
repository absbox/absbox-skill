# 08 — Fees, reserves & inspection

Goal: charge a periodic fee, maintain a reserve target, sweep the gap, and
inspect intermediate values. Verified against `DEV` on absbox 0.52.3 /
Hastructure 0.52.4.

```python
from absbox import API, EnginePath, mkDeal

deal = mkDeal({
    "name": "FEE",
    "dates": {"cutoff": "2021-03-01", "closing": "2021-06-15",
              "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
              "poolFreq": "MonthEnd", "stated": "2030-01-01"},
    "pool": {"assets": [
        ["Mortgage",
         {"originBalance": 14000, "originRate": ["fix", 0.05], "originTerm": 120,
          "freq": "Monthly", "type": "Level", "originDate": "2021-02-01"},
         {"currentBalance": 12000, "currentRate": 0.075,
          "remainTerm": 90, "status": "Current"}]]},
    "accounts": {
        "acc01": {"balance": 0},
        "reserve": {"balance": 500,
                    "type": ("target", ("*", ("poolBalance",), 0.05))}},
    "fees": {
        "senFee": {"type": {"pctFee": [("poolBalance",), 0.005]},
                   "feeStart": "2021-06-15"}},
    "bonds": {
        "A1": {"balance": 7000, "rate": 0.05, "originBalance": 7000,
               "originRate": 0.05, "startDate": "2021-06-15",
               "rateType": {"Fixed": 0.05}, "bondType": {"Sequential": None}},
        "B": {"balance": 5000, "rate": 0.0, "originBalance": 5000,
              "originRate": 0.0, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "waterfall": {"Amortizing": [
        ["payFee", "acc01", ["senFee"]],
        ["accrueAndPayInt", "acc01", ["A1"]],
        ["payPrin", "acc01", ["A1"]],
        ["transfer", "acc01", "reserve", {"reserve": "gap"}],   # fill reserve
        ["inspect", "reserve-check",
             ("accountBalance", "reserve"), ("reserveGap", "reserve")],
        ["payPrinResidual", "acc01", ["B"]]]},
    "collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"],
                ["CollectedPrepayment", "acc01"], ["CollectedRecoveries", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

api = API(EnginePath.DEV, lang='english')
r = api.run(deal,
            poolAssump=("Pool",
                ("Mortgage", {"CDR": 0.02}, {"CPR": 0.04}, {"Rate": 0.5, "Lag": 6}, None),
                None, None),
            read=True)

# fees: dict keyed by fee name -> DataFrame(balance, payment, due)
print(r['fees']['senFee'].head(3))

# accounts: dict keyed by account name
print(r['accounts']['reserve'][['balance']].head(3))

# waterfall inspect actions
print(r['result']['waterfallInspect'].head(4))
```

Verified reserve inspection output:

```
         Date        Comment                    DealStats   Value
0  2021-07-26  reserve-check  {'AccBalance': ['reserve']}  500.00
1  2021-07-26  reserve-check  {'ReserveGap': ['reserve']}  100.00
```

## Fee types

| Type | Syntax |
|------|--------|
| Fixed | `{"fixFee": 100}` |
| Recurring | `{"recurFee": [datePattern, amount]}` |
| Percentage | `{"pctFee": [formula, rate]}` |
| Annual percentage | `{"annualPctFee": [formula, rate]}` |
| Count-based | `{"numFee": [datePattern, formula, unitCost]}` |
| Target-balance | `{"targetBalanceFee": [formula_target, formula_current]}` |
| By table | `{"byTable": [datePattern, formula, table]}` |
| By period | `{"byPeriod": amount}` |

## Reserve targets

`("fix", amount)`, `("target", formula)`,
`("when", condition, ifTrue, ifFalse)`.

## Gotchas

- `r['fees']` and `r['accounts']` are **dicts keyed by name**, not single
  DataFrames. Fee frames have columns `balance`, `payment`, `due`.
- A fee only moves cash if a waterfall action pays it (`payFee`,
  `calcAndPayFee`, ...).
- Reserve transfers use `{"reserve": "gap"}` (fill to target) or
  `{"reserve": "excess"}` (sweep above target).
- `readInspect(r['result'])` can raise on duplicate index labels when several
  inspect sources overlap; read `r['result']['waterfallInspect']` directly.
- Ledger booking (`["transfer", src, tgt, limit, "book", "Debit", "ledger"]`
  plus a `"ledgers"` entry) is not stable across engine versions — test it
  against your target engine before relying on it.
