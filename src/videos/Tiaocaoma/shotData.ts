import { A, H, P, Q, S, type Shot } from "./shots";
import { SEQS, SUPP_PART } from "./rig";

/** Shared, immutable set dressings. */
const MANGER = P("prop-manger-00", 960, 818, 1240);
const POST = P("prop-post-rope-00", 260, 790, 260);
const FINE = P("prop-fodder-00", 1430, 742, 210);
const GREEN = P("prop-fodder-02", 960, 742, 205);
const DRY = P("prop-fodder-01", 470, 742, 210);
const WINE = P("prop-wine-peanuts-00", 660, 690, 170);
const PEANUTS = P("prop-wine-peanuts-02", 900, 700, 220);
const CUP = P("prop-wine-peanuts-03", 1080, 690, 130);
const STICK = P("prop-stick-sword-arm-02", 1300, 600, 300, { rot: -18 });
const SIGN = P("prop-sign-00", 280, 430, 300);

/** Each speaking character gets their own backdrop, so 20+ close-ups do not read as the same shot. */
const PORTRAIT_BG: Record<"scar" | "waiter" | "zhao" | "firstlord", string> = {
  scar: "bg-street",
  waiter: "bg-stable-day",
  zhao: "bg-inn",
  firstlord: "bg-stable-dusk",
};

const portrait = (who: "scar" | "waiter" | "zhao" | "firstlord", x: number, scale: number,
                  expr: number, grade: Shot["grade"] = "day"): Shot => {
  const backdrop = grade === "dramatic" ? "bg-stable-dusk" : PORTRAIT_BG[who];
  const shift = (scale % 5) * 3;
  return S("portrait", backdrop,
    [A(who, x, 1120, scale, { expr, pose: "stand" })], [], ["spotlight"], {
      grade, headline: undefined,
      camera: {
        from: 1.04 + (scale % 4) * 0.01,
        to: 1.12,
        panX: who === "scar" ? -24 - shift : 18 + shift,
        panY: who === "zhao" ? -10 : 0,
      },
    });
};

