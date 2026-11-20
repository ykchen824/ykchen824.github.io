---
# Copy this file to _writing/<slug>.md. The file name becomes the URL:
# _writing/my-essay.md -> /writing/my-essay/
title: Essay title
date: 2026-01-01
summary: A one-sentence summary for the Writing list.
keywords: []    # Optional keywords for the Writing search.
# lang: en    # Optional. Defaults to zh-CN.
---

Write the essay here in Markdown. Each `##` heading becomes an entry in the
table of contents.

## First section

Cite in author-year style, linking to the entry below: the claim
([Author, 2026](#ref-author-2026)). With two or more works by the same author in
the same year, label them 2026a, 2026b and use matching ids.

---

## References

List entries alphabetically by author, then by year. Every entry needs an id of
the form `ref-<author>-<year>` that matches its in-text links.

<ol class="references">
  <li id="ref-author-2026">Author. (2026). <a href="https://example.com/paper">Paper title</a>. <em>Venue</em>.</li>
</ol>
