# Mechanical test log - 14 October 2026

## Domain pass

11 Node tests passed: initial plan, reserve boundary, invalid money/quantities, affordable-pack allocation, unknown/stale data, overrides, short lot life, review acknowledgement, unit-cost extraction, financial reconciliation and bounded model text. The initial four-SKU fixture buys MX$2,316 and leaves MX$484 against a MX$400 reserve.

## Browser findings

Tested actual app at http://127.0.0.1:4180 using the Codex browser controls, not a mocked DOM.

1. Initial workflow rendered all four SKUs, source states, quantity controls and the exact domain totals.
2. Cash changed to MX$900 and reserve to MX$240, then applied: the proposed order became MX$630, leaving MX$270; whole supplier packs and reserve were preserved.
3. ACTUAL BUG: in a separate fresh session, typed cash MX$500 without applying it. The Review button remained enabled and opened the original MX$2,316 order with the previous cash state. This could make a user mistake an old plan for an updated one.
4. FIX: detect unapplied cash/reserve edits, show a pending-limits message, disable review/explanation until apply, and repeat the check in the review/explanation handlers. Retest after reload is pending at this point.
5. Actual local-model download was initiated through the visible app. The UI reported progress at 23%; no inference success is claimed yet.
6. Actual OCR of the practice receipt was initiated through its button; result verification is pending at this point. Mocked OCR does not count as a successful reading.

No real user pilot, independently observed savings or completed persona conversation is claimed here.
