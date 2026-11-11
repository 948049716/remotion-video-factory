# TODO — 项目待办清单

> 本文件是 **Remotion Video Factory 唯一的项目级待办清单（Single Source of Truth）**。
> 任何 Agent / 开发者发现的遗留问题、待验证项、需人工确认事项，都必须登记在此，不得只写在聊天记录或代码注释里。
> 制定与维护规范见 [`AGENTS.md`](AGENTS.md) 第 6 节「项目待办文件规范」。

**最后更新**：2026-11-12（完成 TODO-004、TODO-005、TODO-006）
**维护者**：AI Agent + 项目所有者

---

## 1. 状态与优先级约定

**状态标记**（必须放在标题行首）

| 标记 | 含义 | 说明 |
| --- | --- | --- |
| `[ ]` | 待办 | 已登记、尚未开始 |
| `[~]` | 进行中 | 正在处理，同一时刻建议不超过 2 项 |
| `[!]` | 阻塞 | 需外部条件或人工决策才能继续，必须在正文写明「阻塞原因」与「解除条件」 |
| `[x]` | 已完成 | 完成后**不删除**，补填完成日期与结论，移入文末「已完成」区 |

**优先级**

| 级别 | 含义 |
| --- | --- |
| `P0` | 阻塞主流程 / 数据或资产损坏风险，需立即处理 |
| `P1` | 影响正常使用，本迭代内应处理 |
| `P2` | 体验或健壮性改进 |
| `P3` | 长期优化、技术债 |

**编号规则**：`TODO-<三位序号>`，全局递增、**永不复用**（即使该项已完成或作废）。作废项标记 `[x]` 并在正文注明「作废原因」，保留编号。

---

## 2. 单条待办的标准格式

每条待办**必须**包含以下字段，缺一不可：

```markdown
### [ ] TODO-012 · P1 · 一句话标题（动作 + 对象）

- **登记日期**：YYYY-MM-DD
- **影响范围**：`scripts/generate_tts.py` / 公网 TTS 通道 / 所有远程 Agent
- **现象**：客观描述可观测到的事实（报错、超时、数据），不写推测。
- **复现步骤**：
  1. …
  2. …
- **根因分析**：（已确认写结论；未确认写「待确认」+ 当前最可能假设）
- **期望结果**：修复后应达到的状态。
- **验收标准**：可被脚本或命令验证的条件（必须可判定，禁止「体验更好」这类模糊描述）。
- **临时绕过方案**：当前可用的替代做法（无则写「无」）。
- **相关文件 / 链接**：…
```

> 约定：**「验收标准」不可省略**——它是该项能否被标记 `[x]` 的唯一依据。

---

## 3. 未完成待办

### [!] TODO-001 · P1 · 公网 TTS 端点 `tts.miong.dpdns.org:9481` 无法访问

- **登记日期**：2026-11-12
- **影响范围**：`scripts/generate_tts.py` 的 `public` 端点；所有**不在 NAS 同一局域网**的机器/Agent（外部电脑、云端 CI）执行 TTS 时全部失败。
- **现象**：
  - `curl https://tts.miong.dpdns.org:9481/docs` 返回连接超时（`http_code=000`，无响应）。
  - DNS 解析正常：`tts.miong.dpdns.org` → `112.74.85.74`。
  - 同一服务局域网端点 `http://192.168.0.2:5055/v1` 一切正常（`/v1/models`、`/v1/audio/speech` 均 200，返回 `audio/mpeg`）。
- **复现步骤**：
  1. 在**非局域网**环境执行：`curl -s -m 10 -o /dev/null -w "%{http_code}\n" https://tts.miong.dpdns.org:9481/docs`
  2. 观察返回 `000`（超时），而非 `200`。
  3. 对照执行：`curl -s -m 8 -o /dev/null -w "%{http_code}\n" http://192.168.0.2:5055/docs` 返回 `200`。
- **根因分析**：待确认。已排除 DNS 问题（解析正确）。当前最可能假设按概率排序：
  1. NAS 路由器/防火墙未放通公网 `9481` 端口的入站转发（端口映射缺失或运营商封锁该端口）；
  2. 反向代理（NPM / Nginx / Caddy）未监听或未配置 `tts.miong.dpdns.org` 的 9481 vhost / TLS 证书；
  3. ddns 记录指向的 `112.74.85.74` 与实际出口 IP 不一致（记录过期或指向了另一台云主机）。
- **期望结果**：公网地址 `https://tts.miong.dpdns.org:9481/v1/audio/speech` 在任意外网环境可正常合成并返回音频。
- **验收标准**（全部满足才算完成）：
  1. 外网环境 `curl -s -m 10 -o /dev/null -w "%{http_code}\n" https://tts.miong.dpdns.org:9481/docs` 返回 `200`；
  2. `python3 scripts/generate_tts.py --text "公网连通性测试" --out /tmp/pub.mp3 --endpoint public` 成功产出非空 mp3；
  3. 用 `ffprobe` 校验产物时长 > 0 秒。
