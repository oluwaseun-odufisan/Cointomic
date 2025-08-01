import React, { ReactNode } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  scrollTo,
  useSharedValue,
  SharedValue,
  AnimatedRef,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { animationConfig, COL, getOrder, getPosition, Positions, SIZE } from './Config';
import Colors from '@/constants/Colors';

interface ItemProps {
  children: ReactNode;
  positions: SharedValue<Positions>;
  id: string;
  editing: boolean;
  onDragEnd: (diffs: Positions) => void;
  scrollView: AnimatedRef<Animated.ScrollView>;
  scrollY: SharedValue<number>;
}

const Item = ({ children, positions, id, onDragEnd, scrollView, scrollY, editing }: ItemProps) => {
  const inset = useSafeAreaInsets();
  const containerHeight = Dimensions.get('window').height - inset.top - inset.bottom;
  const contentHeight = (Object.keys(positions.value).length / COL) * (SIZE + 16);
  const isGestureActive = useSharedValue(false);

  const position = getPosition(positions.value[id]!);
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);

  useAnimatedReaction(
    () => positions.value[id]!,
    (newOrder) => {
      if (!isGestureActive.value) {
        const pos = getPosition(newOrder);
        translateX.value = withSpring(pos.x, animationConfig);
        translateY.value = withSpring(pos.y, animationConfig);
      }
    },
    [positions.value]
  );

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { x: number; y: number }
  >({
    onStart: (_, ctx) => {
      if (editing) {
        ctx.x = translateX.value;
        ctx.y = translateY.value;
        isGestureActive.value = true;
      }
    },
    onActive: ({ translationX, translationY }, ctx) => {
      if (editing) {
        translateX.value = ctx.x + translationX;
        translateY.value = ctx.y + translationY;
        const newOrder = getOrder(
          translateX.value,
          translateY.value,
          Object.keys(positions.value).length - 1
        );
        const oldOrder = positions.value[id];
        if (newOrder !== oldOrder) {
          const idToSwap = Object.keys(positions.value).find(
            (key) => positions.value[key] === newOrder
          );
          if (idToSwap) {
            const newPositions = { ...positions.value };
            newPositions[id] = newOrder;
            newPositions[idToSwap] = oldOrder;
            positions.value = newPositions;
          }
        }
        const lowerBound = scrollY.value;
        const upperBound = lowerBound + containerHeight - SIZE;
        const maxScroll = contentHeight - containerHeight;
        const leftToScrollDown = maxScroll - scrollY.value;
        if (translateY.value < lowerBound) {
          const diff = Math.min(lowerBound - translateY.value, lowerBound);
          scrollY.value -= diff;
          scrollTo(scrollView, 0, scrollY.value, false);
          ctx.y -= diff;
          translateY.value = ctx.y + translationY;
        }
        if (translateY.value > upperBound) {
          const diff = Math.min(translateY.value - upperBound, leftToScrollDown);
          scrollY.value += diff;
          scrollTo(scrollView, 0, scrollY.value, false);
          ctx.y += diff;
          translateY.value = ctx.y + translationY;
        }
      }
    },
    onEnd: () => {
      const newPosition = getPosition(positions.value[id]!);
      translateX.value = withSpring(newPosition.x, animationConfig, () => {
        isGestureActive.value = false;
        onDragEnd(positions.value); // Direct call instead of runOnJS
      });
      translateY.value = withSpring(newPosition.y, animationConfig);
    },
  });

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    zIndex: isGestureActive.value ? 100 : 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(isGestureActive.value ? 1.05 : 1) },
    ],
    shadowColor: Colors.dark,
    shadowOffset: { width: isGestureActive.value ? 4 : 2, height: isGestureActive.value ? 4 : 2 },
    shadowOpacity: isGestureActive.value ? 0.25 : 0.15,
    shadowRadius: isGestureActive.value ? 8 : 4,
  }));

  return (
    <Animated.View style={style}>
      <PanGestureHandler enabled={editing} onGestureEvent={onGestureEvent}>
        <Animated.View style={StyleSheet.absoluteFill}>{children}</Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

export default Item;