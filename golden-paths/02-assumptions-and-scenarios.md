# 02 — Assumptions & scenario sensitivity

Goal: drive a deal with pool performance assumptions and compare scenarios.
Verified against `DEV` on absbox 0.52.3 / Hastructure 0.52.4.

## Pool assumption structure

`("Pool", (assetType, default, prepay, recovery, extra), delinquency, extra)`.

```python
pa_base = ("Pool",
    ("Mortgage", {"CDR": 0.01}, {"CPR": 0.05}, {"Rate": 0.7, "Lag": 18}, None),
    None, None)

pa_stress = ("Pool",
    ("Mortgage", {"CDR": 0.08}, {"CPR": 0.05}, {"Rate": 0.4, "Lag": 24}, None),
    None, None)
```

Scope a different assumption to a slice of the pool:

```python
# by asset index
pa = ("ByIndex",
      ([0, 1], ("Mortgage", {"CDR": 0.02}, {"CPR": 0.01}, {"Rate": 0.5, "Lag": 12}, None)),
      ([2, 3], ("Mortgage", {"CDR": 0.05}, None, {"Rate": 0.3, "Lag": 24}, None)))

# by obligor tag / id / field
pa = ("ByObligor",
      ("ByTag", ["GroupA"], "TagEq", assump1),
      ("ById", ["OB001"], assump2),
      ("ByDefault", assump3))
```

## Running scenarios

```python
from absbox import API, EnginePath, mkDeal

deal = mkDeal({
    "name": "SCEN",
    "dates": {"cutoff": "2021-03-01", "closing": "2021-06-15",
              "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
              "poolFreq": "MonthEnd", "stated": "2030-01-01"},
    "pool": {"assets": [
        ["Mortgage",
         {"originBalance": 12000, "originRate": ["fix", 0.045], "originTerm": 120,
          "freq": "Monthly", "type": "Level", "originDate": "2021-02-01"},
         {"currentBalance": 10000, "currentRate": 0.075,
          "remainTerm": 80, "status": "Current"}]]},
    "accounts": {"acc01": {"balance": 0}},
    "bonds": {
        "A": {"balance": 8000, "rate": 0.05, "originBalance": 8000,
              "originRate": 0.05, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.05}, "bondType": {"Sequential": None}},
        "B": {"balance": 2000, "rate": 0.0, "originBalance": 2000,
              "originRate": 0.0, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "waterfall": {"Amortizing": [
        ["accrueAndPayInt", "acc01", ["A"]],
        ["payPrin", "acc01", ["A"]],
        ["payPrinResidual", "acc01", ["B"]]]},
    "collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"],
                ["CollectedPrepayment", "acc01"], ["CollectedRecoveries", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

api = API(EnginePath.DEV, lang='english')
rs = api.runByScenarios(deal, poolAssump={"base": pa_base, "stress": pa_stress},
                        read=True)

final_a = {k: float(v['bonds']['A']['balance'].iloc[-1]) for k, v in rs.items()}
cum_default = {k: float(v['pool']['flow']['PoolConsol']['CumDefault'].iloc[-1])
               for k, v in rs.items()}
print("final A balance:", final_a)
print("cumulative default:", cum_default)
```

Verified output:

```
final A balance: {'base': 2462.26, 'stress': 3225.52}
cumulative default: {'base': 211.32, 'stress': 1592.15}
```

## Gotchas

- Scenario results are a dict keyed by scenario name; each value has the full
  single-run structure.
- If every scenario returns identical numbers, the varied assumption is not
  reaching the model — check the tuple position (default/prepay/recovery) and
  the asset-type match.
- `"CDR"` in the default slot is a rate; in the recovery slot you pass
  `{"Rate": ..., "Lag": ...}`.
