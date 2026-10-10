# ykchen824.github.io

Personal homepage, built by GitHub Pages with Jekyll. Push to `main` and the
site rebuilds itself; no local build is needed.

## Add news

Add an entry to `_data/news.yml`:

```yaml
- date: 2026-01-01
  text: Joined Example Lab as a Research Scientist.
```

Entries are sorted by date, so order in the file does not matter. The newest
appears in the top banner, the newest 3 in the News section, and older ones
are folded under the arrow. For links or italics see `_templates/news.yml`.

## Add writing

Copy `_templates/writing.md` to `_writing/<slug>.md` and edit it. The file name
becomes the URL (`_writing/my-essay.md` → `/writing/my-essay/`). Only `title`
and `date` are required; `summary` is shown in the Writing list.

Citations: link a keyword to `#ref-<id>` and give the matching reference
`id="ref-<id>"` in a `<ol class="references">` list at the end. The keyword is
highlighted and jumps to the reference. The template shows the pattern.

## Layout

```
index.html            Homepage content (intro, publications, experience, …)
_data/news.yml        News entries
_writing/             Essays, one Markdown file each
_templates/           Copy-ready examples for news and writing (not published)
writing/index.html    Generates the /writing/ list page
_layouts/             Page templates for the writing list and essays
_includes/            Header, footer and other shared pieces
assets/style.css      All styles
assets/images/        Portraits
_config.yml           Jekyll settings
```

## Preview locally (optional)

Requires Ruby. Pages that use templates do not render when opened directly.

```bash
gem install jekyll && jekyll serve
```

Then open http://localhost:4000.
