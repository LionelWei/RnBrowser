/* @flow */

import {
  Platform,
  Dimensions,
  StatusBar,
  PixelRatio,
} from 'react-native'

export const isIOS = Platform.OS === 'ios';
export const STATUS_BAR_HEIGHT = isIOS ? 20 : StatusBar.currentHeight;
export const NAV_BAR_HEIGHT = isIOS ? 44 : 48;
export const ABOVE_LOLIPOP = Platform.Version && Platform.Version > 19;

export const BOTTOM_BAR_HEIGHT = 48;
export const SEARCH_BAR_HEIGHT = NAV_BAR_HEIGHT;

var {height, width} = Dimensions.get('window');
export const SCREEN_HEIGHT = height - STATUS_BAR_HEIGHT;
export const SCREEN_WIDTH = width;
export const TOP_OFFSET = isIOS ? STATUS_BAR_HEIGHT : 0;

const spRatio = PixelRatio.get() / PixelRatio.getFontScale();

export function spFont(fontSize: number) {
  return fontSize * spRatio;
}
