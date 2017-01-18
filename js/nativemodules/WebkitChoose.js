//@flow

import { NativeModules } from "react-native";

const { WebkitChoose } = NativeModules;

export function chooseWebKit(
  options ?: {
    isX5 ?: bool;
  }) {
  WebkitChoose.choose(options)
}

export default { chooseWebKit };
