/**
 * AiExplainer — timeline data.
 *
 * Single source of truth for audio sync. `text` is copied verbatim from
 * public/ai-explainer/timetable.json (37 chunks, total 669.936s, voice
 * zh-CN-YunxiNeural, +5% rate, 0.25s gaps). Never rewrite the text.
 * All frame math derives from startSec/endSec at FPS=60.
 */

export const FPS = 60;
export const TOTAL_SECONDS = 669.936;
export const DURATION_FRAMES = Math.ceil(TOTAL_SECONDS * FPS); // 40197

export type TermKey =
  | "AI"
  | "Model"
  | "Token"
  | "Agent"
  | "Skill"
  | "MCP"
  | "Harness"
  | "INTRO"
  | "RECAP"
  | "CLOSING";

export const TERMS: TermKey[] = [
  "AI",
  "Model",
  "Token",
  "Agent",
  "Skill",
  "MCP",
  "Harness",
];

export const TERM_META: Record<
  TermKey,
  { en: string; cn: string; color: string }
> = {
  AI: { en: "AI", cn: "人工智能", color: "#CCFF00" },
  Model: { en: "Model", cn: "模型", color: "#00F0FF" },
  Token: { en: "Token", cn: "词元", color: "#FF0055" },
  Agent: { en: "Agent", cn: "智能体", color: "#FF8A00" },
  Skill: { en: "Skill", cn: "技能", color: "#8B5CFF" },
  MCP: { en: "MCP", cn: "连接协议", color: "#00E5A0" },
  Harness: { en: "Harness", cn: "运行环境", color: "#FFC800" },
  INTRO: { en: "INTRO", cn: "开场", color: "#FFFFFF" },
  RECAP: { en: "RECAP", cn: "复盘", color: "#CCFF00" },
  CLOSING: { en: "CLOSING", cn: "收尾", color: "#FFFFFF" },
};

export type SceneKind =
  | "terms"
  | "stack"
  | "year"
  | "define"
  | "phone"
  | "fail"
  | "scale"
  | "chef"
  | "token"
  | "glass"
  | "loop"
  | "steps"
  | "cookbook"
  | "socket"
  | "spaghetti"
  | "compare"
  | "closing";

export interface Segment {
  index: number;
  startSec: number;
  endSec: number;
  text: string;
  term: TermKey;
  year?: number;
  scene: SceneKind;
  headline: string;
  /** Scene-specific lines: facts for year, steps for steps, items for others. */
  lines?: string[];
  /** Left/right labels for scale scenes. */
  left?: string;
  right?: string;
}

