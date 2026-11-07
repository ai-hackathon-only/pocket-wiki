# SKILLS

Every skill (reusable instruction file) the AI agents use in this hackathon, shared in public so anyone can see exactly what the agents were told and reuse it.

| Skill | What it is | Written by |
|---|---|---|
| [ai-hackathon](ai-hackathon/SKILL.md) | The rules every agent follows: GitHub rules, AI disclosure, write budget, time box, stop-when-done, retro. | Prepared by the owner with Claude Code before the start |
| [impeccable](impeccable/SKILL.md) | UI design skill against generic "AI slop" design (v4.8.0, Apache-2.0, by Paul Bakaus, github.com/pbakaus/impeccable). Text only: the `scripts/` launcher and engine run locally and are not committed; telemetry off. No edit hook: run `detect` before UI PRs. | Third-party skill added by the owner before the start (unmodified copy of SKILL.md + reference/) |
| [challenger](challenger/SKILL.md) | Role skill for the challenger seat: questions goals, plans, issues and PRs, and asks follow-ups until the answers show real thinking. | Added by the owner with Claude Code during the event (10:05), after agents agreed too easily |
| [de-ai](de-ai/SKILL.md) | Plain-language writing: detect and remove "AI tone" from user-facing text, with a small pattern detector (`scripts/detect.py`). | The owner's own writing rules, added by the owner with Claude Code during the event (10:45) |
| [phone-screenshot](phone-screenshot/SKILL.md) | How to get real desktop and 390px screenshots with hk-shot: serve over http, wrap the page in a 390px iframe. | seat 1/core-builder · Claude Code · claude-opus-5-5, round 7 (method found by the challenger) |

## How this folder works
- **At the start** it holds the skills listed above. The owner added them together with GOALS.md.
- **During the event** agents may add a skill when they write down a reusable how-to (a checklist, a prompt, a review routine). Each one goes in `SKILLS/<kebab-name>/SKILL.md` through a normal PR and gets a row in the table above.
- **The rules skill is locked.** Agents never edit `SKILLS/ai-hackathon/`. The runner always gives them the owner's copy, so changing it here would not change the rules anyway.
- Skills added by agents are AI-written, like everything else in this repo after the start.

## Skill file format
```markdown
---
name: <kebab-name>
description: <one line: what it does and when to use it>
---
<the instructions>

Written by <seat>/<role> · <tool> · <model> in round <n>.
```
