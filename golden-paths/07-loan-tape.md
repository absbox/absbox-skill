# 07 — Map a real loan tape

Goal: turn a pandas loan tape into absbox assets and project the pool. Verified
against `DEV` on absbox 0.52.3 / Hastructure 0.52.4.

```python
import pandas as pd
from absbox import API, EnginePath

# A minimal tape. Real tapes (e.g. Freddie Mac pipe-delimited) map the same way.
tape = pd.DataFrame({
    "loan_id":   ["L1", "L2", "L3"],
    "orig_bal":  [120000.0, 85000.0, 300000.0],
    "orig_rate": [0.045, 0.052, 0.038],
    "orig_term": [360, 240, 300],
    "orig_date": ["2021-01-15", "2020-06-01", "2022-03-01"],
    "cur_bal":   [115000.0, 79000.0, 295000.0],
    "cur_rate":  [0.045, 0.052, 0.038],
    "rem_term":  [348, 228, 292],
    "status":    ["Current", "Current", "Current"],
})

# absbox statuses are capitalised: Current / Defaulted / Prepaid.
STATUS = {"current": "Current", "defaulted": "Defaulted", "prepaid": "Prepaid"}

assets = [
    ["Mortgage",
     {"originBalance": float(row.orig_bal),
      "originRate": ["fix", float(row.orig_rate)],      # or ["floater", ...]
      "originTerm": int(row.orig_term),
      "freq": "Monthly",
      "type": "Level",                                  # derive from the tape
      "originDate": str(row.orig_date)},
     {"currentBalance": float(row.cur_bal),
      "currentRate": float(row.cur_rate),
      "remainTerm": int(row.rem_term),
      "status": STATUS[str(row.status).lower()]}]
    for row in tape.itertuples()
]

api = API(EnginePath.DEV, lang='english')

pool = {"cutoffDate": "2022-04-01", "assets": assets}   # cutoffDate is required
assump = ("Pool",
    ("Mortgage", {"CDR": 0.01}, {"CPR": 0.05}, {"Rate": 0.7, "Lag": 12}, None),
    None, None)

r = api.runPool(pool, assump)          # returns {"PoolConsol": {"flow": DataFrame, ...}}
flow = r["PoolConsol"]["flow"]
print(flow[["Balance", "Principal", "Interest"]].head())
```

## Mapping rules

- Convert every date column to ISO `YYYY-MM-DD` strings.
- Map status to `Current` / `Defaulted` / `Prepaid` (capitalised).
- Decide amortization `type` from the product: `"Level"`, `"Even"`, `"I_P"`,
  or `("Balloon", N)`.
- Fixed vs floating: use `["fix", rate]` or
  `["floater", rate, {"index": ..., "spread": ..., "reset": ...}]`.
- Pass `currentBalance`, `currentRate`, `remainTerm` in the current dict; pass
  the origin terms in the origin dict. Column names must match these keys.

## Gotchas

- `runPool` needs `"cutoffDate"` in the pool dict; without it you get a
  `SchemaError` on a null date.
- `runPool` returns a **dict keyed by pool name**, each value a dict containing
  `flow`; the older `(cashflow, stats)` tuple form is not what current versions
  return.
- Cast numpy scalars to Python `float`/`int` (`float(row.orig_bal)`) — numpy
  dtypes can confuse validation.
- For large tapes, project a subset first: the projection size grows with
  assets × periods and can exceed proxy response limits.
