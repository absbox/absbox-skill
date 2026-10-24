# absbox Skill

A skill for modeling and projecting structured finance deals (ABS, MBS, CLO,
SRT) with the [absbox](https://absbox-doc.readthedocs.io/en/latest/) Python
library and the Hastructure engine.

## Install (npm / npx)

The skill ships as the [`absbox-skill`](https://www.npmjs.com/package/absbox-skill)
npm package. The CLI copies the skill files into the skill directory of whichever
agent you use (opencode, Claude Code, or the shared `~/.agents` convention).

```bash
npx absbox-skill                 # global install into every detected agent
npx absbox-skill --target claude # Claude Code only
npx absbox-skill --local         # into this project's ./.opencode, ./.claude, ./.agents
npx absbox-skill --list          # show destinations and which are detected
npx absbox-skill --uninstall     # remove from global installs
```

Or install it globally so it also registers on install:

```bash
npm install -g absbox-skill
```

### Install straight from GitHub

No npm publish needed — `npm`/`npx` can build and run the package directly from
the repository (it has no build step and no dependencies):

```bash
npx github:absbox/absbox-skill                 # run the installer from main
npx github:absbox/absbox-skill --target claude # Claude Code only
npx github:absbox/absbox-skill#v4.0.0          # pin a tag / branch / commit
npx https://github.com/absbox/absbox-skill     # full-URL form
npm install -g github:absbox/absbox-skill      # global install + auto-register
```

Flags: `-g/--global`, `-l/--local`, `-t/--target <opencode,claude,agents>`,
`--dir <path>`, `-f/--force` (overwrite), `--uninstall`, `--list`, `--auto`,
`-q/--quiet`.

Destination layout (skill folder is named `absbox`, from `SKILL.md`):

| Agent | Global | Project |
|-------|--------|---------|
| opencode | `~/.config/opencode/skills/absbox/` | `./.opencode/skills/absbox/` |
| Claude Code | `~/.claude/skills/absbox/` | `./.claude/skills/absbox/` |
| shared agents | `~/.agents/skills/absbox/` | `./.agents/skills/absbox/` |

Restart the agent after installing so it picks up the skill.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Router + quick start (load this) |
| `REFERENCE.md` | Exhaustive lookup tables: formulas, actions, constants, API |
| `golden-paths/` | Verified end-to-end recipes |
| `evals/` | Behavior tests for the skill |
| `doc/CHANGELOG.md` | Release history |

## Python dependencies

```bash
pip install absbox          # Python 3.10+
docker pull yellowbean/hastructure   # optional local engine
```

```python
from absbox import API, EnginePath

api = API(EnginePath.PROD)                              # version check on
api = API(EnginePath.DEV, lang='english', check=False)  # skip version check
```

The connect check compares only the **minor (tenth) version segment** — the
major and patch segments are ignored. `check=True` (the default) enforces
this.

## Minimal deal

```python
from absbox import API, EnginePath, mkDeal

deal = mkDeal({
    "name": "SIMPLE_ABS",
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
        "EQ": {"balance": 2000, "rate": 0.0, "originBalance": 2000,
               "originRate": 0.0, "startDate": "2021-06-15",
               "rateType": {"Fixed": 0.0}, "bondType": {"Equity": None}}},
    "waterfall": {"Amortizing": [
        ["accrueAndPayInt", "acc01", ["A"]],
        ["payPrin", "acc01", ["A"]],
        ["payPrinResidual", "acc01", ["EQ"]]]},
    "collect": [["CollectedInterest", "acc01"], ["CollectedPrincipal", "acc01"],
                ["CollectedPrepayment", "acc01"]],
    "status": ("PreClosing", "Amortizing"),
})

api = API(EnginePath.DEV, lang='english')
r = api.run(deal,
            poolAssump=("Pool",
                ("Mortgage", {"CDR": 0.02}, {"CPR": 0.05}, {"Rate": 0.6, "Lag": 12}, None),
                None, None),
            read=True)

print(r['result']['logs'])     # check warnings first
print(r['bonds']['A'])
print(r['pool']['flow'])
```

## Next steps

- New to absbox: read `golden-paths/01-minimal-abs.md`, then run it.
- Building a specific structure: match it in `golden-paths/README.md`.
- Need exact syntax: look it up in `REFERENCE.md`.
- Extending the skill: add a golden path and an eval.

## Key resources

- Docs: https://absbox-doc.readthedocs.io/en/latest/
- API: https://absbox-doc.readthedocs.io/en/latest/api.html
- Notebooks: https://absbox-doc.readthedocs.io/en/latest/nbsample/index.html
- Engine: https://github.com/yellowbean/Hastructure
