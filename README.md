# PeteMart family website

The source for [petem.art](https://petem.art), built with Quarto.

## Local preview

```bash
quarto preview
```

## Render

```bash
quarto render
```

Rendered output is written to `_site/` and is intentionally excluded from the
`main` branch. The public artifact is committed separately on `gh-pages`.

## Write a journal entry

Create a folder under `posts/` containing an `index.qmd` file. Start with:

```yaml
---
title: "A useful title"
description: "One sentence for listing cards and search results."
author: "Peter and Marta"
date: "2026-09-04"
categories: [projects, notes]
draft: true
---
```

Posts support LaTeX math, syntax-highlighted code, figures, citations, and
executable Python cells. Computational output is frozen by default: render the
individual post locally to refresh its output, commit the generated `_freeze/`
files, and remove `draft: true` when the entry is ready for the public site.
