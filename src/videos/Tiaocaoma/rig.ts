import { PARTS, type PartInfo } from "./data/parts";

/** Semantic rig map: every cut-out part has a role in the paper puppet. */
export type CharKey = "scar" | "waiter" | "zhao" | "firstlord" | "boy";
export type HorseKey = "white" | "red" | "black" | "king" | "herd0" | "herd1" | "herd2";

export interface MouthFit {
  /** width relative to head width */
  w: number;
  /** top offset relative to head height */
  top: number;
  /** fraction of the head hidden below the paper splice */
  cut: number;
  /** horizontal nudge relative to head width */
  dx: number;
}

export interface Rig {
  head: string;
  torso: string;
  armL: string;
  armR: string;
  legL?: string;
  legR?: string;
  extra?: string[];
  /** head width / body width ratio, tuned per costume */
  body: number;
  mouth: MouthFit;
  /** expression head alternatives, ordered by intensity */
  expr?: string[];
}

export const RIG: Record<CharKey, Rig> = {
  scar: {
    head: "char-scar-02",
    torso: "char-scar-03",
    armL: "char-scar-00",
    armR: "char-scar-00", // keep the prosthetic hidden under the sleeve until the reveal
    legL: "char-scar-05",
    legR: "char-scar-04",
    body: 1.38,
    mouth: { w: 0.88, top: 0.52, cut: 0.48, dx: 0 },
    expr: ["expr-waiter-scar-05", "expr-waiter-scar-04", "expr-waiter-scar-06"],
  },
  waiter: {
    head: "char-waiter-00",
    torso: "char-waiter-02",
    armL: "char-waiter-05",
    armR: "char-waiter-06",
    legL: "char-waiter-04",
    legR: "char-waiter-03",
    extra: ["char-waiter-01"], // shoulder towel
    body: 1.34,
    mouth: { w: 0.70, top: 0.60, cut: 0.40, dx: 0 },
    expr: ["expr-waiter-scar-02", "expr-waiter-scar-01", "expr-waiter-scar-00", "expr-waiter-scar-03"],
  },
  zhao: {
    head: "char-zhao-00",
    torso: "char-zhao-01",
    armL: "char-zhao-03",
    armR: "char-zhao-02",
    legL: "char-zhao-05",
    legR: "char-zhao-04",
    extra: ["char-zhao-06"], // sword
    body: 1.42,
    mouth: { w: 0.58, top: 0.56, cut: 0.44, dx: 0 },
    expr: ["expr-zhao-lord-00", "expr-zhao-lord-01", "expr-zhao-lord-02"],
  },
  firstlord: {
    head: "char-firstlord-00",
    torso: "char-firstlord-01",
    armL: "char-firstlord-03",
    armR: "char-firstlord-02",
    legL: "char-firstlord-05",
    legR: "char-firstlord-04",
    body: 1.46,
    mouth: { w: 0.62, top: 0.50, cut: 0.50, dx: 0 },
    expr: ["expr-zhao-lord-03", "expr-zhao-lord-05", "expr-zhao-lord-04"],
  },
  boy: {
    head: "char-boy-01",
    torso: "char-boy-00",
    armL: "char-boy-02",
    armR: "char-boy-03",
    legL: "char-boy-05",
    legR: "char-boy-04",
    extra: ["char-boy-06"], // wooden stick
    body: 1.16,
    mouth: { w: 0.74, top: 0.50, cut: 0.55, dx: 0 },
  },
};

export interface HorseRig {
  head: string;
  body: string;
  tail: string;
  legs: [string, string, string, string];
  bell?: string;
}

export const HORSE: Record<HorseKey, HorseRig> = {
  white: {
    head: "char-horse-white-00",
    body: "char-horse-white-02",
    tail: "char-horse-white-01",
    legs: ["char-horse-white-03", "char-horse-white-04", "char-horse-white-05", "char-horse-white-06"],
    bell: "supp-bell-00", // dedicated copper bell — no hollow cut-out in the rope loop
  },
  red: {
    head: "char-horse-red-00",
    body: "char-horse-red-01",
    tail: "char-horse-red-06",
    legs: ["char-horse-red-02", "char-horse-red-03", "char-horse-red-04", "char-horse-red-05"],
  },
  black: {
    head: "char-horse-black-00",
    body: "char-horse-black-01",
    tail: "char-horse-black-02",
    legs: ["char-horse-black-03", "char-horse-black-04", "char-horse-black-05", "char-horse-black-06"],
  },
  king: {
    head: "supp-horseking-01",
    body: "supp-horseking-00",
    tail: "supp-horseking-02",
    legs: ["supp-horseking-03", "supp-horseking-04", "supp-horseking-05", "supp-horseking-06"],
  },
  herd0: { head: "char-horses3-00", body: "char-horses3-00", tail: "", legs: ["", "", "", ""] },
  herd1: { head: "char-horses3-01", body: "char-horses3-01", tail: "", legs: ["", "", "", ""] },
  herd2: { head: "char-horses3-02", body: "char-horses3-02", tail: "", legs: ["", "", "", ""] },
};

