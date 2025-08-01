import { Dimensions } from 'react-native';
import { Easing } from 'react-native-reanimated';

export interface Positions {
  [id: string]: number;
}

const { width } = Dimensions.get('window');
export const MARGIN = 16;
export const SIZE = (width - MARGIN * 3) / 2;
export const COL = 2;

export const animationConfig = {
  easing: Easing.inOut(Easing.ease),
  duration: 400,
};

export const getPosition = (position: number): { x: number; y: number } => {
  'worklet';
  return {
    x: position % COL === 0 ? MARGIN : MARGIN + SIZE + MARGIN,
    y: Math.floor(position / COL) * (SIZE + MARGIN) + MARGIN,
  };
};

export const getOrder = (tx: number, ty: number, max: number): number => {
  'worklet';
  const x = Math.round((tx - MARGIN) / (SIZE + MARGIN)) * (SIZE + MARGIN);
  const y = Math.round((ty - MARGIN) / (SIZE + MARGIN)) * (SIZE + MARGIN);
  const row = Math.max(y, 0) / (SIZE + MARGIN);
  const col = Math.max(x, 0) / (SIZE + MARGIN);
  return Math.min(row * COL + col, max);
};