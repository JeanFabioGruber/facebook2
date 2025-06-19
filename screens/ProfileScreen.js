import React from 'react';
import { View, Text } from 'react-native';

export default function ProfileScreen({ route }) {
  const { userId } = route.params;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Perfil do usuário: {userId}</Text>
    </View>
  );
}