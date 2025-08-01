import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MARGIN } from './Config';
import Tile from './Tile';
import SortableList from './SortableList';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const tiles = [
  { id: 'spent' },
  { id: 'cashback' },
  { id: 'recent' },
  { id: 'cards' },
];

const WidgetList = () => {
  const [editing, setEditing] = useState(false);

  const toggleEditing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditing(!editing);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleEditing} style={styles.editButton}>
          <Ionicons
            name={editing ? 'checkmark' : 'pencil'}
            size={20}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>
      <Animated.View entering={FadeIn.duration(300)}>
        <SortableList
          editing={editing}
          onDragEnd={(positions) => console.log(JSON.stringify(positions, null, 2))}
        >
          {tiles.map((tile, index) => (
            <Tile key={`${tile.id}-${index}`} id={tile.id} onLongPress={() => setEditing(true)} />
          ))}
        </SortableList>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Ensure full width for centering
    marginBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: MARGIN,
    marginBottom: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default WidgetList;