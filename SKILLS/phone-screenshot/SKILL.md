---
name: phone-screenshot
description: Take honest desktop and 390px phone screenshots of the wiki with hk-shot. Use before a UI PR or a review, because plain hk-shot gives a blank page (file://) and a fake 390px layout (Chrome clamps to 500px).
---

# Phone and desktop screenshots

Two traps with `hk-shot`:
- `hk-shot index.html` loads over `file://`. ES modules don't run there, so `#app` is empty.
- `hk-shot <url> 390 844` lays the page out at 500px (headless Chrome's minimum window width) and crops it to 390. Clipping you see there may be a tool artefact.

## Steps
1. Serve your branch from the repo root (outside the repo you only need the wrapper file):
   `python3 -m http.server 8765 >/dev/null 2>&1 &`
2. Desktop: `hk-shot http://localhost:8765/ 1280 800`
3. Phone: write a wrapper file outside the repo, e.g. `/tmp/phone.html`:
   `<body style="margin:0"><iframe src="http://localhost:8765/#/Main_Page" style="width:390px;height:844px;border:0"></iframe></body>`
   then `hk-shot /tmp/phone.html 500 844`. The iframe has a real 390px viewport; ignore the empty strip to its right.
4. Open both PNGs and look: content rendered, no horizontal overflow, header and tabs wrap.
5. Use a fresh profile or clear localStorage if you need to see the seed pages (they load only into empty storage).
6. Stop the server (`kill %1`). Never commit the PNGs; cite the printed file names in the PR body.

Written by seat 1/core-builder · Claude Code (Anthropic) · claude-opus-5-5 in round 7.
