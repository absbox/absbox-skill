# Maintenance routine — AbsBox ↔ Hastructure contract audit

AbsBox is a thin wrapper: it builds a JSON DSL and parses JSON responses whose
shapes are fixed by the Haskell `Hastructure` types. When the engine changes a
type, an AbsBox tag or field silently drifts and the failure only shows up at
run time. Run this audit whenever:

- the engine bumps a **minor** version (client/engine MAJOR.MINOR must match), or
- you touch `absbox/local/component.py`, `generic.py`, `china.py`, `cf.py`,
  `base.py`, or the readers, or
- before cutting a release.

Both repos must be checked out locally, ideally at the same version. Default
locations: `~/repo/AbsBox` and `~/repo/Hastructure`.

## How Hastructure encodes (the contract)

`deriveJSON defaultOptions` → Aeson `TaggedObject "tag" "contents"`:

- **sum type**: `{"tag": "Ctor", "contents": ...}` — `contents` is the field
  value for one field, an array for several, absent for nullary constructors;
- **record constructor**: fields are **flattened beside `"tag"`** (not nested
  under `contents`);
- **single-constructor type** (`tagSingleConstructors = False`): **no tag** —
  encoded as a bare object/array. So AbsBox adding a `tag` to e.g. an
  `OriginalInfo` record is ignored, not fatal;
- **`swagger.json` is lossy** for some sum types (e.g. it lists only 2 of
  `InterestInfo`'s constructors). **Use the `.hs` source as the authority.**

## Step 1 — tag diff (automated)

```bash
python scripts/contract_audit.py \
    --absbox ~/repo/AbsBox --hastructure ~/repo/Hastructure
```

Reports AbsBox tag literals that appear nowhere in the Haskell source. Exit 1
means candidates — confirm each against the source before filing/fixing. A tag
that exists but is used with the wrong arity/order will **not** be caught here;
continue to steps 2–4.

## Step 2 — `contents` arity and order

For each builder-backed type, compare AbsBox's emitted `contents` list against
the Haskell constructor field order. Types worth checking every time:

| AbsBox builder | Haskell type | Source |
|---|---|---|
| `mkAction` | `Action` | `src/Waterfall.hs` |
| `mkDs` | `DealStats` | `src/Types.hs` |
| `mkPre` | `Pre` | `src/Types.hs` |
| `mkBondRate` | `InterestInfo` | `src/Liability.hs` |
| `mkRateType` | `RateType` | `src/InterestRate.hs` |
| `mkBondType` | `BondType` | `src/Liability.hs` |
| `mkDatePattern` | `DatePattern` | `src/Types.hs` |
| `mkFeeType` | `FeeType` | `src/Expense.hs` |
| `mkLiqMethod` | `PricingMethod` | `src/Types.hs` |
| `mkBookType` | `BookType` | `src/Waterfall.hs` |
| `mkSupport` | `ExtraSupport` | `src/Waterfall.hs` |
| `mkLimit` | `Limit` | `src/Types.hs` |
| `mkAsset` | asset `OriginalInfo` records | `src/AssetClass/AssetBase.hs` |
| `mkAssump*` | assumption types | `src/Assumptions.hs` |

Watch for: a scalar where the engine wants `[x]` (or vice-versa), a `BondName`
vs `[BondName]`, a `Maybe X` sent as `[]` instead of `null`, and enum values
that are not the raw constructor name (e.g. Chinese aliases must be mapped
through `bookDirection`).

## Step 3 — record field names

Record fields serialize with their exact Haskell names. Diff AbsBox's dict keys
against the record declaration, e.g. `OriginalInfo` / `MortgageOriginalInfo` /
`LoanOriginalInfo` / `LeaseInfo` / `ReceivableInfo` / `FixedAssetInfo` in
`src/AssetClass/AssetBase.hs`, and `Bond` in `src/Liability.hs`.

## Step 4 — response row orders (decoding side)

AbsBox hardcodes the column order of the engine's transaction rows in
`absbox/local/base.py`. Compare each against the `Txn` constructors in
`src/Types.hs` (and the readers in `absbox/local/generic.py` / `china.py` /
`readers.py`):

| AbsBox header | Haskell `Txn` constructor |
|---|---|
| `english_bondflow_fields` | `BondTxn` |
| `english_acc_flow_fields_d` | `AccTxn` |
| `english_fee_flow_fields_d` | `ExpTxn` |
| `english_liq_flow_fields_d` | `SupportTxn` |
| `english_rs_flow_fields_d` | `IrsTxn` |
| `english_ledger_flow_fields_d` | `EntryTxn` |
| `english_trigger_flow_fields_d` | `TrgTxn` |

Also check that the *shape* matches: `EntryTxn`'s 2nd/3rd fields are
`(BookDirection, Balance)` pairs, so a scalar `balance`/`amount` column is wrong.

## Step 5 — record findings and guard

1. File one consolidated issue (or fix directly) with `file:line` evidence for
   each mismatch.
2. Add offline regression tests in `absbox/tests/test_parsers.py` (builders) and
   reader tests for response shapes — these run in CI without an engine.
3. Correct any stale entries in this skill.

## Known false alarms

- `mkRateType` vs `mkBondRate` `Fix` arg order is **not** a bug: they target
  different Haskell types (`RateType = Fix DayCount IRate` vs
  `InterestInfo = Fix IRate DayCount`).
