import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const Account = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(user?.firstName || null);
  const [lastName, setLastName] = useState<string | null>(user?.lastName || null);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const onSaveUser = async () => {
    if (!user || !firstName || !lastName) {
      Alert.alert('Error', 'Please enter both first and last names.');
      return;
    }
    setIsLoading(true);
    try {
      await user.update({ firstName, lastName });
      Alert.alert('Success', 'Profile updated successfully.');
      setEdit(false);
    } catch (error) {
      console.error('Update user error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onCaptureImage = async () => {
    setIsLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access gallery is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
        base64: true,
      });
      if (!result.canceled && user) {
        const base64 = `data:image/png;base64,${result.assets[0].base64}`;
        await user.setProfileImage({ file: base64 });
        Alert.alert('Success', 'Profile image updated.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={onCaptureImage} style={styles.captureBtn}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={50} color={Colors.gray} />
          )}
        </TouchableOpacity>
        {!edit ? (
          <View style={styles.editRow}>
            <Text style={styles.name}>
              {firstName || 'First'} {lastName || 'Last'}
            </Text>
            <TouchableOpacity onPress={() => setEdit(true)}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editRow}>
            <TextInput
              placeholder="First Name"
              value={firstName || ''}
              onChangeText={setFirstName}
              style={[defaultStyles.inputField, styles.inputField]}
            />
            <TextInput
              placeholder="Last Name"
              value={lastName || ''}
              onChangeText={setLastName}
              style={[defaultStyles.inputField, styles.inputField]}
            />
            <TouchableOpacity onPress={onSaveUser}>
              <Ionicons name="checkmark-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={() => signOut()}>
          <Ionicons name="log-out" size={24} color="#fff" />
          <Text style={styles.btnText}>Log out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="person" size={24} color="#fff" />
          <Text style={styles.btnText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="bulb" size={24} color="#fff" />
          <Text style={styles.btnText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="megaphone" size={24} color="#fff" />
          <Text style={styles.btnText}>Inbox</Text>
          <View style={styles.inboxBadge}>
            <Text style={styles.inboxBadgeText}>14</Text>
          </View>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
  },
  profileSection: {
    alignItems: 'center',
  },
  captureBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  name: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '600',
  },
  inputField: {
    width: 140,
    height: 44,
    backgroundColor: '#fff',
  },
  actions: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    margin: 20,
    paddingVertical: 10,
  },
  btn: {
    padding: 14,
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
  },
  inboxBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  inboxBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default Account;