- **临时绕过方案**：与 NAS 同局域网的机器使用默认 `--endpoint lan`（`auto` 模式也会自动优先内网）；外网机器暂无法合成语音，需等待本项修复。
- **相关文件 / 链接**：`scripts/generate_tts.py`、`AGENTS.md` §1.5、NAS 端口映射与反代配置（不在本仓库内）。

### [ ] TODO-002 · P3 · 启动 Studio 时 Watchpack 监听 `/vol2` 报 EACCES 权限告警

- **登记日期**：2026-11-12
- **影响范围**：`npm run dev` 启动的 Remotion Studio 控制台输出；工作区位于 `/vol2` 挂载卷的所有 Agent 会话。
- **现象**：启动后 stderr 输出两条 `Watchpack Error (watcher): Error: EACCES: permission denied, watch '/vol2'` 与 `watch '/vol2/1000'`。服务本身 `http://localhost:3000` 返回 200，Bundle 成功（`Built in 2042ms`），修改 `src/index.ts` 后 3 秒内出现 `Built in 257ms`，热更新实测可用。
- **复现步骤**：
  1. 在 `/vol2/1000/Project/remotion-video-factory` 执行 `npm run dev`。
  2. 等待 `Server ready` 与首次 `Built in`，观察 stderr 中两条 EACCES 告警。
  3. 执行 `touch src/index.ts`，确认后续仍能 `Building... / Built in`。
