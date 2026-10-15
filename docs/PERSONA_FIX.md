# Independent synthetic-persona finding / v1 to v2

Source: a fresh, isolated persona session. Elena is a hypothetical 54-year-old shop owner, not a human participant. The tester was restricted to the visible app and did not receive implementation details.

Task: cash 900; reserve 240; review quantities; read the yogurt practice receipt; decide whether to prepare a local copy. The first live version produced order 630 and remaining cash 270. OCR proposed unit cost 12; stock stayed 8.

Observed obstacle: on mobile, the product card hid unit cost and did not say whether its quantity was pieces or packages. The label Paquete de 6 caused doubt until the review dialog labeled the column Piezas. This affects whether the owner understands a suggested purchase before reviewing it.

Correction: show cost per piece and pieces per package within each mobile card; label quantities Piezas a reponer on all viewports and display the package count beneath them. All numbers come from the existing plan; no allocation or money rules changed.

Retest: pending actual second deployment. The tester will repeat cash 900/reserve 240 and explain the yogurt quantity and cost from the product card before opening review.
