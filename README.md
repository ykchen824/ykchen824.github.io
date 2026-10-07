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
year: 2026
month: October
date: 2026-10-07
date_display: October 7, 2026
reading_time: 5 min
author: Yongkang Chen
---

Write the essay here in Markdown.
```

The `year`, `month`, `date`, `date_display`, `reading_time`, and `author`
fields drive the Writing list. Entries are grouped by year and sorted from
newest to oldest by `date`.

In the repository settings, set GitHub Pages to deploy from the branch and
folder containing this site (usually `main` / `/ (root)`). Jekyll reads
`_config.yml`, `_layouts/`, and `_writing/` during the Pages deployment.
