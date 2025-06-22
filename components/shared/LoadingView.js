import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingView = ({ message = 'Carregando...' }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#1abc9c" />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        color: '#636e72',
    },
});

export default LoadingView;