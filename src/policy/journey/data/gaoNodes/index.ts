import { gao002NodeScenes } from "./GAO-002";
import { gao003NodeScenes } from "./GAO-003";
import { gao004NodeScenes } from "./GAO-004";
import { gao005NodeScenes } from "./GAO-005";
import { gao006NodeScenes } from "./GAO-006";
import { gao007NodeScenes } from "./GAO-007";
import { gao008NodeScenes } from "./GAO-008";
import { gao009NodeScenes } from "./GAO-009";
import { gao010NodeScenes } from "./GAO-010";
import { gao011NodeScenes } from "./GAO-011";
import { gao012NodeScenes } from "./GAO-012";
import { gao013NodeScenes } from "./GAO-013";
import { gao014NodeScenes } from "./GAO-014";
import { gao015NodeScenes } from "./GAO-015";
import { gao016NodeScenes } from "./GAO-016";
import { gao017NodeScenes } from "./GAO-017";
import { gao018NodeScenes } from "./GAO-018";
import { gao019NodeScenes } from "./GAO-019";
import { gao020NodeScenes } from "./GAO-020";
import { gao021NodeScenes } from "./GAO-021";
import { gao022NodeScenes } from "./GAO-022";
import { gao023NodeScenes } from "./GAO-023";
import { gao024NodeScenes } from "./GAO-024";
import { gao025NodeScenes } from "./GAO-025";
import { gao026NodeScenes } from "./GAO-026";
import { gao027NodeScenes } from "./GAO-027";
import type { GaoNodeScene } from "./gaoNodeTypes";

const scenes: GaoNodeScene[] = [
  ...gao002NodeScenes,
  ...gao003NodeScenes,
  ...gao004NodeScenes,
  ...gao005NodeScenes,
  ...gao006NodeScenes,
  ...gao007NodeScenes,
  ...gao008NodeScenes,
  ...gao009NodeScenes,
  ...gao010NodeScenes,
  ...gao011NodeScenes,
  ...gao012NodeScenes,
  ...gao013NodeScenes,
  ...gao014NodeScenes,
  ...gao015NodeScenes,
  ...gao016NodeScenes,
  ...gao017NodeScenes,
  ...gao018NodeScenes,
  ...gao019NodeScenes,
  ...gao020NodeScenes,
  ...gao021NodeScenes,
  ...gao022NodeScenes,
  ...gao023NodeScenes,
  ...gao024NodeScenes,
  ...gao025NodeScenes,
  ...gao026NodeScenes,
  ...gao027NodeScenes,
];

const scenesByAppLocation = new Map(scenes.map((scene) => [scene.appLocation, scene]));

export const gaoNodeScenes: readonly GaoNodeScene[] = scenes;

export function getGaoNodeScene(appLocation: string): GaoNodeScene | undefined {
  return scenesByAppLocation.get(appLocation);
}

export type {
  GaoNode,
  GaoNodeKind,
  GaoNodeMicroCheck,
  GaoNodeOption,
  GaoNodeProgressRecord,
  GaoNodeScene,
  GaoNodeTone,
  GaoProcessNote,
  GaoProtectedRegion,
} from "./gaoNodeTypes";
