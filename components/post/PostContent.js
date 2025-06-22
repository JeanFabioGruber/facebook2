import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TagsList from './TagsList';

const PostContent = ({ description, location, tags }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.description}>{description}</Text>
            
            <TagsList tags={tags} />
            
            {location && (
                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color="#636e72" />
                    <Text style={styles.locationText}>{location}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    description: {
        fontSize: 16,
        color: '#2d3436',
        lineHeight: 22,
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
    },
});

export default PostContent;