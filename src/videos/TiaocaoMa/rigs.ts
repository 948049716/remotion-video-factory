/**
 * 跳槽马 — 纸偶关节锚点（阶段 3）
 *
 * 坐标系：归一化到每个视图的裁剪边界，左上角 (0,0)，右下角 (1,1)。
 * 这些是初版锚点，阶段 4 会在 Remotion Studio 叠加调试层逐点校准。
 *
 * view 字段是 public/ 下的相对路径，组件里用 staticFile(view) 读取。
 */

export interface RigPoint {
  x: number;
  y: number;
}

export interface PuppetRig {
  id: string;
  view: string;
  sideView?: string;
  parts: string[];
  anchors: Record<string, RigPoint>;
  notes: string;
}

export const PUPPET_RIGS: Record<string, PuppetRig> = {
  er: {
    id: "char.er",
    view: "tiaocaoma/assets/char-er-v1.png",
    sideView: "tiaocaoma/assets/char-er-v2.png",
    parts: [
      "head",
      "torso",
      "upperArmL",
      "upperArmR",
      "forearmL",
      "forearmR",
      "handL",
      "handR",
      "thighL",
      "thighR",
      "shinL",
      "shinR",
      "footL",
      "footR",
      "apron",
      "towel",
    ],
    anchors: {
      headTop: { x: 0.5, y: 0.02 },
      chin: { x: 0.5, y: 0.18 },
      neck: { x: 0.5, y: 0.22 },
      shoulderL: { x: 0.3, y: 0.26 },
      shoulderR: { x: 0.7, y: 0.26 },
      elbowL: { x: 0.27, y: 0.4 },
      elbowR: { x: 0.73, y: 0.4 },
      wristL: { x: 0.26, y: 0.54 },
      wristR: { x: 0.74, y: 0.54 },
      hip: { x: 0.5, y: 0.56 },
      hipL: { x: 0.42, y: 0.58 },
      hipR: { x: 0.58, y: 0.58 },
      kneeL: { x: 0.42, y: 0.75 },
      kneeR: { x: 0.58, y: 0.75 },
      ankleL: { x: 0.42, y: 0.94 },
      ankleR: { x: 0.58, y: 0.94 },
    },
    notes:
      "front view 为工作视图；头部绕 neck 旋转，躯干为根节点；围裙与毛巾单独一层，跟随躯干。",
  },
  scarface: {
    id: "char.scarface",
    view: "tiaocaoma/assets/char-scarface-v1.png",
    sideView: "tiaocaoma/assets/char-scarface-v2.png",
    parts: [
      "head",
      "scar",
      "torso",
      "leftUpperArm",
      "leftForearm",
      "leftHand",
      "emptySleeve",
      "thighL",
      "thighR",
      "shinL",
      "shinR",
      "footL",
      "footR",
    ],
    anchors: {
      headTop: { x: 0.5, y: 0.02 },
      chin: { x: 0.5, y: 0.19 },
      neck: { x: 0.5, y: 0.23 },
      shoulderL: { x: 0.27, y: 0.27 },
      shoulderR: { x: 0.73, y: 0.27 },
      elbowL: { x: 0.24, y: 0.42 },
      elbowR: { x: 0.76, y: 0.42 },
      wristL: { x: 0.23, y: 0.56 },
      wristR: { x: 0.77, y: 0.56 },
      hip: { x: 0.5, y: 0.57 },
      hipL: { x: 0.41, y: 0.59 },
      hipR: { x: 0.59, y: 0.59 },
      kneeL: { x: 0.41, y: 0.77 },
      kneeR: { x: 0.59, y: 0.77 },
      ankleL: { x: 0.41, y: 0.95 },
      ankleR: { x: 0.59, y: 0.95 },
      emptySleeveTip: { x: 0.78, y: 0.52 },
    },
    notes:
      "素材 front view 仍带有 AI 补出的右臂；阶段 4 在 shoulderR 处裁掉右臂，换成代码绘制的 emptySleeve 纸片。刀疤是独立脸纸层，不参与身体绑定。",
  },
  "horse.lame": {
    id: "char.horse.lame",
    view: "tiaocaoma/assets/char-horse-lame-v1.png",
    sideView: "tiaocaoma/assets/char-horse-lame-v2.png",
    parts: [
      "body",
      "neck",
      "head",
      "earL",
      "earR",
      "frontLegL",
      "frontLegR",
      "backLegL",
      "backLegR",
      "tail",
      "bell",
    ],
    anchors: {
      headTop: { x: 0.8, y: 0.1 },
      muzzle: { x: 0.93, y: 0.22 },
      neckBase: { x: 0.66, y: 0.32 },
      withers: { x: 0.55, y: 0.3 },
      bodyCenter: { x: 0.48, y: 0.48 },
      tailBase: { x: 0.18, y: 0.4 },
      frontShoulder: { x: 0.68, y: 0.55 },
      frontKnee: { x: 0.72, y: 0.75 },
      frontHoof: { x: 0.74, y: 0.93 },
      backHip: { x: 0.33, y: 0.52 },
      backKnee: { x: 0.3, y: 0.75 },
      backHoof: { x: 0.28, y: 0.93 },
      bell: { x: 0.72, y: 0.48 },
    },
    notes:
      "v1 为右侧视图，马头朝右；v2 为正面。瘸腿步态按 4 帧循环：健腿落地、瘸腿点地、身体下沉、铃铛滞后。",
  },
};

/**
 * 校准流程：
 * 1. 在 Remotion 里新建一个 DebugRig 组件，把锚点画成小圆点叠加在视图上；
 * 2. 逐个角色拖动锚点，直到落在关节中心；
 * 3. 把校准后的数值回填到本文件，并把 notes 里的“初版”标记去掉。
 */
export const RIG_GUIDE =
  "所有坐标基于裁剪后的视图；换视图或换分辨率时必须重新校准。";
