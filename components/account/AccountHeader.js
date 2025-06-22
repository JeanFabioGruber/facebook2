import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AccountHeader = ({ onBackPress, isEditing, onEditToggle, title = 'Meu Perfil' }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#1abc9c" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onEditToggle} style={styles.headerButton}>
                <Ionicons name={isEditing ? "close" : "pencil"} size={24} color="#1abc9c" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
        paddingTop: 40,
    },
    headerButton: { 
        padding: 5 
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#2d3436' 
    },
});

export default AccountHeader;