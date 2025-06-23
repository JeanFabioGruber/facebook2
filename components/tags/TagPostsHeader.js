import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TagPostsHeader = ({ tag, onGoBack }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity 
                onPress={onGoBack} 
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color="#1abc9c" />
            </TouchableOpacity>
            <Text style={styles.title}>#{tag}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        marginLeft: 10,
    },
});

export default TagPostsHeader;