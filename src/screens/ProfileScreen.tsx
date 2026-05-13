/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { PrimaryButton } from '../components/PrimaryButton';

import { updateProfile } from '../features/auth/authSlice';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppDispatch, useAppSelector } from '../hooks/storehooks';
import { useUpdateuserMutation } from '../services/apis/auth.api';
import { PhoneInput } from '../components/phoneinput';
import { FormInput } from '../components/input.component';
import { COUNTRIES } from '../utils/countryCodes';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  console.log(user);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [phone_number, setPhone] = useState(user?.phone_number || '');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [EditUser, { isLoading: loading }] = useUpdateuserMutation({});
  const handleSave = async () => {
    dispatch(updateProfile({ name, email, profilePic }));
    await EditUser({ name, email, profilePic, phone_number });
  };

  const pickImage = async () => {
    const result: any = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {/* Profile Picture */}
      <TouchableOpacity
        onPress={pickImage}
        style={{ alignSelf: 'center', marginBottom: 20 }}
      >
        {profilePic ? (
          <Image
            source={{ uri: profilePic }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: colors.primary,
            }}
          />
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.secondary }}>Upload Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name Input */}
      <FormInput
        label="Name"
        placeholder="James Maido"
        value={name}
        capitalize
        onChangeText={setName}
      />
      <FormInput
        label="Email"
        placeholder="example@123.crm"
        value={email}
        onChangeText={setEmail}
      />
      <PhoneInput
        label="Phone Number"
        value={phone_number}
        country={country}
        onChangeCountry={setCountry}
        onChange={full => setPhone(full)}
      />

      <PrimaryButton
        loading={loading}
        title="Save Changes"
        onPress={handleSave}
      />
    </View>
  );
}
