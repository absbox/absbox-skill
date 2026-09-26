# Read the golden path before building

## Prompt

Build a mortgage deal that reinvests collections into new assets for a while,
then amortizes — i.e. a revolving structure.

## Expected behavior

- Recognizes this as a multi-step modeling task and opens
  `golden-paths/06-revolving.md` (or the index) **before** composing code from
  memory.
- Uses the verified shape: a revolving pool tuple
  `(["constant", asset], ("Pool", (assetType, default, prepay, recovery, extra), None, None))`
  passed as `runAssump=[("revolving", *revolving_pool)]`.
- Uses `buyAsset` (single pool) or `buyAsset2` (named source/target pools)
  inside an `If` date condition to trigger the purchase.
- Follows the path's gotchas (collect mappings for every pool, buy action only
  fires when its condition is true).

## Assertions

- Opens a golden path before writing the deal
- Uses `("revolving", ...)` in `runAssump`
- Uses `buyAsset`/`buyAsset2` in the waterfall
- Does not hand-roll a reinvestment mechanism that ignores the revolving API
