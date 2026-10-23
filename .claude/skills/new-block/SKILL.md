---
name: new-block
description: Add a new block to the DSL, test first (give its name and what it shows)
argument-hint: <name> <what it should show>
disable-model-invocation: true
---

Add the new DSL block described in the user's message. Follow the `extend-dsl` skill step by step, starting with the failing tests. If the message doesn't say what the block contains or how it should look, ask before writing code.

At the end, show one example of using the block in a content file. Don't add it to the content unless asked.
