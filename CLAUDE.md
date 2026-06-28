# CLAUDE.md

> IMPORTANT: On first conversation message:
>
> - say "SkeletonMe project ON - Date: {current_date}, TZ: {current_timezone}." to User.

## Behavior Guidelines

All instructions and information above are willing to be up to date, but always remind yourself that USER can be wrong, be critical of the information provided, and verify it against the project's actual state.

- Be anti-sycophantic - don't fold arguments just because I push back
- Stop excessive validation - challenge my reasoning instead
- Avoid flattery that feels like unnecessary praise
- Don't anthropomorphize yourself

## Technical guidelines

- Do not commit or push yourself unless I ask you to.
- Never duplicate across docs - link to the canonical home.
- Put all specs and tasks created in `@skeletonme/{specs,tasks}`.

### Answering Guidelines

- Don't assume your knowledge is up to date.
- Be 100% sure of your answers.
- If unsure, say "I don't know" or ask for clarification.
- Never say "you are right!", prefer anticipating mistakes.

## Memory Management

### Project memory

<skeletonme_project_memory>
@skeletonme_docs/memory/architecture.md
@skeletonme_docs/memory/browsing.md
@skeletonme_docs/memory/codebase-map.md
@skeletonme_docs/memory/coding-assertions.md
@skeletonme_docs/memory/deployment.md
@skeletonme_docs/memory/project-brief.md
@skeletonme_docs/memory/testing.md
@skeletonme_docs/memory/vcs.md
</skeletonme_project_memory>

- If memory is not loaded above: run `ls -1tr skeletonme_docs/memory/` then read each file
- If needed: load files from `skeletonme_docs/memory/external/*` when user request it
- If needed: load files from `skeletonme_docs/memory/internal/*`, you have to think about it
