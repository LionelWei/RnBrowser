//@flow

import { NativeModules, findNodeHandle } from "react-native";

const { UrlDownload } = NativeModules;

export function foo() {
  UrlDownload.foo((x, y) => {
    alert('x: ' + x + ', y: ' + y)
  })
}

export function bar(): Promise<string> {
  return UrlDownload.barPromise();
}

export default { foo, bar };
