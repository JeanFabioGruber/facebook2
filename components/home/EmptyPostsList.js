import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyPostsList = () => {
    return (
        <View style={styles.container}>
            <Ionicons name="images-outline" size={48} color="#b2bec3" />
            <Text style={styles.text}>Nenhum post encontrado</Text>
            <Text style={styles.subText}>Seja o primeiro a compartilhar algo!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    text: {
        fontSize: 18,
        color: '#b2bec3',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '600',
    },
    subText: {
        fontSize: 14,
        color: '#b2bec3',
        textAlign: 'center',
        marginTop: 5,
    },
});

export default EmptyPostsList;