export const SEGMENTS: Segment[] = [
  {
    index: 1,
    startSec: 0.0,
    endSec: 12.648,
    text: "最近刷短视频、看开源代码、用各种 AI 工具，你肯定反复撞到过这串英文词，AI、Model、Token、Agent、Skill、MCP、Harness。",
    term: "INTRO",
    scene: "terms",
    headline: "七个词，你肯定撞见过",
  },
  {
    index: 2,
    startSec: 12.898,
    endSec: 32.482,
    text: "它们听起来像一堆故弄玄虚的黑话，其实讲的是同一件事的不同层级，机器怎么理解、怎么思考、怎么行动、怎么接工具、怎么被约束。把这七个词按出生时间串起来，刚好是一部人类让机器从只会算账，变成替你干活的七十年破局史。",
    term: "INTRO",
    scene: "stack",
    headline: "同一件事，不同层级",
  },
  {
    index: 3,
    startSec: 32.732,
    endSec: 51.572,
    text: "故事的起点，当然是 AI，也就是人工智能。回到 1956 年夏天，那时候的计算机还只是用来算弹道、跑报表的大型电子算盘。年轻的计算机科学家约翰·麦卡锡，拉上香农、明斯基等一帮学者，在达特茅斯学院开了个会。",
    term: "AI",
    year: 1956,
    scene: "year",
    headline: "1956 · 达特茅斯之夏",
    lines: ["达特茅斯学院", "约翰·麦卡锡", "香农 · 明斯基", "Artificial Intelligence 一词诞生"],
  },
  {
    index: 4,
    startSec: 51.822,
    endSec: 70.926,
    text: "为了讨论怎么让机器像人一样思考，麦卡锡专门造出了 Artificial Intelligence 这个词。从那时候起，AI 就代表整个技术领域。只要让计算机完成过去需要人类智能才能干成的事，比如理解语言、识别图像、做决策，都算 AI。",
    term: "AI",
    scene: "define",
    headline: "AI，到底指什么",
    lines: ["理解语言", "识别图像", "做决策"],
  },
  {
    index: 5,
    startSec: 71.176,
    endSec: 88.168,
    text: "像平时你对着手机说一句导航回家，它听懂了目的地，规划路线，避开拥堵，这整件事都属于 AI。只不过到了今天，咱们日常口语里说的 AI，往往已经缩小到生成式 AI，特指能聊天、写代码、写文章的那一类。",
    term: "AI",
    scene: "phone",
    headline: "导航回家，就是 AI",
    lines: ["听懂目的地", "规划路线", "避开拥堵"],
  },
  {
    index: 6,
    startSec: 88.418,
    endSec: 104.81,
    text: "立下了 AI 这块大招牌，怎么让机器真正拥有一个会思考的脑子呢？这就有了 Model，也就是模型。早年科学家总想教电脑硬背人类的语法规则，结果面对真实世界的复杂语言全面翻车。",
    term: "Model",
    scene: "fail",
    headline: "硬背规则，全面翻车",
    lines: ["背语法规则", "背句法结构", "背例外清单"],
  },
  {
    index: 7,
    startSec: 105.06,
    endSec: 126.996,
    text: "直到 2017 年，Google Brain 团队提出了 Transformer 架构，紧接着 2018 到 2020 年，OpenAI 的苏茨克维等人推出了 GPT 系列，大家才发现，根本不用硬教语法，只要让模型根据已有文字，去预测接下来最可能出现的内容，当规模大到一定程度，它自己就能涌现出惊人的推理能力。",
    term: "Model",
    year: 2017,
    scene: "year",
    headline: "2017 · Transformer 来了",
    lines: ["Google Brain · Transformer", "2018–2020 · GPT 系列", "预测下一个词", "规模 → 涌现推理"],
  },
  {
    index: 8,
    startSec: 127.246,
    endSec: 146.974,
    text: "所以，模型就是 AI 系统里真正负责动脑推理的那部分。但它本身不会打开你的日历，也不会帮你点提交按钮，它只管接收输入，给出输出。打个比方，模型就像饭店后厨里的厨师。你说来一份清淡的，它决定做什么菜、怎么搭配。",
    term: "Model",
    scene: "chef",
    headline: "模型，只管动脑",
    lines: ["决定做什么菜", "决定怎么搭配"],
  },
  {
    index: 9,
    startSec: 147.224,
    endSec: 167.624,
    text: "但厨师不会自己去市场买菜，也不会替你结账，那是外面整套软件流程的事。很多产品看起来很能干，核心都是模型，外加一整套围绕它运转的软件。不过，这位厨师大脑在干活的时候，并不能一口吞下一整段中文或英文，它得先把文本切成 Token。",
    term: "Model",
    scene: "chef",
    headline: "厨师不买菜、不结账",
    lines: ["去市场买菜", "替你结账", "打开你的日历"],
  },
  {
    index: 10,
    startSec: 167.874,
    endSec: 186.042,
    text: "Token 这个词最早来自上世纪五十年代的编译器，但今天大模型用的这套切词机制，是在 2015 年底，由爱丁堡大学的里科·森里奇团队引入自然语言处理的，后来被 Google 和 OpenAI 定成了行业标配。当年为什么要发明这套切法？",
    term: "Token",
    year: 2015,
    scene: "year",
    headline: "2015 · 切词机制定型",
    lines: ["爱丁堡大学 · Sennrich 团队", "子词切分机制", "Google / OpenAI 定为标配"],
  },
  {
    index: 11,
    startSec: 186.292,
    endSec: 204.028,
    text: "因为如果按完整单词切，词表动不动几百万，遇到生僻词模型直接傻眼；如果按单个字母切，文本序列又被拉得太长，算力直接爆炸。于是研究者折中了一下，把 Token 作为模型处理文本的基本单位。",
    term: "Token",
    scene: "scale",
    headline: "整词切 vs 字母切",
    left: "按完整单词切",
    right: "按单个字母切",
    lines: ["词表几百万 · 生僻词傻眼", "序列太长 · 算力爆炸"],
  },
  {
    index: 12,
    startSec: 204.278,
    endSec: 225.35,
    text: "一个英文单词可能是一两个 Token，一个汉字也可能对应一个或多个 Token，具体怎么切，取决于模型的分词方式。你可以把它想成快递装箱。一篇长文章不是整箱硬塞进去，而是先拆成小件，一件一件装。箱子有容量上限，装得越多，运费越高。",
    term: "Token",
    scene: "token",
    headline: "快递装箱：Token",
    lines: ["预测", "接下来", "最可能", "出现", "的", "内容"],
  },
  {
    index: 13,
    startSec: 225.6,
    endSec: 244.824,
    text: "你常听到的上下文窗口，比如能记住多长的对话，通常就是用 Token 数来衡量的。很多产品按 Token 计费，也是因为模型的计算量大致和 Token 规模相关。简单说，模型决定能想什么，Token 决定一次能装进多少内容、大概要花多少钱。",
    term: "Token",
    scene: "scale",
    headline: "想什么，装多少，花多少",
    left: "上下文窗口",
    right: "按 Token 计费",
    lines: ["模型决定能想什么", "Token 决定一次装多少"],
  },
  {
    index: 14,
    startSec: 245.074,
    endSec: 266.098,
    text: "对话越长、材料越多，占用的 Token 就越多，一旦超了上限，早期内容就可能被压缩、摘要，甚至直接丢掉。脑子有了，装材料的盒子也有了，可这时候的 AI 还是像关在玻璃缸里的大脑，光会动嘴给建议，不会动手干实事。怎么让它真正自动办事？",
    term: "Agent",
    scene: "glass",
    headline: "玻璃缸里的大脑",
    lines: ["给你建议", "帮你分析", "替你写方案"],
  },
  {
    index: 15,
    startSec: 266.348,
    endSec: 277.076,
    text: "这就轮到 Agent，也就是智能体出场了。其实早在 1995 年，AI 学者拉塞尔和诺维格就在经典教材里给 Agent 下了定义。",
    term: "Agent",
    year: 1995,
    scene: "year",
    headline: "1995 · Agent 有了定义",
    lines: ["Russell & Norvig", "经典教材《人工智能》", "Agent 的正式定义"],
  },
  {
    index: 16,
    startSec: 277.326,
    endSec: 293.07,
    text: "但真正引爆今天大模型 Agent 浪潮的，是 2022 年底普林斯顿大学的姚顺雨团队提出的 ReAct 框架，以及 2023 年春天爆火的开源项目 AutoGPT，还有前 OpenAI 研究员翁荔总结的智能体架构。",
    term: "Agent",
    year: 2022,
    scene: "year",
    headline: "2022 · ReAct 引爆浪潮",
    lines: ["2022 · ReAct 框架 · 姚顺雨", "2023 · AutoGPT 爆火", "翁荔 · 智能体架构"],
  },
  {
    index: 17,
    startSec: 293.32,
    endSec: 311.464,
    text: "他们把模型和外围软件拼在了一起，让系统能接下目标、拆解步骤、调用工具，并根据反馈继续往下推进。也就是让模型负责判断下一步做什么，外面的软件负责把判断变成真实动作。放进生活里看特别直观。",
    term: "Agent",
    scene: "loop",
    headline: "目标—拆解—工具—反馈",
    lines: ["思考 · 判断下一步", "行动 · 软件执行", "观察 · 结果反馈"],
  },
  {
    index: 18,
    startSec: 311.714,
    endSec: 326.546,
    text: "你跟助手说帮我订周五晚上的餐厅，它会去查空位、比较距离、选一家合适的、填好信息，等你确认后再提交。这不是一次性回答附近有哪些店，而是顺着目标一步步做下去。",
    term: "Agent",
    scene: "steps",
    headline: "订一家周五的餐厅",
    lines: ["查空位", "比较距离", "选一家合适的", "填好信息", "确认后提交"],
  },
  {
    index: 19,
    startSec: 326.796,
    endSec: 347.94,
    text: "查网页、读文件、跑命令、写代码，都不是模型自己伸手去做，而是它发出请求，由系统去执行，再把结果送回来。这样一问、一做、一观察，循环下去，才像在干活，而不只是在回答。智能体会干活了，但新烦恼也跟着来了。",
    term: "Agent",
    scene: "loop",
    headline: "一问、一做、一观察",
    lines: ["查网页", "读文件", "跑命令", "写代码"],
  },
  {
    index: 20,
    startSec: 348.19,
    endSec: 362.926,
    text: "如果每次干活都靠它临场发挥，不仅容易翻车，而且人在用 Cursor、Claude Code 这类工具时，每次开新对话都得把几千字的工作规范重新发一遍，既浪费 Token，又分散模型注意力。",
    term: "Skill",
    scene: "scale",
    headline: "几千字规范，重发一遍",
    left: "每次开新对话",
    right: "几千字规范重发",
    lines: ["浪费 Token", "分散模型注意力"],
  },
  {
    index: 21,
    startSec: 363.176,
    endSec: 379.472,
    text: "为了解决这个痛点，2025 年 10 月，Claude 背后的母公司 Anthropic 正式推出了 Skill，也就是技能的概念，并在年底把它做成了跨平台的开放标准。Skill 不是给模型多装一块硬件，而是一份可复用的做事说明书。",
    term: "Skill",
    year: 2025,
    scene: "year",
    headline: "2025 · Skill 诞生",
    lines: ["Anthropic · 2025 年 10 月", "年底成为跨平台开放标准", "可复用的做事说明书"],
  },
  {
    index: 22,
    startSec: 379.722,
    endSec: 400.77,
    text: "在工具里，Skill 通常是一个文件夹，核心是一份叫 SKILL.md 的文档，里面写清楚什么时候用、按什么步骤做，有时还附带脚本、模板和参考资料。它就像家里的菜谱。做红烧肉时，不用每次重新琢磨放多少糖、煮多久，翻开菜谱按步骤来就行。",
    term: "Skill",
    scene: "cookbook",
    headline: "SKILL.md，就是菜谱",
    lines: ["什么时候用", "按什么步骤做", "脚本 · 模板 · 参考资料"],
  },
  {
    index: 23,
    startSec: 401.02,
    endSec: 419.86,
    text: "遇到相关任务时，Agent 可以自动加载，你也可以主动点名调用。这和随口说一句提示词完全不同。提示词用完就散了，像临时口头交代；而 Skill 可以保存、分享、做版本管理，让同一种工作流反复稳定地跑出来。",
    term: "Skill",
    scene: "cookbook",
    headline: "提示词用完就散",
    lines: ["保存", "分享", "版本管理", "反复稳定跑出来"],
  },
  {
    index: 24,
    startSec: 420.11,
    endSec: 437.342,
    text: "不过它教的是怎么做，并不等于自动获得了新权限。菜谱写得再好，如果手伸不到外面的软件里，照样做不出菜。早些年，每家 AI 助手想连一个新工具，都得单独写一套对接代码，整个行业被折腾得苦不堪言。",
    term: "MCP",
    scene: "spaghetti",
    headline: "每家一套对接代码",
    lines: ["助手 A · 写一套对接", "助手 B · 再写一套", "助手 C · 又写一套"],
  },
  {
    index: 25,
    startSec: 437.592,
    endSec: 454.08,
    text: "为了终结这种混乱，2024 年 11 月，Anthropic 的两位工程师大卫和贾斯汀带头开源了一套标准协议，叫 MCP，全称 Model Context Protocol，专门用来让 AI 应用连接外部数据、工具和服务。",
    term: "MCP",
    year: 2024,
    scene: "year",
    headline: "2024 · MCP 开源",
    lines: ["Anthropic · David & Justin", "Model Context Protocol", "连接外部数据 · 工具 · 服务"],
  },
  {
    index: 26,
    startSec: 454.33,
    endSec: 476.698,
    text: "官方常把 MCP 比作 AI 应用的 USB-C 接口。两边都按同一套规范对接，就不用每个助手都为每个工具单独写接口了。生活里可以把它想成统一插座，以前每种电器插头都不一样，处处要转接头；有了统一标准，同一套接口就能接台灯、插充电器、连风扇。",
    term: "MCP",
    scene: "socket",
    headline: "AI 的 USB-C 接口",
    lines: ["台灯", "充电器", "风扇"],
  },
  {
    index: 27,
    startSec: 476.948,
    endSec: 492.932,
    text: "通过 MCP，应用就能顺畅地读取资料、调用工具、执行动作。但它不是插件商店，也不是技能包本身。MCP 解决的是连得上、说得通；Skill 解决的是连上以后按什么流程做。",
    term: "MCP",
    scene: "socket",
    headline: "连得上，也要按流程做",
    lines: ["MCP · 连得上、说得通", "Skill · 按什么流程做"],
  },
  {
    index: 28,
    startSec: 493.182,
    endSec: 515.382,
    text: "实战里两者往往搭档干活，一边用 MCP 接上邮箱、日历、代码仓库，一边用 Skill 规定查询顺序、输出格式和注意事项。现在脑子、菜谱、插座全齐了，可要是直接放任模型去调工具，一旦遇到报错死循环，或者误删文件、乱扣费，场面根本收不住。",
    term: "Harness",
    scene: "spaghetti",
    headline: "没有刹车，收不住",
    lines: ["报错死循环", "误删文件", "乱扣费"],
  },
  {
    index: 29,
    startSec: 515.632,
    endSec: 532.144,
    text: "所以在 2025 到 2026 年的工程讨论里，Anthropic 工程团队和 LangChain 创始人哈里森·蔡斯等人，都在反复强调一个词，叫 Harness。这个词本义是马具和安全带，在技术圈有两层常见用法。",
    term: "Harness",
    year: 2025,
    scene: "year",
    headline: "2025–2026 · Harness",
    lines: ["Anthropic 工程团队", "LangChain · Harrison Chase", "agent harness 成为共识"],
  },
  {
    index: 30,
    startSec: 532.394,
    endSec: 546.842,
    text: "早年在软件工程里叫 evaluation harness，用来批量跑测试、打分、汇总结果。而今天讨论 Agent 时常说的，叫 agent harness，指的是包在模型外面的那层运行环境。",
    term: "Harness",
    scene: "define",
    headline: "两种 Harness",
    lines: ["evaluation harness · 批量跑测试打分", "agent harness · 运行与约束环境"],
  },
  {
    index: 31,
    startSec: 547.092,
    endSec: 568.668,
    text: "它专门负责把对话和材料组织进上下文，执行工具调用，管理权限和限额，处理失败重试，并在关键动作前及时踩刹车，停下来等人确认。你可以把 Harness 想成厨房里的操作台和安全规程。厨师说去拿盐，真正跑腿去拿的是按规矩办事的系统；",
    term: "Harness",
    scene: "steps",
    headline: "Harness 的五件工作",
    lines: ["组织上下文", "执行工具调用", "管理权限与限额", "失败重试", "关键动作前踩刹车"],
  },
  {
    index: 32,
    startSec: 568.918,
    endSec: 589.054,
    text: "一旦要动刀、开火、付钱，就得先过权限和确认这一关。模型提出去查日历，Harness 先检查有没有权限，再去执行查询，把结果送回模型。没有这层架子，模型只是会说话；有了它，才变成能安全、持续推进任务的 Agent。",
    term: "Harness",
    scene: "steps",
    headline: "动刀、开火、付钱，先过关",
    lines: ["厨师：去拿盐", "系统：按规矩跑腿", "动刀 / 开火 / 付钱", "先过权限与确认"],
  },
  {
    index: 33,
    startSec: 589.304,
    endSec: 611.168,
    text: "这也是为什么 Anthropic 等团队一直强调，评测一个 Agent，评的是模型加 Harness，而不只是模型本身。哪怕用同一个模型，换一套工具、权限和循环规则，表现出来的能力可能天差地别。回头看这七十年的拼图，你会发现每一步都严丝合缝。",
    term: "Harness",
    scene: "compare",
    headline: "评的是模型 + Harness",
    lines: ["只看模型", "模型 + Harness"],
  },
  {
    index: 34,
    startSec: 611.418,
    endSec: 626.49,
    text: "AI 是 1956 年立下的整个领域，像整栋智能大厦；Model 是 2017 年后爆发的推理核心，像会做判断的厨师；Token 是 2015 年定型的计量单位，决定一次能装多少材料、花多少钱；",
    term: "RECAP",
    scene: "stack",
    headline: "拼图拼上了：AI / Model / Token",
  },
  {
    index: 35,
    startSec: 626.74,
    endSec: 644.644,
    text: "Agent 是 1995 年定义、2022 年底重获新生的办事系统，像能规划并调用工具完成目标的助手；MCP 是 2024 年底开源的连接协议，像统一插座；Skill 是 2025 年推出的可复用做事方法，像标准菜谱；",
    term: "RECAP",
    scene: "stack",
    headline: "拼图拼上了：Agent / MCP / Skill",
  },
  {
    index: 36,
    startSec: 644.894,
    endSec: 656.606,
    text: "Harness 是 2025 到 2026 年普及的运行与约束环境，像操作台和安全规程。下次再看到这些词，不必把它们当成互不相干的时髦标签。",
    term: "RECAP",
    scene: "stack",
    headline: "最后一块：Harness",
  },
  {
    index: 37,
    startSec: 656.856,
    endSec: 669.936,
    text: "它们描述的其实是同一套系统从上到下的完整结构，谁在想，一次能装多少，谁在做，怎么做得更稳，连什么，以及整件事如何被安全地跑起来。",
    term: "CLOSING",
    scene: "closing",
    headline: "同一套系统，从上到下",
    lines: ["谁在想", "一次能装多少", "谁在做", "怎么做得更稳", "连什么", "如何安全地跑起来"],
  },
];

/** Frame helpers — all derived from seconds at FPS. */
export const startFrame = (seg: Segment): number =>
  Math.round(seg.startSec * FPS);
export const endFrame = (seg: Segment): number =>
  Math.round(seg.endSec * FPS);
export const segmentFrames = (seg: Segment): number =>
  endFrame(seg) - startFrame(seg);

/** Find the segment active at a given absolute frame (null inside 0.25s gaps). */
export const segmentAtFrame = (frame: number): Segment | null => {
  for (const seg of SEGMENTS) {
    if (frame >= startFrame(seg) && frame < endFrame(seg)) {
      return seg;
    }
  }
  return null;
};

/** First-appearance frame of each of the seven terms (chapter markers). */
export const CHAPTERS: { term: TermKey; fromFrame: number }[] = TERMS.map(
  (term) => {
    const first = SEGMENTS.find((s) => s.term === term);
    return { term, fromFrame: first ? startFrame(first) : 0 };
  },
);
