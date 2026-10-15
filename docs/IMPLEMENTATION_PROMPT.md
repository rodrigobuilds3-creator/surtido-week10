# Implementation handoff

Implement docs/PACKET.md after its first Git commit. Build the real interaction, not a screenshot or landing page.

1. Pure domain module with four example perishable SKUs, cash-reserve plan, pack/expiry/capacity bounds, data readiness, owner edits, reviewed snapshot and illustrative financial model. Prove edge cases using Node tests.
2. Premium responsive Spanish app matching the generated reference's hierarchy and DESIGN_SYSTEM.md; cash controls, product review, quantities, source details and order summary must work. Session-only data and explicit practice labels.
3. Device-local OCR of the supplied receipt, editable SKU/unit-cost confirmation and no silent physical-stock updates. Add bounded local LLM explanation in a worker, download progress, error/retry and honest rules fallback. Output is plain text and never changes the plan.
4. Review and copy: present exact current totals, require acknowledgement, download a JSON order or print a clean plan; never transmit it. Changing the plan invalidates confirmation and stale LLM results.
5. Run domain + browser tests, record actual defects, fix and publish twice. Use at least five meaningful commits. Never manufacture an interview, persona conversation, historical transcript, measured savings or successful deployment.

Use the existing private Site ID in .openai/hosting.json. Keep source credentials in tool memory/stdin only. No databases, user secrets, remote financial data or personal seeds.
