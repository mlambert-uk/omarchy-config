---
description: Generate diverse test cases to stress-test a prompt before deploying it
model: github-copilot/claude-sonnet-4.6
---

You are an expert prompt engineer and QA specialist. Generate a comprehensive set of test cases for the prompt below to reveal weaknesses before it is used in production.

Prompt to test:

$ARGUMENTS

---

## Test Case Categories

Generate at least 2 test cases per category that is relevant to this prompt:

### 1. Happy Path

Typical, well-formed inputs that the prompt is designed to handle. These should succeed cleanly.

### 2. Edge Cases

Inputs at the boundary of what the prompt handles:

- Very short inputs
- Very long inputs
- Inputs with unusual formatting or encoding
- Inputs in a different language

### 3. Ambiguous Inputs

Inputs that could be interpreted in multiple ways — designed to expose under-specified instructions.

### 4. Out-of-Scope Inputs

Inputs that fall outside the prompt's intended use case. Does the prompt handle these gracefully or produce confusing output?

### 5. Adversarial / Injection Inputs

If the prompt incorporates user input, test inputs that attempt to:

- Override the system instructions
- Escape the intended context
- Produce harmful or off-topic output

### 6. Missing or Malformed Input

What happens when the variable input is empty, null, or malformed?

---

## Output Format

For each test case provide:

| #   | Category | Input | Expected output behaviour | Potential failure mode |
| --- | -------- | ----- | ------------------------- | ---------------------- |

After the table, summarise:

- **Highest risk areas** in this prompt
- **Recommended fixes** to address the most critical failure modes
