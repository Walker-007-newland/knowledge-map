# 第 4 阶段内容写作说明（给写作代理）

You are writing 题型技能 content for a Chinese student English knowledge-graph web app (福建中考英语知识图谱). The learner is a child working up from 小学四年级 toward 福建中考; textbooks 仁爱版 (junior high). Explanations are read by the student: friendly, clear, 口语化 Chinese, English for all exam material.

## Files to read first
- `data/modules.js` — the full field format, especially the newer features: `say` (string, or a dialogue array `[{who:'W',text},{who:'M',text}]` read with two voices), `passages` + `passage` (several questions sharing one text; `hidden:true` for listening material; cloze blanks as `<span class="blank">(1)</span>`), `practice` (writing tasks: prompt, word range, checklist, sample essay; no auto-grading).
- `data/grammar.js` — gold standard for tone, HTML conventions, explanation style.
- `docs/phase4-spec.md` — your node list (exact id/title/short/grade/freq/prereqs; module is always `'skill'`), plus the note on the 2025 题型 changes.

## Every node
- `tip`: one sentence: what this 题型 tests and the #1 trap, and always end with “（具体题量分值以当年《考试说明》为准）”. Never cite specific years' real exam papers as sources.
- `learn`: 4–5 sections `{h, html}`: 题型说明 → 解题步骤 (numbered, concrete) → 常见陷阱 → a fully worked demo using a short original passage/dialogue with the thinking spelled out. Use `.ex`, `.rhyme`, `.tbl`, `.warn`, `<ol>`.
- `examples`: 2–3 worked items (may use `passage`).
- `tests`: 7–10 auto-graded items; choice (3 or 4 options, 0-based `answer`) and fill (array of all acceptable answers; must be unambiguous, 1–3 words, give first letter/given word when needed). For passage-based nodes, typically 1–2 original passages with 4–5 questions each. `explain` in Chinese, explaining WHERE in the text the answer comes from; NEVER mention option letters A/B/C (options are shuffled).
- All passages, dialogues and listening scripts must be ORIGINAL, at 中考 difficulty (about 150–280 words per reading passage; cloze 10 blanks), with natural English. Themes typical of 中考: school life, family, friendship, environment, Chinese culture, Fujian hometown, science, health, volunteering. Never copy real exam papers or published articles.
- EXACTLY ONE correct answer per choice item; double-check every distractor is wrong according to the text.

## JS syntax safety (no Node.js available)
Use backtick template literals for all `html`, `sample`, `prompt` fields and long passages; never put a backtick or `${` inside content. Single-quoted short strings must escape apostrophes (\') or use double quotes. After writing, re-read the whole file for quotes/brackets/commas and run a Python bracket check outside strings.

## Report back (under 200 words)
Node ids written, number of tests/passages/practice tasks per node, anything simplified or uncertain.
