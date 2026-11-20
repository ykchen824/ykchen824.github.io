# ykchen824.github.io

Personal homepage, built by GitHub Pages with Jekyll. Push to `main` and the
site rebuilds itself; no local build is needed.

## How AI Fails

将 `_templates/fails.md` 复制到 `_fails/<slug>.md`。文件名就是网址：
`_fails/my-report.md` 对应 `/fails/my-report/`。档案按首次报告日期倒序排列。

文件开头只有 7 项，其余内容都写在正文里：

- `title`、`summary`：标题和列表页显示的一句话摘要。
- `date`：首次公开报告的日期。
- `model`：模型名称，版本写在这里或正文里都可以。
- `category`：行为类型，优先复用已有名称。
- `setting`：`线上部署`、`受控评估` 或 `模拟环境`。
- `verification`：`已独立复现`、`有公开原始记录`、`有一手报告` 或 `待核验`。

正文用 `##` 分小节，写法见模板：任务背景、预期行为、实际行为、影响、证据与核验、
可选的作者分析（标题保持 `## 作者分析 {#analysis}`），最后是参考文章。
前面几节只写来源能支持的内容，作者的判断都放在作者分析里。

引用与 Writing 相同：正文写 `[作者, 年份](#ref-<id>)`，参考文章里的 id 写成 `ref-<作者>-<年份>`。
同一作者同年有多篇时，年份写成 `2026a`、`2026b`。

更新旧报告时直接修改正文，`date` 保持首次报告日期。改变了之前的结论时，在「证据与核验」里写明。

Writing 文章的写法见 `_templates/writing.md`。
