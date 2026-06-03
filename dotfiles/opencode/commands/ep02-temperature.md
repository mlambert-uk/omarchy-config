---
description: EP02 demo — run the same prompt through low, mid, and high temperature agents in parallel and compare outputs
---

# EP02 Temperature Comparison Demo

Runs the temperature demo prompt through all three temperature agents simultaneously and presents the results as a side-by-side comparison.

## Prompt

You are running a live demonstration of how temperature affects LLM output.

Invoke all three of the following subagents **in parallel**, passing each of them exactly the same question:

> "Describe what happens inside a computer when you press a key on the keyboard."

Agents to invoke in parallel:

- `ep02-temp-low` (temperature 0.1)
- `ep02-temp-mid` (temperature 0.7)
- `ep02-temp-high` (temperature 1.4)

Once all three responses have been returned, present them to the user in the following format — do not summarise, edit, or paraphrase any of the responses; reproduce them exactly as returned:

---

## 🟦 Option A — Temperature 0.1 (Low)

_Focused and deterministic. Nearly always picks the most probable next token._

[Response from ep02-temp-low]

---

## 🟨 Option B — Temperature 0.7 (Mid)

_Balanced. Some variation in word choice and structure._

[Response from ep02-temp-mid]

---

## 🟥 Option C — Temperature 1.4 (High)

_Adventurous. Samples from a wider spread of probable tokens — more varied, less predictable._

[Response from ep02-temp-high]

---

After presenting all three, add a single short observation (2–3 sentences maximum) noting the most visible differences between the responses — word choice, structure, tone, or use of analogy. Do not evaluate which is "better".
