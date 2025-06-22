import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const LoginHeader = ({ title, subtitle }) => {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 38,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#1abc9c'
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        color: '#636e72'
    }
});

export default LoginHeader;