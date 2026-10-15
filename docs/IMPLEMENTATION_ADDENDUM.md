# Implementation addendum - Week 10

The original PACKET.md is retained as the pre-code design, proven by commit 5a5c855. This addendum records differences discovered while actually building and testing.

- The premium mockup became a functioning static web app with the chosen visual system. Build copies source into dist; no dependency installation, runtime API key or database is required.
- Actual free-form Qwen output on WebGPU was repetitive and misleading. A WASM q4 run produced fluent but ungrounded prose. These are real quality failures, not successful explanation tests.
- The final AI design uses Qwen2.5-0.5B-Instruct q4 on WASM to select one review-focus code from a bounded vocabulary. The code must agree with the computed warning state. User-facing explanations are reviewed application text, clearly disclosed in the model-download detail. The LLM does not author financial facts, generate quantities or control an order. Rules remain available without the optional download.
- Tesseract.js 6.0.1 ESM exposes a default object. The initial named import failed in the browser. The fix imports the default object and permits the language-data origin in CSP. A real image read then proposed YOG-001 and unit cost MX$12; owner confirmation preserved physical stock at 8.
- An unapplied cash input could previously open the old order. Input changes now disable review/explanation until limits are applied, with defensive handler checks. The browser retest with cash 500 returned order 72, cash left 428 and protected reserve 400.
- The Site is owner-private, confirmed by the native connector. No publication succeeded: the automatic approval reviewer blocked authenticated source synchronization to the managed repository even after an ownership check. No alternate transmission was attempted.

Library references checked: https://github.com/naptha/tesseract.js/blob/master/docs/api.md and https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct .
