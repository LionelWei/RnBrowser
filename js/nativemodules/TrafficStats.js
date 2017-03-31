// @flow

import { NativeModules } from "react-native";
const { TrafficStats } = NativeModules;

function setFreeThreshold(maxBytes: number) {
  TrafficStats.setFreeThreshold(maxBytes);
}

function getMobileBytes(): Promise<string> {
  return TrafficStats.getMobileBytes();
}

function getFreeBytes(): Promise<string> {
  return TrafficStats.getFreeBytes();
}

module.exports = {
  setFreeThreshold,
  getMobileBytes,
  getFreeBytes
}