export const PROPS = {
  manger: "prop-manger-00",
  fodderFine: "prop-fodder-00",
  fodderDry: "prop-fodder-01",
  fodderGreen: "prop-fodder-02",
  post: "prop-post-rope-00",
  postWorn: "prop-post-rope-01",
  reins: "prop-post-rope-02",
  thickRope: "prop-post-rope-03",
  sword: "prop-stick-sword-arm-00",
  woodenArm: "prop-stick-sword-arm-01",
  stick: "prop-stick-sword-arm-02",
  wine: "prop-wine-peanuts-00",
  tray: "prop-wine-peanuts-01",
  peanuts: "prop-wine-peanuts-02",
  cup: "prop-wine-peanuts-03",
  sign: "prop-sign-00",
  sun: "fx-sunset-00",
  cloud0: "fx-sunset-01",
  cloud1: "fx-sunset-02",
  cloud2: "fx-sunset-03",
  wind0: "fx-sunset-04",
  wind1: "fx-sunset-06",
  dust0: "fx-sunset-05",
  dust1: "fx-sunset-07",
  tearTop: "fx-tear-00",
  tearRed: "fx-tear-01",
  tearPaper: "fx-tear-02",
  tearStrip: "fx-tear-03",
} as const;

export const info = (name: string): PartInfo => PARTS[`${name}.png`];

/** Aspect-correct display size for a part given its target width. */
export const sized = (name: string, width: number): { w: number; h: number } => {
  const p = info(name);
  const ratio = p ? p.h / p.w : 1;
  return { w: width, h: width * ratio };
};

/** Supplementary plates: flip-book pose sequences. */
export const SEQS = {
  ride: ["supp-ride-00", "supp-ride-01", "supp-ride-02"],
  kneel: ["supp-kneel-00", "supp-kneel-01", "supp-kneel-02"],
  slash: ["supp-slash-00", "supp-slash-01", "supp-slash-02"],
  chew: ["supp-chew-00", "supp-chew-01", "supp-chew-02"],
  headsDown: ["supp-horseheads-00", "supp-horseheads-01", "supp-horseheads-02"],
  headsUp: ["supp-horseheads-03", "supp-horseheads-04", "supp-horseheads-05"],
  thin: ["supp-thinhorses-00", "supp-thinhorses-01", "supp-thinhorses-02"],
  woodenArm: ["supp-arm-00", "supp-arm-01", "supp-arm-02"],
  chips: ["supp-arm-03", "supp-arm-04", "supp-arm-05", "supp-arm-06"],
  rebels: ["supp-rebels-00", "supp-rebels-01", "supp-rebels-02",
           "supp-rebels-03", "supp-rebels-04", "supp-rebels-05"],
  officials: ["supp-officials-01", "supp-officials-02", "supp-officials-03"],
} as const;

/** Supplementary plates: single cut-out props and character details. */
export const SUPP_PART = {
  generalSpear: "supp-general-00",
  generalHead: "supp-general-01",
  generalArmL: "supp-general-02",
  generalArmR: "supp-general-03",
  generalBow: "supp-general-04",
  generalBody: "supp-general-05",
  generalLegL: "supp-general-06",
  generalLegR: "supp-general-07",
  poisonHook: "supp-poison-00",
  armyTent: "supp-poison-01",
  poisonArrow: "supp-poison-02",
  swordGlow: "supp-swordglow-00",
  slashArc: "supp-slash-03",
  officialsGroup: "supp-officials-00",
  bell: "supp-bell-00",
  ropeKnot: "supp-bell-01",
  wornPost: "supp-bell-02",
  menuBoard: "supp-menu-00",
  dishFish: "supp-menu-01",
  dishPlates: "supp-menu-02",
  sedan: "supp-carriage-00",
  rankPlate: "supp-carriage-01",
  carriage: "supp-carriage-02",
  nightFodder: "supp-calendar-00",
  calendar: "supp-calendar-01",
  grainScoop: "supp-calendar-02",
  countingHand: "supp-account-00",
  ledger: "supp-account-01",
  abacus: "supp-account-02",
  peanuts: "supp-account-03",
  boyCrouch: "supp-boy-00",
  boyGlare: "supp-boy-01",
  boyNervous: "supp-boy-02",
  emoSmile: "supp-emo-00",
  emoGreen: "supp-emo-01",
  emoLaugh: "supp-emo-02",
  profileScar: "supp-profile-a-00",
  profileWaiter: "supp-profile-a-01",
  profileHorse: "supp-profile-a-02",
  profileScarClosed: "supp-profile-a-03",
  profileWaiterClosed: "supp-profile-a-04",
  profileHorseClosed: "supp-profile-a-05",
  profileZhao: "supp-profile-b-00",
  profileLord: "supp-profile-b-01",
  profileBoy: "supp-profile-b-02",
  profileZhaoClosed: "supp-profile-b-03",
  profileLordClosed: "supp-profile-b-04",
  profileBoyClosed: "supp-profile-b-05",
} as const;
