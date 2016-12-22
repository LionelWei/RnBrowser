/* @flow */

import {
  Platform,
  Dimensions,
} from 'react-native'

export const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' ? 20 : 25)
export const NAV_BAR_HEIGHT = (Platform.OS === 'ios' ? 44 : 48)
export const ABOVE_LOLIPOP = Platform.Version && Platform.Version > 19

export const BOTTOM_BAR_HEIGHT = 48

var {height, width} = Dimensions.get('window');
export const SCREEN_HEIGHT = height - STATUS_BAR_HEIGHT;
export const SCREEN_WIDTH = width;
