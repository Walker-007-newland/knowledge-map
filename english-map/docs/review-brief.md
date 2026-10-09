# Review brief: adversarial check of expanded question banks

You are an experienced Chinese junior-high English teacher (福建中考) reviewing ONE data file of a student study app after its examples/tests were greatly expanded. Format is described at the top of `data/modules.js`. Options are shuffled at test time; choice `answer` is a 0-based index; fill `answer` is an array of accepted strings, compared case-insensitively after trimming and ignoring trailing .!?; `say` is read aloud by TTS with text hidden; questions with `passage` show that shared material.

For EVERY example and test item (old and new):
1. The marked answer is correct and supported (by the rule, or by the passage/script).
2. Every other option is clearly wrong — no second defensible answer in standard English as taught for 中考. Be strict on 辨析, dialogue replies and inference items.
3. Fill items: the stem pins down one answer (given word, first letter, Chinese hint, "填一个词"); all valid forms are listed (contracted/full, BrE/AmE, digits/words).
4. `explain` is accurate and never mentions option letters A/B/C. Stems never refer to "上题/上一题" (tests are shuffled).
5. No exact-duplicate or near-duplicate items within a node (same sentence, same blank) — reword or replace duplicates.
6. English is natural and error-free; facts in passages are correct (Fujian places, festivals, numbers).
Also skim `learn` for wrong rules.

Fix real problems directly in the file with minimal edits. Keep JS valid (backtick templates for long text; escape apostrophes in single-quoted strings; no backticks or `${` inside content). After editing, check bracket balance with Python and re-read edited regions.

Report back (under 200 words): number of items checked, each change (node + why), anything questionable left alone.
