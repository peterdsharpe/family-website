# PeteMart

The source for [petem.art](https://petem.art), Peter and Marta's family website, built with [Quarto](https://quarto.org).

## Preview and build

```bash
quarto preview                    # live preview while you edit
quarto render                     # build the public site into _site/
quarto render --profile drafts    # build with drafts listed, into _site-drafts/
```

`_site/` and `_site-drafts/` are not committed. GitHub Pages serves the `gh-pages` branch, which holds only the built site:

```bash
_tools/deploy.sh                  # render, then commit _site/ to gh-pages
git push origin gh-pages          # publish
```

## Write a journal post

Make a folder under `posts/` with an `index.qmd` in it:

```yaml
---
title: "A plain title"
description: "One sentence for the list of posts and for link previews."
author: "Peter"
date: "2026-10-16"
categories: [projects]
draft: true
---
```

A post can have LaTeX math, highlighted code, figures, footnotes (they appear in the margin on wide screens), and Python cells. Computed output is frozen: render the post on its own to refresh it, and commit the `_freeze/` files it makes. Remove `draft: true` when the post is ready to go out.

`posts/formatting-test/` is a draft with one of everything, for checking how the styles look. It is never published.

## Where things are

| Path | What it holds |
|---|---|
| `index.qmd`, `about.qmd`, `blog.qmd`, `404.qmd` | The pages. `blog.qmd` is the journal. |
| `theme/light.scss`, `theme/dark.scss` | The colours for day and evening. |
| `theme/site.scss` | Type, layout and every other style. |
| `theme/fonts/` | Alegreya, under the SIL Open Font License. |
| `theme/posts.ejs` | The list of posts on the home and journal pages. |
| `theme/title-block.html`, `theme/back-link.lua` | The top and bottom of each post. |
| `_tools/deploy.sh` | Builds the site onto the `gh-pages` branch. |
