import React from 'react';
import { View, StyleSheet } from 'react-native';
import InfoField from './InfoField';

const UserInfoSection = ({ 
    userData, 
    onChangeNome, 
    onChangeTelefone, 
    onChangeBio, 
    email, 
    isEditing 
}) => {
    return (
        <View style={styles.infoSection}>
            <InfoField 
                label="Nome" 
                value={userData.nome} 
                onChangeText={onChangeNome} 
                isEditing={isEditing}
            />
            <InfoField 
                label="Telefone" 
                value={userData.telefone} 
                onChangeText={onChangeTelefone}
                keyboardType="phone-pad"
                isEditing={isEditing}
            />
            <InfoField 
                label="Bio" 
                value={userData.bio} 
                onChangeText={onChangeBio}
                multiline={true}
                isEditing={isEditing}
            />
            <InfoField 
                label="E-mail" 
                value={email} 
                isEditing={isEditing}
                editable={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    infoSection: {
        backgroundColor: '#fff', 
        marginHorizontal: 20, 
        borderRadius: 12,
        padding: 20, 
        marginBottom: 20, 
        elevation: 2
    },
});

export default UserInfoSection;