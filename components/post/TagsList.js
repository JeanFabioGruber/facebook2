import { View, Text, StyleSheet } from 'react-native';

const TagsList = ({ tags }) => {
    if (!Array.isArray(tags) || tags.length === 0) return null;
    
    return (
        <View style={styles.container}>
            {tags.map((tag, idx) => (
                <View key={idx} style={styles.tagContainer}>
                    <Text style={styles.tagText}>#{tag}</Text>
                </View>
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