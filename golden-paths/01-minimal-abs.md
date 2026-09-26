# 01 — Minimal ABS

Goal: build the smallest complete mortgage securitization, run it, and read the
results. Verified against `DEV` on absbox 0.52.3 / Hastructure 0.52.4.

```python
from absbox import API, EnginePath, mkDeal

deal = mkDeal({
    "name": "SimpleDeal",
    "dates": {
        "cutoff": "2021-03-01",
        "closing": "2021-06-15",
        "firstPay": "2021-07-26",
        "payFreq": ["DayOfMonth", 20],
        "poolFreq": "MonthEnd",
        "stated": "2030-01-01",
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
               "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}},
    },
    "waterfall": {"Amortizing": [
        ["accrueAndPayInt", "acc01", ["A"]],
        ["payPrin", "acc01", ["A"]],
        ["payPrinResidual", "acc01", ["EQ"]],
    ]},
    "collect": [
        ["CollectedInterest", "acc01"],
        ["CollectedPrincipal", "acc01"],
        ["CollectedPrepayment", "acc01"],
        ["CollectedRecoveries", "acc01"],
    ],
    "status": ("PreClosing", "Amortizing"),
})

api = API(EnginePath.DEV, lang='english')

pool_assump = ("Pool",
    ("Mortgage", {"CDR": 0.01}, {"CPR": 0.05}, {"Rate": 0.7, "Lag": 18}, None),
    None, None)

r = api.run(deal, poolAssump=pool_assump, read=True)

print(r['result']['logs'])              # always inspect warnings first
print(r['bonds']['A'][['balance', 'interest', 'principal']].tail())
print(r['pool']['flow']['PoolConsol'][['Balance', 'Principal']].tail())
```

## Expected output

- `r['result']['status']` shows `Amortizing` then a final end state.
- Bond `A` balance amortizes toward zero; `EQ` receives residuals last.
- `r['result']['logs']` may warn `Bond ... is not paid off` or
  `Account ... has cash to be distributed` — informational, not fatal.

## Gotchas

- `stated` must extend beyond the assets' remaining term. A short stated date
  makes the engine end the deal at closing with **no cashflow**.
- Add every pool source you care about to `"collect"`; unmapped sources drop
  silently.
- Use `("poolBalance",)` (trailing comma) — a bare string is not a formula.
