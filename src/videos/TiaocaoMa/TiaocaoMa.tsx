import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { ASSET_FILES } from "./asset-files";
import {
  FALLBACK_ASSET_FILES,
  SPEAKER_BY_ASSET,
} from "./asset-fallbacks";
import { AudioLayer } from "./AudioLayer";
import {
  getChoreography,
  type PuppetChoreography,
  type PuppetGesture,
} from "./choreography";
import { PaperCaption } from "./PaperCaption";
import { hasPaperPose, PaperPose } from "./PaperPose";
import { PaperPuppet } from "./PaperPuppet";
import { PaperStage } from "./PaperStage";
import { PaperTitle } from "./PaperTitle";
import { PaperWipe } from "./PaperWipe";
import { RETIMED_SHOTS, type RetimedShot } from "./retimed-timeline";
import { getScene, getSceneKey } from "./scene-bible";
import { ShotFx } from "./ShotFx";
import { SHOT_META } from "./shot-meta";

type PropPlacement = {
  width: string;
  bottom: number;
  left?: string;
  right?: string;
  translateX?: boolean;
  rotate?: number;
  zIndex: number;
};

const DEFAULT_PROP: PropPlacement = {
  width: "16%",
  bottom: 160,
  right: "10%",
  zIndex: 30,
};

const SECOND_PROP: PropPlacement = {
  width: "12%",
  bottom: 150,
  right: "26%",
  zIndex: 29,
};

const PROP_PLACEMENT: Record<string, PropPlacement> = {
  "prop.arm.wood": {
    width: "20%",
    bottom: 170,
    left: "24%",
    rotate: -20,
    zIndex: 30,
  },
  "prop.sword": {
    width: "30%",
    bottom: 170,
    left: "50%",
    translateX: true,
    zIndex: 30,
  },
  "prop.bell": { width: "10%", bottom: 230, right: "16%", zIndex: 30 },
  "prop.rank.plaques": {
    width: "32%",
    bottom: 230,
    left: "50%",
    translateX: true,
    zIndex: 18,
  },
  "prop.trough.map": {
    width: "56%",
    bottom: 260,
    left: "50%",
    translateX: true,
    zIndex: 18,
  },
  "prop.table.set": {
    width: "42%",
    bottom: 180,
    left: "50%",
    translateX: true,
    zIndex: 15,
  },
  "prop.table": {
    width: "42%",
    bottom: 180,
    left: "50%",
    translateX: true,
    zIndex: 15,
  },
  "prop.reins": { width: "24%", bottom: 190, left: "10%", zIndex: 30 },
  "prop.saddle": { width: "20%", bottom: 180, right: "10%", zIndex: 30 },
  "prop.cloth": { width: "18%", bottom: 160, right: "10%", zIndex: 30 },
  "prop.umbrella": {
    width: "26%",
    bottom: 560,
    left: "2%",
    zIndex: 18,
  },
  "prop.post": { width: "12%", bottom: 150, left: "56%", zIndex: 18 },
  "prop.post.worn": {
    width: "12%",
    bottom: 150,
    left: "56%",
    zIndex: 18,
  },
  "prop.stick": { width: "10%", bottom: 180, right: "12%", zIndex: 30 },
  "prop.weapons": { width: "20%", bottom: 170, right: "8%", zIndex: 30 },
  "prop.spear": { width: "20%", bottom: 170, right: "8%", zIndex: 30 },
};

type FxPlacement = {
  width: string;
  bottom?: number;
  top?: number | string;
  left?: string;
  right?: string;
  translateX?: boolean;
  opacity?: number;
  zIndex: number;
};

const DEFAULT_FX: FxPlacement = {
  width: "30%",
  bottom: 150,
  right: "6%",
  zIndex: 12,
  opacity: 0.8,
};

const FX_PLACEMENT: Record<string, FxPlacement> = {
  "fx.horse-king.gold": {
    width: "42%",
    bottom: 130,
    right: "4%",
    zIndex: 10,
    opacity: 0.8,
  },
  "fx.gold-sun": {
    width: "30%",
    top: 40,
    right: "6%",
    zIndex: 9,
    opacity: 0.75,
  },
  "fx.slash": {
    width: "52%",
    top: "30%",
    left: "50%",
    translateX: true,
    zIndex: 40,
    opacity: 0.95,
  },
  "fx.torn-open": {
    width: "100%",
    top: 0,
    left: "0",
    zIndex: 40,
    opacity: 0.95,
  },
  "fx.paper-close": {
    width: "100%",
    top: 0,
    left: "0",
    zIndex: 40,
    opacity: 0.95,
  },
  "fx.day-flip": {
    width: "40%",
    bottom: 160,
    left: "50%",
    translateX: true,
    zIndex: 30,
    opacity: 0.9,
  },
};

