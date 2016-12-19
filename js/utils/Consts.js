/* @flow */

import {
  Platform,
} from 'react-native'

export const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' ? 20 : 25)
export const NAV_BAR_HEIGHT = (Platform.OS === 'ios' ? 44 : 48)
export const ABOVE_LOLIPOP = Platform.Version && Platform.Version > 19

export const BOTTOM_BAR_HEIGHT = 48