- **根因分析**：待确认 + 假设：工作区位于 NAS 挂载卷，父目录 `/vol2`、`/vol2/1000` 对当前运行用户缺少可读/可遍历权限，Watchpack 向上递归监听时被拒绝；项目目录自身可读，故 Bundle 与 HMR 不受影响。
- **期望结果**：启动与热更新阶段 stderr 无 EACCES 告警，且 HMR 仍正常。
- **验收标准**（全部满足才可标记 `[x]`）：
  1. `npm run dev` 启动后采集 30 秒 stderr，`grep -c "EACCES"` 结果为 `0`；
  2. `touch src/index.ts` 后 5 秒内日志出现 `Built in`；
  3. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` 返回 `200`。
- **临时绕过方案**：忽略该告警（已实测不影响 Bundle、页面访问与热更新）；或在宿主机为运行用户放通 `/vol2`、`/vol2/1000` 的读取与执行权限。
- **相关文件 / 链接**：`package.json`（`dev` 脚本）、`remotion.config.ts`、宿主机 `/vol2` 挂载目录权限（不在本仓库内）。

### [ ] TODO-003 · P3 · git 因属主不一致拒绝执行（dubious ownership）

- **登记日期**：2026-11-12
- **影响范围**：本工作区所有 `git status` / `git log` / `git add` / `git commit` 等命令。
- **现象**：`git status --short` 返回 `fatal: detected dubious ownership in repository at '/vol2/1000/Project/remotion-video-factory'`，退出码 128；仓库内文件属主混有 `trim.openclaw` 与 `Harness`。
- **复现步骤**：
  1. 在工作区根目录执行 `git status --short`。
  2. 观察 `fatal: detected dubious ownership` 与退出码 128。
  3. 对照执行 `git -c safe.directory="$(pwd)" status --short` 成功（退出码 0）。
- **根因分析**：待确认 + 假设：`.git` 与工作区文件属主和运行 git 的用户不一致，触发 Git 2.35.2+ 引入的 `safe.directory` 安全校验；与挂载卷权限配置有关，而非仓库内容损坏。
- **期望结果**：不带任何附加参数直接执行 `git status`、`git log` 即可正常工作。
- **验收标准**（全部满足才可标记 `[x]`）：
  1. `git status --short` 退出码为 `0` 且输出不含 `dubious ownership`；
  2. `git log --oneline -1` 退出码为 `0`；
  3. 无需在命令中附加 `-c safe.directory=...`。
- **临时绕过方案**：每条命令附加 `-c safe.directory=/vol2/1000/Project/remotion-video-factory`；或一次性执行 `git config --global --add safe.directory /vol2/1000/Project/remotion-video-factory`（会修改全局 git 配置，需用户确认后执行）。
- **相关文件 / 链接**：仓库根 `.git/`、宿主机用户与文件属主配置（不在本仓库内）。

---

## 4. 已完成 / 已关闭

<!-- 完成后移入此区，保留原始编号与验收标准，并补填完成日期与结论。 -->

### [x] TODO-006 · P3 · `AGENTS.md` §1.2 仍把已清空的 `src/videos/Showreel/` 当作标杆参考

- **登记日期**：2026-11-12
- **影响范围**：`AGENTS.md` §1.2「Reuse Shared Motion Assets」；所有按 AGENTS.md 指引寻找动效参考的新 Agent。
- **现象**：§1.2 末条写着 "Reference [`src/videos/Showreel/`](src/videos/Showreel/) as the gold-standard reference for 60 FPS motion craft"，但该目录已随 commit `a822fa0` 清空，路径链接为死链，Agent 按指引跳转会得到空目录。
- **复现步骤**：
  1. `find src/videos -maxdepth 2 -type f` → 输出为空。
  2. `grep -n "src/videos/Showreel" AGENTS.md` → 命中 §1.2 引用行。
- **根因分析**：已确认。与 TODO-004 同源（`a822fa0` 清空作品时只改了 `src/Root.tsx`），本次修订 `README.md` 时未同步 `AGENTS.md` §1.2。
- **期望结果**：`AGENTS.md` 不再指向不存在的标杆作品，改为指向真实存在的参考（`src/shared/motion-presets.ts`、`src/shared/GlobalOverlay.tsx`），或明确标注「标杆作品待重建」。
- **验收标准**（全部满足才可标记 `[x]`）：
  1. `grep -c "src/videos/Showreel" AGENTS.md` 结果为 `0`；
  2. `grep -c -E "motion-presets|GlobalOverlay" AGENTS.md` 结果 ≥ 2（保留可用参考）；
  3. 若保留「标杆作品」概念，须有可判定说明（如 `test -d src/videos/Showreel` 为真时方可指回）。
- **临时绕过方案**：以 `src/shared/motion-presets.ts` 与 `src/shared/GlobalOverlay.tsx` 作为动效与 HUD 参考。
- **相关文件 / 链接**：`AGENTS.md` §1.2、commit `a822fa0`、TODO-004。
- **完成日期**：2026-11-12
- **完成结论**：§1.2 死链已改为明确说明「当前无标杆作品，`src/videos/` 已于 `a822fa0` 清空」，并指向真实存在的 `src/shared/motion-presets.ts` 与 `src/shared/GlobalOverlay.tsx`。验收实测：`grep -c "src/videos/Showreel" AGENTS.md` = `0`；`grep -c -E "motion-presets|GlobalOverlay" AGENTS.md` = `3`（≥2）。

### [x] TODO-004 · P2 · README 目录结构与预览指引未同步「清空所有作品」后的现状

- **登记日期**：2026-11-12
- **影响范围**：`README.md` §「仓库目录结构」与 §2「启动可视化交互工作台」；所有拉取仓库后按 README 操作的新 Agent / 开发者。
- **现象**：README 声称 `src/videos/Showreel/`、`src/videos/HelloWorld/` 存在且 Studio 左侧 `Productions` 文件夹下可点击预览作品；实际 `src/videos/` 为空目录，`src/Root.tsx` 中两个 `<Folder>` 均为空（commit `a822fa0` 已按请求清空全部作品与注册项）。按 README 启动后 Studio 打开为空，`npx remotion compositions src/index.ts` 因无任何 Composition 报 `Error: Array of 0 length`。
- **复现步骤**：
  1. `find src/videos -maxdepth 2 -type f` 输出为空。
  2. `grep -n "Showreel/\|HelloWorld/\|点击预览不同的视频作品" README.md` 命中 3 处以上。
  3. `npx remotion compositions src/index.ts` 输出 `Error: Array of 0 length` 且非零退出。
- **根因分析**：已确认。commit `a822fa0` 清空视频目录与 Composition 注册时未同步修订 `README.md`；`src/Root.tsx` 的注释已写明"All compositions were cleared on request; no videos are currently registered."，README 未跟进。
- **期望结果**：README 如实反映当前空项目状态与新建视频的注册方式，新用户不会误以为已有可直接预览的作品。
- **验收标准**（全部满足才可标记 `[x]`；以「只修订文档、不擅自恢复作品」为准）：
  1. `grep -c -E "src/videos/Showreel|src/videos/HelloWorld|点击预览不同的视频作品" README.md` 结果为 `0`；
  2. README 中包含明确的空项目说明与新建视频入口指引，`grep -c -E "暂无.*(作品|Composition)|src/videos/<VideoName>|src/Root.tsx" README.md` 结果 ≥ 2；
  3. `grep -c "remotion render Showreel" README.md` 结果为 `0`（或该命令替换为带「需先注册」前提的说明且不指向不存在的 Composition）。
- **临时绕过方案**：以 `src/Root.tsx` / `AGENTS.md` 与 `find src/videos` 的实际结果为准；本次启动仅用于打开 Studio，不依赖 README 中的示例作品。
- **相关文件 / 链接**：`README.md`、`src/Root.tsx`、`AGENTS.md` §1.3、commit `a822fa0`。
- **完成日期**：2026-11-12
- **完成结论**：README 已按「只修订文档、不擅自恢复作品」重写。验收实测：`c1 = 0`（无 Showreel/HelloWorld/「点击预览」残留）、`c2 = 5`（≥2，含空项目说明与新建入口）、`c3 = 0`（无 `remotion render Showreel`）。同时补充了「静态资产规范」章节与新的目录树。

### [x] TODO-005 · P2 · 建立静态资产三层分离规范（`assets/` / `public/` / `output/`）与机器校验

- **登记日期**：2026-11-12
- **影响范围**：所有新建视频的素材投放、`staticFile()` 引用、提交前自检；`AGENTS.md`、`README.md`、`assets/`、`scripts/`、`.gitignore`、`package.json`。
- **现象**：规范原先只有一句 "Place audio/font/image assets in `public/`"，没有区分「做视频用的原始素材」与「成品运行时需要的文件」。原始大文件（4K 原片、PSD、原始音乐）与转码后的运行时资产混在 `public/` 一个目录，既会撑爆 git 仓库（仓库需经 GitHub 同步给多个 Agent），也无法判断哪些文件是代码真正引用的。
- **复现步骤**：
  1. 查看修订前 `AGENTS.md` §1.4：仅要求「放进 `public/` 并用 `staticFile()` 引用」。
  2. `find public -type f` 只有 `showreel-music.mp3`，无任何分目录约定。
  3. 把一个 2 GB 的 `.mov` 原片放进 `public/`，无任何机制阻止。
- **根因分析**：已确认。规范缺失资产分层概念；Remotion 的 `staticFile()` 只能读 `public/`，因此必须把「素材」放在渲染路径之外，用加工步骤桥接到 `public/`。
- **期望结果**：三层职责清晰、命名与体积可机器判定、素材清单可追溯、原始素材不入 git。
- **验收标准**（全部满足才可标记 `[x]`）：
  1. `python3 scripts/check-assets.py` 退出码 `0`；
  2. `grep -c "静态资产三层分离" AGENTS.md` ≥ 1，且 `grep -c "assets/" AGENTS.md` ≥ 3；
  3. `grep -c "静态资产规范" README.md` ≥ 1；
  4. `git -c safe.directory=$(pwd) check-ignore -q assets/Foo/raw.mov` 退出码 `0`（素材默认忽略），而 `git -c safe.directory=$(pwd) check-ignore -q assets/Foo/README.md` 退出码 `1`（清单必须入库）；
  5. `npm run check:assets` 可执行且退出码 `0`。
- **临时绕过方案**：无（本项已实现，无需绕过）。
- **相关文件 / 链接**：`assets/README.md`、`assets/_template/README.md`、`scripts/check-assets.py`、`.gitignore`、`package.json`、`AGENTS.md` §1.4/§1.5、`README.md`、`scripts/generate_tts.py`。
- **完成日期**：2026-11-12
- **完成结论**：
  - 新增 `assets/` 素材库（`_inbox/` 投料区、`_template/` 清单模板、`<VideoName>/{video,audio,images,fonts,docs}`），整体不入 git，仅 `README.md`、`_template/**`、`_inbox/.gitkeep`、`<VideoName>/README.md` 入库。
  - `public/` 改为 `_shared/audio/` + `<video-name>/{audio,images,fonts,video}` 分目录；`showreel-music.mp3` 已迁至 `public/_shared/audio/`。
  - 新增 `scripts/check-assets.py`：校验 `public/` 命名、单文件 ≤10 MB、`staticFile()` 引用缺失、孤儿资产、素材清单缺失、素材误入库；接入 `npm run check:assets` 与 `npm run check`。
  - `AGENTS.md` §1.4 重写为三层分离规范，§1.5 TTS 产物路径改为 `public/<video-name>/audio/`；`scripts/generate_tts.py` 默认输出改为 `public/_shared/audio/`。
  - 实测：`python3 scripts/check-assets.py` 退出码 `0`（仅 1 条孤儿资产告警，因当前无任何 Composition 引用该 BGM）。

---

## 4. 已完成 / 已关闭

---

## 5. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-11-12 | 建立待办清单与规范；登记 TODO-001（公网 TTS 端点不可达） |
| 2026-11-12 | 启动 Studio 并登记三项环境问题：TODO-002（Watchpack EACCES 告警，HMR 实测可用）、TODO-003（git dubious ownership）、TODO-004（README 未同步清空作品后的现状） |
| 2026-11-12 | 建立静态资产三层分离规范并实现校验脚本（TODO-005 完成）；`public/` 改分目录、新增 `assets/` 素材库；归档 TODO-004、TODO-006（`AGENTS.md` §1.2 死链一并修正） |