/** 54 hand-directed shots. Keyed by voice-track id. */
export const SHOTS: Record<number, Shot> = {
  // ── 壹 · 西馆新规 ──────────────────────────────────────────────
  1: S("title", "bg-street", [], [SIGN], ["clouds", "dust", "petals"], {
    headline: "跳槽马", subline: "作者 · 赵连凤", caption: "none",
    camera: { from: 1.0, to: 1.1, panX: 40, panY: 0 },
    sequences: [
      Q([SUPP_PART.menuBoard], 340, 660, 180),
      Q([SUPP_PART.dishFish], 1660, 780, 250),
      Q([SUPP_PART.carriage], 1180, 810, 300, { z: 16 }),
    ],
  }, [H("herd0", 1500, 800, 360)]),
  2: S("rank", "bg-stable-day", [], [MANGER, FINE, GREEN, DRY], ["ink", "dust"], {
    headline: "东贵 · 西贱", subline: "官阶 · 草料 · 马槽",
    beats: [0, 90, 300, 720, 1300],
    camera: { from: 1.0, to: 1.08, panX: 0, panY: -20 },
    sequences: [Q([SUPP_PART.rankPlate], 1620, 300, 170, { z: 34 })],
  }),
  3: S("stage", "bg-stable-day", [A("waiter", 1410, 930, 280, { pose: "point" })],
    [MANGER, STICK, FINE, GREEN, DRY], ["dust", "shake", "speedlines"], {
      sequences: [
        Q(SEQS.headsDown, 700, 690, 230, { hold: 16 }),
        Q(SEQS.headsDown, 1150, 690, 220, { hold: 16, delay: 8 }),
      ],
    }, [
      H("herd0", 480, 850, 430), H("herd1", 820, 850, 410), H("herd2", 1120, 850, 420)]),
  4: portrait("waiter", 1020, 620, 1),
  5: S("stage", "bg-stable-day", [], [MANGER, FINE, GREEN, DRY], ["clouds", "dust"], {
    sequences: [Q(SEQS.headsDown, 960, 700, 250, { hold: 20 })],
  },
    [H("herd0", 500, 850, 400, { headDown: true }), H("herd1", 960, 850, 400, { headDown: true }),
     H("herd2", 1400, 850, 400, { headDown: true })]),
  // ── 贰 · 瘸马东槽 ──────────────────────────────────────────────
  6: S("stage", "bg-street", [A("waiter", 1560, 930, 270, { flip: true })],
    [SIGN], ["dust", "speedlines"], {
      camera: { from: 1.16, to: 1.02, panX: -70, panY: 0 },
      sequences: [Q(SEQS.ride, 900, 780, 620, { hold: 12, moveTo: 1180, moveDur: 1500 })],
    }),
  7: portrait("waiter", 1000, 600, 0),
  8: portrait("scar", 940, 620, 0),
  9: S("stage", "bg-street", [A("waiter", 1250, 940, 330, { pose: "laugh", flip: true }),
    A("scar", 650, 940, 310)], [SIGN], ["dust"], {
      sequences: [Q([SUPP_PART.profileScar], 340, 620, 200)],
    }),
  10: portrait("waiter", 1000, 640, 1),
  11: S("stage", "bg-stable-day", [A("waiter", 1580, 940, 270, { flip: true, pose: "panic" }),
    A("zhao", 1720, 950, 280, { flip: true, enter: "right" })], [MANGER, DRY, FINE],
    ["sun", "clouds", "dust"], { grade: "dusk", beats: [0, 600, 1200] },
    [H("white", 420, 860, 560, { gait: 1, moveTo: 1280, moveDur: 900 })]),
  12: portrait("zhao", 980, 660, 0),
  13: portrait("waiter", 1000, 620, 0),
  14: S("stage", "bg-stable-day", [A("zhao", 620, 950, 320),
    A("waiter", 1350, 940, 280, { flip: true, pose: "bow" })], [MANGER], ["clouds"], {
      sequences: [Q([SUPP_PART.emoSmile], 1450, 590, 200)],
    }),
  15: portrait("zhao", 980, 640, 0),
  16: S("stage", "bg-stable-day", [A("waiter", 1400, 940, 300, { flip: true, moveTo: 900, moveDur: 400 })],
    [MANGER], ["dust"], {}, [H("white", 560, 860, 580)]),
  17: portrait("waiter", 1020, 660, 0),
  18: S("stage", "bg-stable-day", [], [MANGER, FINE], ["dust"], {
    camera: { from: 1.14, to: 1.2, panX: -60, panY: 0 },
    sequences: [Q(SEQS.chew, 1520, 360, 280, { hold: 14, z: 26, badge: true })],
  }, [H("white", 900, 900, 700, { headDown: false })]),
  // ── 叁 · 再犯官府 ──────────────────────────────────────────────
  19: S("montage", "bg-street", [], [SIGN],
    ["petals", "speedlines"], {
      headline: "一连几天", beats: [0, 180, 360],
      sequences: [
        Q(SEQS.ride, 330, 640, 360, { hold: 10, z: 34 }),
        Q([SUPP_PART.calendar], 1640, 640, 200, { z: 34 }),
      ],
    }),
  20: S("stage", "bg-stable-day", [A("waiter", 1400, 940, 310, { pose: "think", flip: true })],
    [MANGER], ["dust"], { caption: "bubble" }, [H("white", 620, 860, 560, { gait: 1 })]),
  21: S("stage", "bg-inn", [A("scar", 1250, 950, 300, { flip: true }),
    A("waiter", 420, 940, 270, { pose: "point" })], [WINE, PEANUTS, CUP], ["dust"], {
    grade: "inn", beats: [0, 900, 1700],
    sequences: [
      Q([SUPP_PART.countingHand], 900, 690, 250, { z: 24 }),
      Q([SUPP_PART.abacus], 1580, 720, 210, { z: 24 }),
      Q([SUPP_PART.ledger], 1760, 740, 160, { z: 24 }),
    ],
  }),
  22: S("stage", "bg-stable-day", [A("firstlord", 1640, 960, 320, { flip: true, enter: "right" }),
    A("waiter", 1450, 940, 260, { flip: true, pose: "panic" })], [MANGER,
    P(SUPP_PART.wornPost, 300, 780, 200),
    P("prop-post-rope-03", 420, 700, 180)], ["tear", "speedlines", "shake"], {
    grade: "dusk", beats: [0, 700, 1400],
    sequences: [
      Q([SUPP_PART.ropeKnot], 480, 700, 220, { delay: 120 }),
      Q([SUPP_PART.bell], 660, 620, 150, { delay: 200 }),
      Q([SUPP_PART.emoGreen], 1450, 560, 210, { delay: 500, z: 26 }),
    ],
  }, [H("white", 420, 860, 540, { moveTo: 1200, moveDur: 700 })]),
  23: portrait("firstlord", 960, 700, 0, "dusk"),
  24: S("impact", "bg-stable-day", [],
    [], ["shake", "flash", "dust"], {
      grade: "dusk", headline: "扑通",
      sequences: [Q(SEQS.kneel, 1000, 660, 520, { hold: 13, z: 24 })],
    }),
  25: portrait("waiter", 1000, 640, 0, "dusk"),
  26: portrait("firstlord", 980, 680, 1, "dusk"),
  27: S("stage", "bg-stable-day", [A("firstlord", 1580, 960, 330, { flip: true })],
    [MANGER], ["dust"], {
      grade: "dusk",
      sequences: [Q(SEQS.kneel, 980, 800, 420, { hold: 11, z: 24 })],
    }),
  28: S("stage", "bg-stable-day", [A("firstlord", 1700, 950, 320, { flip: true, moveTo: 2050, moveDur: 500 }),
    A("waiter", 700, 940, 300, { flip: true })], [MANGER], ["clouds"], { grade: "dusk" }),
  // ── 肆 · 交涉碰壁 ──────────────────────────────────────────────
  29: portrait("waiter", 1020, 620, 2, "inn"),
  30: portrait("scar", 960, 640, 0, "inn"),
  31: portrait("waiter", 1020, 620, 1, "inn"),
  32: S("impact", "bg-inn", [A("scar", 960, 1080, 660, { expr: 2 })], [],
    ["speedlines", "shake", "ink"], { grade: "inn", headline: "一派胡言！" }),
  33: S("montage", "bg-inn", [A("waiter", 1500, 950, 300, { pose: "bow", flip: true })],
    [P("prop-wine-peanuts-02", 520, 720, 240)], ["petals"],
    { headline: "赛赤兔？", subline: "一步三晃 · 比乌龟快不了多少", beats: [0, 300, 560],
      sequences: [Q([SUPP_PART.profileHorse], 1640, 640, 240, { z: 34 })] }),
  34: portrait("waiter", 1000, 620, 1, "inn"),
  35: portrait("scar", 960, 640, 0, "inn"),
  36: S("stage", "bg-inn", [A("waiter", 1350, 940, 300, { flip: true, expr: 1 }),
    A("scar", 620, 940, 310)], [WINE, PEANUTS], ["dust"], {
      grade: "inn",
      sequences: [Q([SUPP_PART.profileScarClosed], 300, 600, 200)],
    }),
  37: S("stage", "bg-inn", [A("waiter", 980, 960, 340, { pose: "think" })], [PEANUTS],
    ["ink"], { caption: "bubble", grade: "inn" }),
  // ── 伍 · 百马畏威 ──────────────────────────────────────────────
  38: S("stage", "bg-stable-day", [],
    [MANGER, POST, P("prop-post-rope-03", 430, 700, 190),
      P("prop-post-rope-02", 560, 760, 200), DRY], ["dust", "wind"],
    {
      beats: [0, 700, 1400],
      sequences: [
        Q([SUPP_PART.boyGlare, SUPP_PART.boyNervous], 1560, 600, 220, { hold: 130, z: 24 }),
        Q([SUPP_PART.boyCrouch], 1560, 830, 230, { z: 24 }),
      ],
    }, [H("white", 500, 860, 560)]),
  39: S("stage", "bg-inn", [A("waiter", 980, 960, 340, { pose: "think" })], [WINE, PEANUTS],
    ["ink"], {
      caption: "bubble", grade: "inn",
      sequences: [Q([SUPP_PART.abacus], 1520, 720, 220)],
    }),
  40: S("stage", "bg-stable-dusk", [], [MANGER, FINE, GREEN, DRY], ["wind", "clouds"], {
    grade: "dusk", beats: [0, 500, 1000],
    sequences: [
      Q(SEQS.headsUp, 700, 690, 230, { hold: 22 }),
      Q(SEQS.headsUp, 1250, 690, 230, { hold: 22, delay: 11 }),
    ],
  }, [H("herd0", 480, 850, 420), H("herd1", 960, 850, 410), H("herd2", 1430, 850, 420),
      H("white", 960, 880, 620)]),
  41: portrait("waiter", 1020, 640, 1, "dusk"),
  42: S("montage", "bg-stable-night", [A("zhao", 1500, 950, 300, { flip: true, pose: "point" }),
    A("waiter", 600, 940, 280, { pose: "bow" })], [MANGER, DRY], ["wind", "ink"], {
    grade: "dusk", headline: "马无夜草不肥", beats: [0, 700, 1400, 2100],
    sequences: [
      Q(SEQS.thin, 320, 660, 360, { hold: 240, z: 34 }),
      Q([SUPP_PART.calendar], 330, 840, 170, { z: 34 }),
      Q([SUPP_PART.nightFodder], 1650, 640, 190, { z: 34 }),
      Q([SUPP_PART.grainScoop], 1660, 790, 160, { z: 34 }),
      Q([SUPP_PART.officialsGroup], 1620, 470, 360, { z: 34 }),
    ],
  }, [H("herd0", 900, 850, 390), H("herd1", 1250, 850, 380)]),
  // ── 陆 · 马王悲歌 ──────────────────────────────────────────────
  43: S("impact", "bg-stable-dusk", [A("zhao", 960, 1080, 660, { expr: 2 })], [],
    ["speedlines", "shake", "ink"], {
      grade: "dramatic", headline: "你该当何罪？",
      sequences: [Q([SUPP_PART.officialsGroup], 300, 800, 400, { z: 30 })],
    }),
  44: portrait("scar", 960, 660, 0, "dramatic"),
  45: portrait("scar", 960, 660, 0, "dramatic"),
  46: S("impact", "bg-stable-dusk", [A("scar", 760, 1010, 520, { expr: 2 })],
    [], ["flash", "shake", "speedlines", "ink"], {
      grade: "dramatic", headline: "喀嚓", beats: [0, 240, 420, 720],
      sequences: [
        Q(SEQS.slash, 1520, 720, 480, {
          hold: 110, loop: false, delay: 100, life: 430, z: 24,
        }),
        Q([SUPP_PART.swordGlow], 1180, 500, 520, {
          delay: 330, life: 220, z: 30, spin: 0.05,
        }),
        Q(SEQS.woodenArm, 1060, 640, 220, {
          hold: 16, loop: false, delay: 420, life: 200,
          moveTo: 1420, moveDur: 110, spin: 1.2, z: 34,
        }),
        Q(SEQS.chips, 1220, 720, 150, { hold: 8, delay: 430, life: 150, z: 34 }),
      ],
    }),
  47: portrait("waiter", 1000, 640, 3, "dramatic"),
  48: S("impact", "bg-stable-dusk", [A("zhao", 960, 1080, 700, { expr: 1 })], [],
    ["flash", "shake", "ink"], { grade: "dramatic", headline: "你到底是谁？" }),
  49: S("flashback", "bg-battle-day", [],
    [P(SUPP_PART.armyTent, 260, 760, 240),
      P(SUPP_PART.poisonArrow, 1650, 420, 220, { rot: -24, delay: 600 }),
      P(SUPP_PART.generalSpear, 1740, 640, 190, { rot: -28 })],
    ["dust", "speedlines", "ink", "petals"], {
      grade: "sepia", headline: "兔死狗烹 · 鸟尽弓藏",
      subline: "十几年前 · 常胜将军", beats: [0, 500, 1000],
      sequences: [Q([SUPP_PART.emoLaugh], 1350, 470, 230, {
        delay: 800, life: 520, z: 34,
      })],
    }),
  50: portrait("zhao", 980, 660, 1, "dramatic"),
  51: portrait("zhao", 980, 660, 1, "dramatic"),
  52: S("flashback", "bg-battle-dusk", [],
    [P(SUPP_PART.armyTent, 300, 720, 280),
      P(SUPP_PART.poisonHook, 1680, 430, 220, { rot: 20 })],
    ["sun", "speedlines", "petals", "ink"], {
      grade: "sepia", headline: "马 王", subline: "日行千里 · 夜行八百",
      beats: [0, 600, 1200, 1800],
      sequences: [Q([SUPP_PART.emoLaugh], 1400, 460, 220, {
        delay: 900, life: 600, z: 34,
      })],
    }),
  53: S("stage", "bg-stable-dusk", [A("scar", 1380, 960, 360, { flip: true })], [],
    ["wind", "clouds"], {
      grade: "dramatic", camera: { from: 1.08, to: 1.02, panX: 20, panY: 0 },
      sequences: [Q([SUPP_PART.profileHorseClosed], 820, 560, 250, { z: 24 })],
    },
    [H("white", 820, 880, 680)]),
  54: S("ending", "bg-stable-dusk", [], [], ["petals", "wind"], {
    headline: "人不如马", subline: "跳槽马 · 全剧终", caption: "seal",
    grade: "dramatic", camera: { from: 1.0, to: 1.06, panX: 0, panY: 0 },
  }),
};
