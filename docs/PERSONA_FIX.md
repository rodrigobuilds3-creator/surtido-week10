# Independent synthetic-persona finding / v1 to v2

Source: a fresh, isolated persona session. Elena is a hypothetical 54-year-old shop owner, not a human participant. The tester was restricted to the visible app and did not receive implementation details.

Task: cash 900; reserve 240; review quantities; read the yogurt practice receipt; decide whether to prepare a local copy. The first live version produced order 630 and remaining cash 270. OCR proposed unit cost 12; stock stayed 8.

Observed obstacle: on mobile, the product card hid unit cost and did not say whether its quantity was pieces or packages. The label Paquete de 6 caused doubt until the review dialog labeled the column Piezas. This affects whether the owner understands a suggested purchase before reviewing it.

Correction: show cost per piece and pieces per package within each mobile card; label quantities Piezas a reponer on all viewports and display the package count beneath them. All numbers come from the existing plan; no allocation or money rules changed.

Retest after successful second deployment: a fresh isolated tester using the same Elena definition identified 24 yogurt pieces, 4 packages of 6 and unit cost 12 directly from the mobile card before opening review. Review showed yogurt subtotal 288, total 630, remaining cash 270 and reserve 240. The first tester could not resume its browser surface; that failed attempt is retained in the transcript. The successful retest was a new session, not a claim that the original participant returned. The AX had exposed summary totals, so the totals comparison was not blind. These are synthetic observations, not evidence of real-user adoption.

Sixteen actual screenshot outputs were recovered unchanged from the two tester session logs and included in the Persona PDF. A local manifest records source timestamps and SHA-256 hashes.
