//@flow

import { NativeModules } from "react-native";

const { WebViewProxy } = NativeModules;

export function configProxy(
  options ?: {
    enabled ?: bool;
    ip ?: string;
    port ?: number;
    userName ?: string;
    password ?: string;
  }) {
  WebViewProxy.save(options)
}

export default { configProxy };
