Complete the document:

docs/019_REGLAS_DE_IMPLEMENTACION_IA.md

Write the entire document in Spanish.

Do NOT generate application code.

Do NOT modify the application.

Only create technical documentation.

====================================================
TITLE
====================================================

019 - REGLAS DE IMPLEMENTACIÓN PARA IA

====================================================
OBJECTIVE
====================================================

This document defines the mandatory rules that every AI assistant (Jules, Codex, ChatGPT or any future AI) must follow when working on this repository.

These rules are mandatory.

Failure to follow any rule means the implementation is incorrect.

====================================================
GENERAL RULES
====================================================

Before modifying any code:

- Read the entire /docs directory.
- Read all screen specifications.
- Read the architecture documents.
- Read the database documentation.
- Read the implementation rules.

Never start coding before reading the documentation.

====================================================
OFFICIAL SPECIFICATION
====================================================

The documentation is the official specification.

The screenshots are the official visual specification.

If there is any conflict:

Documentation takes precedence.

Screenshots take precedence over AI design decisions.

====================================================
DESIGN
====================================================

Never redesign the interface.

Never modernize it.

Never simplify it.

Never improve it according to your own criteria.

Your task is to reproduce the supplied design.

Not reinterpret it.

====================================================
SUPABASE
====================================================

Supabase is the only source of data.

Never use:

- mockData
- fake JSON
- local arrays
- hardcoded products
- temporary data

====================================================
CODE
====================================================

Write clean code.

Reusable code.

Modular architecture.

No duplicated code.

Follow existing project architecture.

====================================================
PULL REQUESTS
====================================================

Always create small Pull Requests.

One objective per Pull Request.

Never mix unrelated changes.

====================================================
VERIFICATION
====================================================

Before submitting any Pull Request:

Build the project.

Fix build errors.

Fix lint errors whenever possible.

Verify imports.

Verify routing.

Verify navigation.

Verify compilation.

====================================================
DO NOT
====================================================

Do not invent screens.

Do not invent buttons.

Do not invent features.

Do not change colours.

Do not change typography.

Do not change spacing.

Do not change layouts.

Do not change architecture.

Do not rename database fields.

Do not rename folders.

====================================================
IF SOMETHING IS MISSING
====================================================

Stop.

Explain exactly what information is missing.

Do not guess.

Do not implement assumptions.

====================================================
QUALITY
====================================================

Every implementation must be production-ready.

No placeholders.

No TODO comments.

No incomplete implementations.

====================================================
FINAL OBJECTIVE
====================================================

Every implementation must match the documentation and reference screenshots as closely as possible.

The goal is not creativity.

The goal is faithful implementation of the official project specification.

Create the Pull Request when finished.