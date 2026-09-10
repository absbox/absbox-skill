# absbox Skill — Quick Start

## What is absbox?

absbox is a Python library for modeling and projecting cashflows of structured finance deals (ABS, MBS, CLO, SRT). It wraps the Hastructure computation engine and uses native Python data structures (dicts, lists, tuples) for deal construction.

## Quick Setup

```python
pip install absbox           # Python 3.10+ required
```

```python
from absbox import API, EnginePath

# Connect to engine (pick one)
api = API(EnginePath.PROD, check=False)          # public production
api = API(EnginePath.DEV, check=False)           # public dev
api = API(EnginePath.LOCAL, check=False)         # localhost:8081
api = API("https://absbox.org/api/latest")       # explicit URL
```

## Minimal Deal Example

```python
from absbox import mkDeal

deal = mkDeal({
    "name": "SIMPLE_ABS",
    "dates": {
        "cutoff": "2024-01-01",
        "closing": "2024-02-15",
        "firstPay": "2024-03-20",
        "payFreq": ["DayOfMonth", 20],
        "poolFreq": "MonthEnd",
        "stated": "2034-01-01"
    },
    "pool": {
        "assets": [
            ["Mortgage",
             {"originBalance": 100000, "originRate": ["fix", 0.05],
              "originTerm": 120, "freq": "Monthly", "type": "Level",
              "originDate": "2023-01-01"},
             {"currentBalance": 95000, "currentRate": 0.05,
              "remainTerm": 108, "status": "Current"}]
        ]
    },
    "accounts": {
        "waterfall_acc": {"balance": 0}
    },
    "bonds": {
        "A": {"balance": 80000, "rate": 0.04, "originBalance": 80000,
              "originRate": 0.04, "startDate": "2024-02-15",
              "rateType": {"Fixed": 0.04}, "bondType": {"Sequential": None}},
        "B": {"balance": 15000, "rate": 0.0, "originBalance": 15000,
              "originRate": 0.0, "startDate": "2024-02-15",
              "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}
    },
    "waterfall": {
        "amortizing": [
            ["accrueAndPayInt", "waterfall_acc", ["A"]],
            ["payPrin", "waterfall_acc", ["A"]],
            ["payPrinResidual", "waterfall_acc", ["B"]]
        ]
    },
    "collect": [
        ["CollectedInterest", "waterfall_acc"],
        ["CollectedPrincipal", "waterfall_acc"],
        ["CollectedPrepayment", "waterfall_acc"],
        ["CollectedRecoveries", "waterfall_acc"]
    ],
    "status": ("PreClosing", "Amortizing")
})

# Run with assumptions
r = api.run(deal,
    poolAssump=("Pool",
        ("Mortgage", {"CDR": 0.02}, {"CPR": 0.05}, {"Rate": 0.6, "Lag": 12}, None),
        None, None),
    runAssump=[("pricing", {"date": "2024-02-15",
                            "curve": [["2024-01-01", 0.04]]})],
    read=True)

# View results
print(r['bonds']['A'])          # Bond A cashflow
print(r['pool']['flow'])        # Pool cashflow
print(r['result']['logs'])      # Any warnings
```

## File Structure

| File | Purpose |
|------|---------|
| `SKILL.md` | Complete skill document with all sections (primary reference) |
| `REFERENCE.md` | Exhaustive lookup tables for formulas, conditions, constants |
| `README.md` | This quick start guide |

## Key Resources

- Documentation: https://absbox-doc.readthedocs.io/en/latest/
- API Reference: https://absbox-doc.readthedocs.io/en/latest/api.html
- Notebook Gallery: https://absbox-doc.readthedocs.io/en/latest/nbsample/index.html
- GitHub: https://github.com/yellowbean/Hastructure
