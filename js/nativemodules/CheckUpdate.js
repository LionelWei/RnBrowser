//@flow

import { NativeModules } from "react-native";
import {
  isIOS,
} from '../utils/Consts'

const { FirCheckUpdate } = NativeModules;

const FIR_TOKEN = "84ec03dc29dd833da781e7a215a7603f"

function checkUpdate(): Promise<string> {
  return FirCheckUpdate.checkUpdate(FIR_TOKEN);
}

function getCurrentVersion(): Promise<string> {
  return FirCheckUpdate.getCurrentVersion();
}

module.exports = {
  checkUpdate,
  getCurrentVersion
};
