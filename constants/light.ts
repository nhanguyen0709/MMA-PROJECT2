import {
  ITheme,
  ThemeColors,
  ThemeGradients,
  ThemeSizes,
  ThemeSpacing,
} from './types';

import {THEME as commonTheme} from './theme';

export const COLORS: ThemeColors = {
  // default text color
  text: '#1a1a1a',

  // base colors - Updated with new color scheme
  primary: '#54b6f8',
  secondary: '#4a9fd8',
  tertiary: '#e6f7ff',

  // non-colors
  black: '#1a1a1a',
  white: '#FFFFFF',

  dark: '#2c3e50',
  light: '#e6f7ff',

  // gray variations
  gray: '#95a5a6',

  // colors variations
  danger: '#e74c3c',
  warning: '#f39c12',
  success: '#2ecc71',
  info: '#54b6f8',

  // UI colors for navigation & card
  card: '#FFFFFF',
  background: '#e6f7ff',

  // UI color for shadowColor
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.3)',

  // UI color for input borderColor on focus
  focus: '#54b6f8',
  input: '#1a1a1a',

  // UI color for switch checked/active color
  switchOn: '#54b6f8',
  switchOff: '#e6f7ff',

  // UI color for checkbox icon checked/active color
  checkbox: ['#54b6f8', '#4a9fd8'],
  checkboxIcon: '#FFFFFF',

  // social colors
  facebook: '#3B5998',
  twitter: '#55ACEE',
  dribbble: '#EA4C89',

  // icon tint color
  icon: '#54b6f8',

  // blur tint color
  blurTint: 'light',

  // product link color
  link: '#54b6f8',
};

export const GRADIENTS: ThemeGradients = {
  primary: ['#54b6f8', '#4a9fd8', '#3d8bc7'],
  secondary: ['#e6f7ff', '#b3e0ff', '#80c9ff'],
  info: ['#54b6f8', '#3d8bc7'],
  success: ['#2ecc71', '#27ae60'],
  warning: ['#f39c12', '#e67e22'],
  danger: ['#e74c3c', '#c0392b'],

  light: ['#ffffff', '#e6f7ff', '#cceeff'],
  dark: ['#2c3e50', '#34495e'],

  white: [String(COLORS.white), '#f8fcff'],
  black: [String(COLORS.black), '#2c3e50'],

  divider: ['rgba(84, 182, 248, 0.3)', 'rgba(74, 159, 216, 0.6)'],
  menu: [
    'rgba(230, 247, 255, 0.9)',
    'rgba(84, 182, 248, 0.5)',
    'rgba(230, 247, 255, 0.9)',
  ],
};

export const SIZES: ThemeSizes = {
  // global sizes
  base: 8,
  text: 14,
  radius: 4,
  padding: 20,

  // font sizes
  h1: 44,
  h2: 40,
  h3: 32,
  h4: 24,
  h5: 18,
  p: 16,

  // button sizes
  buttonBorder: 1,
  buttonRadius: 8,
  socialSize: 64,
  socialRadius: 16,
  socialIconSize: 26,

  // button shadow
  shadowOffsetWidth: 0,
  shadowOffsetHeight: 7,
  shadowOpacity: 0.07,
  shadowRadius: 4,
  elevation: 2,

  // input sizes
  inputHeight: 46,
  inputBorder: 1,
  inputRadius: 8,
  inputPadding: 12,

  // card sizes
  cardRadius: 16,
  cardPadding: 10,

  // image sizes
  imageRadius: 14,
  avatarSize: 32,
  avatarRadius: 8,

  // switch sizes
  switchWidth: 50,
  switchHeight: 24,
  switchThumb: 20,

  // checkbox sizes
  checkboxWidth: 18,
  checkboxHeight: 18,
  checkboxRadius: 5,
  checkboxIconWidth: 10,
  checkboxIconHeight: 8,

  // product link size
  linkSize: 12,

  multiplier: 2,
};

export const SPACING: ThemeSpacing = {
  xs: SIZES.base * 0.5,
  s: SIZES.base * 1,
  sm: SIZES.base * 2,
  m: SIZES.base * 3,
  md: SIZES.base * 4,
  l: SIZES.base * 5,
  xl: SIZES.base * 6,
  xxl: SIZES.base * 7,
};

export const light: ITheme = {
  ...commonTheme,
  colors: COLORS,
  gradients: GRADIENTS,
  sizes: {...SIZES, ...commonTheme.sizes, ...SPACING},
};
