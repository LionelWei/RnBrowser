/*
 * @flow */

// 区分iOS与Android
import MIME from './mime'
import {
  isIOS
} from '../utils/Consts'

const FileOpener = isIOS ? require('react-native-file-opener') : require('../nativemodules/FileLauncher');

function open(path: string) {
  return FileOpener.open(
    path,
    getMimeByPath(path)
  );
}

function getMimeByPath(path: string) {
  let lastDot = path.lastIndexOf('.');
  if (!~lastDot) {
    return MIME[""];
  }
  return MIME[path.substr(lastDot)] || MIME[""];
}

var FS = {
  open,
  getMimeByPath
};

module.exports = FS;
