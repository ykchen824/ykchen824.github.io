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

For references at the end of an essay, use a normal Markdown section and
ordered list:

```markdown
---

## References

1. Author. [Paper title](https://example.com/paper). *Journal*, 2026.
2. Author. [Another paper](https://example.com/another-paper).
```

For a highlighted keyword citation, link the keyword to a reference ID at the
end of the article:

```markdown
这是一句带有[引用关键词](#ref-paper)的文字。

---

## References

<ol class="references">
  <li id="ref-paper">作者。<a href="https://example.com/paper">论文标题</a>。*Journal*，2026。</li>
</ol>
```

点击正文中的关键词会跳转到文末对应文献，引用关键词会以浅色背景突出显示。

In the repository settings, set GitHub Pages to deploy from the branch and
folder containing this site (usually `main` / `/ (root)`). Jekyll reads
`_config.yml`, `_layouts/`, and `_writing/` during the Pages deployment.
