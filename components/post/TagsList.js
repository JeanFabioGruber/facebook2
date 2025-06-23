import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TagsList = ({ tags }) => {
    const navigation = useNavigation();
    
    if (!Array.isArray(tags) || tags.length === 0) return null;
    
    const handleTagPress = (tag) => {
        navigation.navigate('TagPostsScreen', { tag });
    };
    
    return (
        <View style={styles.container}>
            {tags.map((tag, idx) => (
                <TouchableOpacity 
                    key={idx} 
                    style={styles.tagContainer}
                    onPress={() => handleTagPress(tag)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.tagText}>#{tag}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    tagContainer: {
        backgroundColor: '#e0f7fa',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        color: '#00796b',
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default TagsList;