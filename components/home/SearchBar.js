import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ value, onChangeText }) => {
    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#b2bec3" style={styles.searchIcon} />
                <TextInput
                    placeholder="Buscar post..."
                    value={value}
                    onChangeText={onChangeText}
                    style={styles.searchInput}
                    placeholderTextColor="#b2bec3"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 16,
        marginTop: 80,
        marginBottom: 8,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIcon: {
        marginLeft: 10,
        marginRight: 6
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 0,
        paddingVertical: 8,
        fontSize: 16,
        color: '#2d3436',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
});

export default SearchBar;