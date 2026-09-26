# 05 — Root finder / structuring

Goal: solve for a structure that hits a target IRR, using `runRootFinder` to
`splitBalance` between two tranches. Adapted from the official lease example.
Verified against `DEV` on absbox 0.52.3 / Hastructure 0.52.4.

```python
from absbox import API, EnginePath, mkDeal

api = API(EnginePath.DEV, lang='english')

lease = ["Lease",
    {"rental": ("byDay", 2.0, ["DayOfMonth", 5]), "originTerm": 24,
     "originDate": "2021-03-01"},
    {"currentBalance": 1, "status": "Current", "remainTerm": 24}]

deal = mkDeal({
    "name": "lease01",
    "dates": {"cutoff": "2021-03-01", "closing": "2021-06-15",
              "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
              "poolFreq": "MonthEnd", "stated": "2030-01-01"},
    "pool": {"assets": [lease]},
    "accounts": {"acc01": {"balance": 0}},
    "bonds": {
        "A1": {"balance": 10, "rate": 0.07, "originBalance": 10,
               "originRate": 0.07, "startDate": "2021-06-15",
               "rateType": {"Fixed": 0.08}, "bondType": {"Sequential": None}},
        "B": {"balance": 1990, "rate": 0.0, "originBalance": 1990,
              "originRate": 0.0, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "waterfall": {
        "Amortizing": [
            ["accrueAndPayInt", "acc01", ["A1"]],
            ["payPrin", "acc01", ["A1"]],
            ["payPrin", "acc01", ["B"]],
            ["payIntResidual", "acc01", "B"]]},
    "collect": [["CollectedRental", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

pool_perf = ("Pool",
    ("Lease", None, ("days", 25), ("byRateVec", -0.25, -0.22, -0.1), ("byExtTimes", 3)),
    None, None)

pricing = ("pricing", {"IRR": {"B": ("holding", [("2021-06-15", -1000)], 1000)}})

# 1. A single run gives the current IRR of the equity tranche.
r = api.run(deal, poolAssump=pool_perf, runAssump=[pricing], read=True)
print(r['pricing']['summary'])          # B -> 0.153709

# 2. Solve the A1/B split that lifts B to a 25% IRR.
factor, result = api.runRootFinder(
    deal, pool_perf, [pricing],
    (("splitBalance", "A1", "B", 0.01, 0.99),
     ("bondMetTargetIrr", "B", 0.25)))

print("factor:", factor)                 # 0.8477699613302272
print({k: v['bndBalance']
       for k, v in result[0]['RDeal']['bonds'].items()})
# {'A1': 1695.53, 'B': 304.47}
```

Verified output: `factor: 0.8477699613302272`, `{'A1': 1695.53, 'B': 304.47}`.

## Other tweaks / stop conditions

| Tweak | Syntax |
|-------|--------|
| Stress defaults | `("stressDefault", lo, hi)` |
| Stress prepayment | `("stressPrepayment", lo, hi)` |
| Max spread | `("maxSpread", "A")` |
| Split balance | `("splitBalance", "A1", "B")` |

| Stop condition | Syntax |
|----------------|--------|
| Bond incurs loss | `("bondIncurLoss", "B")` |
| Principal loss | `("bondIncurPrinLoss", "A1", 0.001)` |
| Interest loss | `("bondIncurIntLoss", "A1", 0.005)` |
| Prices at par | `("bondPricingEqOriginBal", "A1", True, True)` |
| Target IRR | `("bondMetTargetIrr", "B", 0.25)` |

`api.runFirstLoss(deal, "B", poolAssump)` is shorthand for
`("stressDefault", ...)` + `("bondIncurLoss", "B")`.

## Gotchas

- Choose a tranche that can actually incur loss. On a senior bond the root is
  never bracketed and the engine returns `Not able to bracket the root`.
- The returned result is raw (`result[0]['RDeal']['bonds'][name]['bndBalance']`),
  not the read DataFrame structure.
- Give the search a wide but sensible range, e.g. `("splitBalance", "A1", "B", 0.01, 0.99)`.
