import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileStats = ({ postsCount }) => {
    return (
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    statLabel: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 2,
    },
});

export default ProfileStats;