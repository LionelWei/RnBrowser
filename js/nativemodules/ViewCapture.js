//@flow

import { NativeModules, findNodeHandle } from "react-native";

const { ViewCapture } = NativeModules;

export function capture(
  view: number | ReactElement<any>,
  options ?: {
    width ?: number;
    height ?: number;
    filename ?: string;
    format ?: "png" | "jpg" | "jpeg" | "webm";
    quality ?: number;
  }
): Promise<string> {
  if (typeof view !== "number") {
    const node = findNodeHandle(view);
    if (!node) return Promise.reject(new Error("findNodeHandle failed to resolve view="+String(view)));
    view = node;
  }
  return ViewCapture.capture(view, options);
}

export default { capture };