const SCREEN_RANK: Record<string, number> = {
  "char.er": 1,
  "char.scarface": 1,
  "char.scarface.riding": 1,
  "char.general.one-arm": 1,
  "char.general.young": 1,
  "char.guard": 1,
  "char.child": 1,
  "char.attendant": 2,
  "char.zhao": 3,
  "char.yipin": 3,
  "char.official.guest": 3,
};

const Shot: React.FC<{ shot: RetimedShot; isSceneChange: boolean }> = ({
  shot,
  isSceneChange,
}) => {
  const frame = useCurrentFrame();
  const meta = SHOT_META[shot.id];
  if (!meta) return null;

  const scene = getScene(meta);
  const choreo = getChoreography(shot, meta);
  const progress = frame / Math.max(1, shot.durationFrames - 1);

  const speakingSpeaker = shot.segments.find(
    (segment) =>
      frame >= segment.relativeStartFrame &&
      frame < segment.relativeStartFrame + segment.durationInFrames,
  )?.speaker;

  const humanKeys = meta.assets.filter(
    (key) => key.startsWith("char.") && !key.includes("horse"),
  );
  const horseKeys = meta.assets.filter((key) => key.includes("horse"));
  const hasCrowd = humanKeys.includes("char.crowd");
  const hasHorseCrowd = horseKeys.includes("char.horse.crowd");
  const nonCrowdHumans = humanKeys.filter((key) => key !== "char.crowd");
  const sortedHumans = [...nonCrowdHumans].sort(
    (a, b) => (SCREEN_RANK[a] ?? 2) - (SCREEN_RANK[b] ?? 2),
  );
  const primaryHuman =
    sortedHumans[0] ?? (hasCrowd ? "char.crowd" : undefined);
  const secondaryHuman = sortedHumans[1];
  const primaryHorse = horseKeys.find(
    (key) => key !== "char.horse.crowd",
  );
  const ridingHorse = primaryHuman?.includes("riding")
    ? primaryHorse ?? "char.horse.lame"
    : primaryHorse;
  const hasRealRidingAsset =
    primaryHuman === "char.scarface.riding" &&
    Boolean(ASSET_FILES["char.scarface.riding"]);

  const framingScale = meta.framing.includes("特写")
    ? 1.04
    : meta.framing.includes("近景")
      ? 1.02
      : meta.framing.includes("远景") || meta.framing.includes("全景")
        ? 0.98
        : 1;

  const primaryVariant:
    | "human"
    | "official"
    | "waiter"
    | "oneArm"
    | "child"
    | "riding" = hasRealRidingAsset
    ? "riding"
    : primaryHuman === "char.zhao" ||
        primaryHuman === "char.yipin" ||
        primaryHuman === "char.official.guest"
      ? "official"
      : primaryHuman === "char.er"
        ? "waiter"
        : primaryHuman === "char.general.one-arm"
          ? "oneArm"
          : primaryHuman === "char.child"
            ? "child"
            : "human";

  const secondaryVariant: "human" | "official" =
    secondaryHuman &&
    (secondaryHuman.includes("zhao") ||
      secondaryHuman.includes("yipin") ||
      secondaryHuman.includes("official"))
      ? "official"
      : "human";

  const primarySpeaking = primaryHuman
    ? SPEAKER_BY_ASSET[primaryHuman] === speakingSpeaker
    : false;
  const secondarySpeaking = secondaryHuman
    ? SPEAKER_BY_ASSET[secondaryHuman] === speakingSpeaker
    : false;
  const showHorse =
    Boolean(ridingHorse) &&
    !secondaryHuman &&
    !hasHorseCrowd &&
    !hasRealRidingAsset;

  const propKeys = meta.assets
    .filter((key) => key.startsWith("prop.") && key !== "prop.hay")
    .filter(
      (key) =>
        !hasRealRidingAsset ||
        (key !== "prop.bell" && key !== "prop.reins"),
    )
    .filter((key) =>
      Boolean(ASSET_FILES[key] ?? FALLBACK_ASSET_FILES[key]),
    )
    .slice(0, 2);

  const windowFile = meta.assets.includes("bg.window.paper")
    ? ASSET_FILES["bg.window.paper"] ??
      FALLBACK_ASSET_FILES["bg.window.paper"]
    : undefined;

  const fxAssetKeys = meta.assets
    .filter(
      (key) =>
        key.startsWith("fx.") &&
        Boolean(ASSET_FILES[key] ?? FALLBACK_ASSET_FILES[key]),
    )
    .slice(0, 2);
  const hasHorseKing = meta.assets.includes("fx.horse-king.gold");

  const getPuppetState = (role: PuppetChoreography["role"]) => {
    const config = choreo.puppets.find((puppet) => puppet.role === role);
    if (!config) return null;

    const enter =
      config.enterAt !== undefined
        ? Math.min(1, Math.max(0, (progress - config.enterAt) / 0.12))
        : 1;
    const exit =
      config.exitAt !== undefined
        ? Math.min(1, Math.max(0, (progress - config.exitAt) / 0.12))
        : 0;

    let gesture: PuppetGesture = "idle";
    let gestureProgress = 0;
    for (const beat of config.beats ?? []) {
      const duration = beat.duration ?? 0.25;
      if (progress >= beat.at && progress <= beat.at + duration) {
        const rawProgress = (progress - beat.at) / duration;
        gesture = beat.gesture;
        gestureProgress =
          beat.gesture === "kneel"
            ? Math.min(1, (progress - beat.at) / 0.12)
            : rawProgress;
      }
    }

    return {
      gesture,
      gestureProgress,
      enterProgress: enter,
      exitProgress: exit,
      enterFrom: config.enterFrom ?? "none",
    };
  };

  const primaryState = getPuppetState("primary");
  const secondaryState = getPuppetState("secondary");
  const horseState = getPuppetState("horse");
  const crowdState = getPuppetState("crowd");
  const horseCrowdState = getPuppetState("horseCrowd");

  // 纸片特效应在指定帧闪现，不能整镜常驻遮挡人物。
  const getFxOpacity = (key: string): number => {
    const total = shot.durationFrames;

    if (key === "fx.slash") {
      const start = Math.round(total * 0.78);
      const hold = Math.max(6, Math.round(total * 0.035));
      if (frame < start || frame > start + hold) return 0;
      return 1 - (frame - start) / hold;
    }

    if (key === "fx.torn-open") {
      const hold = Math.max(6, Math.round(total * 0.06));
      return frame <= hold ? 1 - frame / hold : 0;
    }

    if (key === "fx.paper-close") {
      const start = total - Math.max(10, Math.round(total * 0.08));
      if (frame < start) return 0;
      return Math.min(1, (frame - start) / 12);
    }

    if (key === "fx.day-flip") {
      const hold = Math.max(6, Math.round(total * 0.05));
      const starts = [0.12, 0.42, 0.72].map((ratio) =>
        Math.round(total * ratio),
      );
      const active = starts.find(
        (start) => frame >= start && frame <= start + hold,
      );
      if (active === undefined) return 0;
      return 1 - (frame - active) / hold;
    }

    return 1;
  };

  return (
    <AbsoluteFill>
      <PaperStage
        meta={meta}
        durationInFrames={shot.durationFrames}
        camera={choreo.camera}
        easing={choreo.easing}
        scene={scene}
      />
      <ShotFx kinds={choreo.fx} />

      {fxAssetKeys.map((key) => {
        const file = ASSET_FILES[key] ?? FALLBACK_ASSET_FILES[key];
        if (!file) return null;
        const windowOpacity = getFxOpacity(key);
        if (windowOpacity <= 0) return null;
        const placement = FX_PLACEMENT[key] ?? DEFAULT_FX;
        return (
          <Img
            key={key}
            src={staticFile(file)}
            style={{
              position: "absolute",
              top: placement.top,
              bottom: placement.bottom,
              left: placement.left,
              right: placement.right,
              width: placement.width,
              zIndex: placement.zIndex,
              opacity: (placement.opacity ?? 0.85) * windowOpacity,
              objectFit: "contain",
              transform: placement.translateX
                ? "translateX(-50%)"
                : undefined,
              filter: "drop-shadow(0 16px 30px rgba(28,26,23,0.25))",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {hasCrowd ? (
        <PaperPuppet
          assetKey="char.crowd"
          side="center"
          scale={1}
          variant="crowd"
          {...(crowdState ?? {})}
        />
      ) : null}

      {hasHorseCrowd && !hasHorseKing ? (
        <PaperPuppet
          assetKey="char.horse.crowd"
          side="center"
          scale={1}
          variant="horseCrowd"
          {...(horseCrowdState ?? {})}
        />
      ) : null}

      {primaryHuman && !hasCrowd ? (
        hasPaperPose(primaryHuman) ? (
          <PaperPose
            assetKey={primaryHuman}
            side={secondaryHuman || showHorse ? "left" : "center"}
            scale={framingScale}
            speaking={primarySpeaking}
            {...(primaryState ?? {})}
          />
        ) : (
          <PaperPuppet
            assetKey={primaryHuman}
            side={secondaryHuman || showHorse ? "left" : "center"}
            scale={framingScale}
            speaking={primarySpeaking}
            variant={primaryVariant}
            flipX={primaryHuman === "char.scarface.riding"}
            {...(primaryState ?? {})}
          />
        )
      ) : null}

      {secondaryHuman && !hasCrowd ? (
        hasPaperPose(secondaryHuman) ? (
          <PaperPose
            assetKey={secondaryHuman}
            side="right"
            scale={framingScale * 0.94}
            speaking={secondarySpeaking}
            {...(secondaryState ?? {})}
          />
        ) : (
          <PaperPuppet
            assetKey={secondaryHuman}
            side="right"
            scale={framingScale * 0.94}
            speaking={secondarySpeaking}
            variant={secondaryVariant}
            {...(secondaryState ?? {})}
          />
        )
      ) : null}

      {showHorse ? (
        hasPaperPose(ridingHorse ?? "char.horse.lame") ? (
          <PaperPose
            assetKey={ridingHorse ?? "char.horse.lame"}
            side={primaryHuman ? "right" : "center"}
            scale={framingScale * 0.95}
            {...(horseState ?? {})}
          />
        ) : (
          <PaperPuppet
            assetKey={ridingHorse ?? "char.horse.lame"}
            side={primaryHuman ? "right" : "center"}
            scale={framingScale * 0.95}
            variant="horse"
            {...(horseState ?? {})}
          />
        )
      ) : null}

      {meta.assets.includes("prop.hay") && ASSET_FILES["prop.hay"] ? (
        <Img
          src={staticFile(ASSET_FILES["prop.hay"])}
          style={{
            position: "absolute",
            bottom: 18,
            left: "50%",
            width: "26%",
            transform: "translateX(-50%)",
            filter: "drop-shadow(0 12px 16px rgba(28,26,23,0.3))",
            zIndex: 15,
          }}
        />
      ) : null}

      {propKeys.map((key, index) => {
        const file = ASSET_FILES[key] ?? FALLBACK_ASSET_FILES[key];
        if (!file) return null;
        const placement =
          PROP_PLACEMENT[key] ?? (index === 0 ? DEFAULT_PROP : SECOND_PROP);
        const transform =
          [
            placement.translateX ? "translateX(-50%)" : "",
            placement.rotate ? `rotate(${placement.rotate}deg)` : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined;
        return (
          <Img
            key={key}
            src={staticFile(file)}
            style={{
              position: "absolute",
              bottom: placement.bottom,
              left: placement.left,
              right: placement.right,
              width: placement.width,
              zIndex: placement.zIndex,
              objectFit: "contain",
              transform,
              filter: "drop-shadow(0 12px 16px rgba(28,26,23,0.28))",
            }}
          />
        );
      })}

      {windowFile ? (
        <Img
          src={staticFile(windowFile)}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "56%",
            transform: "translate(-50%, -50%)",
            zIndex: 35,
            opacity: 0.95,
            filter: "drop-shadow(0 20px 30px rgba(28,26,23,0.3))",
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          backgroundColor: scene.grade.color,
          opacity: scene.grade.opacity,
          mixBlendMode: scene.grade.blend,
          zIndex: 45,
          pointerEvents: "none",
        }}
      />

      {shot.segments.map((segment, index) => {
        const duration = Math.max(
          1,
          Math.min(
            segment.durationInFrames + 12,
            shot.durationFrames - segment.relativeStartFrame,
          ),
        );
        return (
          <Sequence
            key={segment.id}
            from={segment.relativeStartFrame}
            durationInFrames={duration}
            name={`CC ${segment.speaker}`}
          >
            <PaperCaption
              segment={segment}
              index={index}
              placement={choreo.caption.placement}
              offsetY={choreo.caption.offsetY}
            />
          </Sequence>
        );
      })}

      {isSceneChange && meta.transitionIn !== "cut" ? (
        <Sequence
          durationInFrames={10}
          name={`Transition ${meta.transitionIn}`}
        >
          <PaperWipe seed={shot.id.length + meta.transitionIn.length} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export const TiaocaoMa: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#1C1A17" }}>
    {RETIMED_SHOTS.map((shot, index) => {
      const meta = SHOT_META[shot.id];
      const prevShot =
        index > 0 ? RETIMED_SHOTS[index - 1] : undefined;
      const prevMeta = prevShot ? SHOT_META[prevShot.id] : undefined;
      const isSceneChange =
        !meta || !prevMeta
          ? true
          : getSceneKey(meta) !== getSceneKey(prevMeta);
      return (
        <Sequence
          key={shot.id}
          from={shot.startFrame}
          durationInFrames={shot.durationFrames}
          name={`${shot.id} ${SHOT_META[shot.id]?.title ?? ""}`}
        >
          <Shot shot={shot} isSceneChange={isSceneChange} />
        </Sequence>
      );
    })}

    <Sequence from={0} durationInFrames={132} name="Title">
      <PaperTitle />
    </Sequence>

    <AudioLayer />
  </AbsoluteFill>
);
