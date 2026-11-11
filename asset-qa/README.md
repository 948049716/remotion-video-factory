# 图片素材交付验收（asset-qa）

这是「跳槽马」纸艺动画的素材交付契约 + 自动验收闸门，可整个文件夹复制给生图 agent 使用。
**规则只有一条：`check-assets.ps1` 返回码不为 0 的批次，不算交付。**

## 你的任务

1. 读 `asset-list.md`（人读版）或 `asset-list.json`（机读版），共 60 项，其中 55 项需要生图，5 项由代码绘制、跳过。
2. 按每项 prompt 生成，放进 `raw/`，文件名必须与 `output` 一致。
3. 每批生成后跑 `check-assets.ps1`，返回码 0 才交付。
4. 交回 `raw/`、`out/asset-check-raw.json`、`out/contact-raw-*.png`。

## 文件夹内容

| 文件 | 用途 |
|---|---|
| `asset-list.md` | 人读版清单：60 项的名称、文件名、画幅、幕布、优先级、完整 prompt。 |
| `asset-list.json` | 机读版契约：字段同上，另有 `imageSizeMap`、全局风格、negative prompt。不要手改。 |
| `check-assets.ps1` | Windows 验收脚本。检查命名、尺寸、幕布、边距、重复图与抠图边残。 |
| `check-assets.py` | Linux / macOS 验收脚本，检查项与 PowerShell 版一致。 |
| `image-tools.cs` | PowerShell 脚本依赖的图像检测代码，随脚本一起复制，不要单独移动。 |
| `raw/` | 生成图放这里，文件名按清单 `output`。 |
| `out/` | 运行后生成的 JSON 报告与接触表（可删）。 |

## 交付流程

1. **按清单生图**：读 `asset-list.md`（或 `asset-list.json`），每项按 `output` 命名，放进 `raw/`。
   - 人物、道具、特效必须落在纯色幕布上：默认绿幕 `#00FF00`，`backgroundCode` 为 `magenta` 的必须用洋红幕 `#FF00FF`。
   - 背景按 `pixels` 满幅生成，不要幕布。
   - 一张图只放一个素材；不许拿同一张图改名交付多项。
   - 生成器自带的右下角水印不用处理，后期统一裁掉；但不要自行添加文字、logo 或额外水印。
2. **自检**（交付前必须跑）：

   ```powershell
   powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Root raw -Priority 1 -Sheets
   ```

3. **只返工 FAIL**：脚本会打印逐项原因，按原因重生成后重跑，直到返回码为 0。
4. **交付**：把 `raw/`、`out/asset-check-raw.json`、`out/contact-raw-*.png` 一起交回。

P1、P2、P3 分批做，每批都走一遍 1–4，不要全部生成完再查。

## 判定标准

自动检查会卡这些硬条件：

- 文件名必须与清单 `output` 一致（扩展名 `.png` 优先，`.jpg` 也接受，但同名）
- 像素与 `pixels` 完全一致（允许 ±1px）
- 幕布四角颜色必须是规定的绿/洋红，且背景覆盖足够、不被主体填满
- 主体与投影不得进入四周 6% 边距（清单要求 8% 留白）
- 不同 id 不得使用完全相同的文件（哈希去重）
- 抠图阶段额外检查：必须是带透明通道的 PNG、不能是空图、边缘不得残留绿/洋红边

结果含义：

- `PASS`：可以交付
- `WARN`：可交付但建议修（如轻微边残、满幅背景疑似带幕布）
- `FAIL`：必须重生成，整批返回码为 1

## 机器查不了的部分

脚本不判断“画得对不对”，以下必须靠接触表目检，每 20 张一张，不要逐张看原图：

- 背景里是否烤进了主角、马匹、官员
- 木牌、幌子、匾额是否留空（没有文字/数字）
- 角色是否三视图齐全、比例一致、服饰符合设定
- 风格是否为宣纸剪贴、纸层与撕边质感是否统一
- 是否有水印、多余肢体、明显畸形

把 `out/contact-raw-*.png` 交给验收方看即可。

## 常用命令

**Windows / PowerShell**

```powershell
# 全量检查
powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Root raw

# 只查 P1
powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Root raw -Priority 1

# 只查指定几项（id 或文件名，逗号分隔）
powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Root raw -Only bg-street-west,char-er

# 检查抠图成品
powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Stage cutout -Root cutouts

# 换清单或输出目录
powershell -ExecutionPolicy Bypass -File check-assets.ps1 -Root raw -ListPath .\asset-list.json -OutDir .\out
```

参数：`-Stage raw|cutout`、`-Root`、`-ListPath`、`-OutDir`、`-Only`、`-Priority`、`-Sheets`、`-Tolerance`（幕布色容差，默认 90）、`-BandPct`（边距检查比例，默认 6）。

**Linux / macOS**

```bash
python3 -m pip install pillow

# 全量检查
python3 check-assets.py --root raw

# 只查 P1，并输出接触表
python3 check-assets.py --root raw --priority 1 --sheets

# 只查指定几项
python3 check-assets.py --root raw --only bg-street-west,char-er

# 检查抠图成品
python3 check-assets.py --stage cutout --root cutouts
```

参数：`--stage raw|cutout`、`--root`、`--list`、`--out`、`--only`、`--priority`、`--sheets`、`--tolerance`、`--band-pct`。
两个脚本的判定阈值和返回码完全一致，用哪一个都行。

## 完全跑不了脚本时

只能做最低限度人工拦截，可靠性明显下降，不建议用于整批交付：

- **尺寸**：`file raw/*.png` 或 `identify raw/*.png`，必须与清单 `pixels` 一致。
- **幕布**：用系统看图工具打开，四角应是纯绿 `#00FF00` 或纯洋红 `#FF00FF`，且主体四周留白。
- **重复图**：`sha256sum raw/*`，出现相同哈希即为重复交付。
- **内容与风格**：只能逐张或拼图目检，至少每批抽 3 张原图，并检查是否有主角烤进背景、幌子上有字。

## 环境

- PowerShell 版：Windows PowerShell 5.1 或更高，依赖系统自带的 `System.Drawing`，不需要 Python、Node。
- Python 版：Python 3.8+ 和 Pillow（`pip install pillow`），Linux / macOS / Windows 均可。
