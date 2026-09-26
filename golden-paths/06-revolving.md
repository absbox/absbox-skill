# 06 — Revolving pool

Goal: a deal that reinvests collections by buying new assets from a revolving
pool. Adapted from the official example. Verified against `DEV` on absbox 0.52.3
/ Hastructure 0.52.4.

```python
from absbox import API, EnginePath, mkDeal

api = API(EnginePath.DEV, lang='english')

# New assets the deal may buy, plus their performance assumption.
revolving_pool = (
    ["constant", ["Mortgage",
        {"originBalance": 220, "originRate": ["fix", 0.045], "originTerm": 30,
         "freq": "Monthly", "type": "Level", "originDate": "2021-07-01"},
        {"currentBalance": 220, "currentRate": 0.08,
         "remainTerm": 12, "status": "current"}]],
    ("Pool", ("Mortgage", {"CDR": 0.1}, None, None, None), None, None))

deal = mkDeal({
    "name": "REVOL",
    "dates": {"cutoff": "2021-03-01", "closing": "2021-06-15",
              "firstPay": "2021-07-26", "payFreq": ["DayOfMonth", 20],
              "poolFreq": "MonthEnd", "stated": "2030-01-01"},
    "pool": {"assets": [
        ["Mortgage",
         {"originBalance": 2200, "originRate": ["fix", 0.045], "originTerm": 30,
          "freq": "Monthly", "type": "Level", "originDate": "2021-02-01"},
         {"currentBalance": 2200, "currentRate": 0.08,
          "remainTerm": 24, "status": "current"}]]},
    "accounts": {"acc01": {"balance": 0}},
    "bonds": {
        "A1": {"balance": 1000, "rate": 0.07, "originBalance": 1000,
               "originRate": 0.07, "startDate": "2021-06-15",
               "rateType": {"Fixed": 0.08}, "bondType": {"Sequential": None}},
        "B": {"balance": 1000, "rate": 0.0, "originBalance": 1000,
              "originRate": 0.0, "startDate": "2021-06-15",
              "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "fees": {"trusteeFee": {"type": {"fixFee": 30}, "feeStart": "2021-06-15"}},
    "waterfall": {"Amortizing": [
        ["payFee", "acc01", ["trusteeFee"]],
        ["payInt", "acc01", ["A1"]],
        # on one fixed pay date, reinvest by buying from the revolving pool
        ["If", ["=", "2022-08-20"],
             ["buyAsset", ["Current|Defaulted", 1.0, 0], "acc01"]],
        ["payPrin", "acc01", ["A1"]],
        ["payPrinResidual", "acc01", ["B"]]]},
    "collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"],
                ["CollectedPrepayment", "acc01"], ["CollectedRecoveries", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

r = api.run(deal, runAssump=[("revolving", *revolving_pool)], read=True)

# Pool balance jumps when the buy happens in Aug 2022.
print(r['pool']['flow']['PoolConsol'][['Balance']].loc["2022-07-31":"2022-11-30"])
```

Verified pool balance after the buy:

```
Date        Balance
2022-07-31  1235.10
2022-08-31  1243.33
2022-09-30  1142.65
2022-10-31  1041.47
2022-11-30   939.76
```

## Multi-pool buys

For deals with several pools, buy from a named revolving pool into a target pool:

```python
["buyAsset2", ["Current|Defaulted", 1.0, 0], "acc01", None, "revPool", "PoolA"]
```

And pass a map of revolving pools:

```python
runAssump=[("revolving", {"Pool1": revolving_pool_1, "Pool3": revolving_pool_3})]
```

## Gotchas

- The buy action only fires when its `If` condition is true (here a specific
  date). Use `["=", "YYYY-MM-DD"]` for a one-off reinvestment.
- `buyAsset` is the single-pool form; `buyAsset2` is the source/target-pool
  form.
- Each concurrent pool must map to a source in `"collect"`, or its cash is lost.
