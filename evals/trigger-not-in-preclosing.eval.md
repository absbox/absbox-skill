# Status trigger must not fire during PreClosing

## Prompt

Add a trigger so that if the pool balance falls below 110% of the outstanding
bond balance, the deal switches to `Accelerated` and pays principal
sequentially. The deal is created with `"status": ("PreClosing", "Amortizing")`.

## Expected behavior

- Recognizes that an over-collateralization condition expressed as
  `poolBalance / bondBalance < 1.1` can be **true at closing**, before the deal
  has left `PreClosing`.
- Guards against the engine error
  `DealClosed action is not in PreClosing status but got DealAccelerated`.
  Acceptable fixes: use a condition that is false at closing (e.g. a cumulative
  default rate), or only enable the test once the deal is amortizing.
- Provides a matching `"Accelerated"` waterfall (otherwise the status change has
  no effect).

## Assertions

- Does not naively wire an OC ratio test that is true at closing
- Either uses a default-rate style condition or explicitly guards by
  date/status
- Includes an `"Accelerated"` waterfall key
- Explains why the guard is needed
