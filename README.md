# My website source files

A personal webpage powered by GitHub Pages and Jekyll.

## Writing

No local build script is needed. Add one Markdown file to `_writing/`, commit
it, and push it to the repository. GitHub Pages will generate the Writing index
at `/writing/` and the article page automatically.

Use this front matter at the top of each file:

```markdown
---
title: A short essay title
date: 2026-10-07
---

Write the essay here in Markdown.
```

Only `title` and `date` are needed. The `date` field automatically supplies the
year, month, display date, grouping, and newest-first sorting in the Writing
list.

In the repository settings, set GitHub Pages to deploy from the branch and
folder containing this site (usually `main` / `/ (root)`). Jekyll reads
`_config.yml`, `_layouts/`, and `_writing/` during the Pages deployment.
