import { TouchableOpacity, Text, StyleSheet } from "react-native";

export const PrimaryButton = ({ text, action, disabled = false }) => {
    return (
        <TouchableOpacity
            style={[
                styles.primaryButton,
                disabled && styles.disabledButton
            ]}
            onPress={action}
            disabled={disabled}  
        >
            <Text style={[
                styles.buttonText,
                disabled && styles.disabledButtonText 
            ]}>
                {text}
            </Text>
        </TouchableOpacity>
    );
};

export function SecondaryButton ({ action, text }) {
    return (
        <TouchableOpacity
            onPress={action}
            style={[styles.button, styles.secondaryButton]}
        >
            <Text style={[styles.buttonText, styles.secondaryButtonText]} >{text}</Text>
        </TouchableOpacity>
    )
}

export function DangerButton ({ action, text }) {
    return (
        <TouchableOpacity
            onPress={action}
            style={[styles.button, styles.dangerButton]}
        >
            <Text style={[styles.buttonText]} >{text}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        padding: 18,
        borderRadius: 30, 
        marginVertical: 15,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    primaryButton: {
        backgroundColor: '#1abc9c',
        padding: 18,
        borderRadius: 30, 
        marginVertical: 15,
        elevation: 3,
    },
    disabledButton: {
        backgroundColor: '#a3e4d7',
        opacity: 0.7,
    },
    disabledButtonText: {
        opacity: 0.9,
    },
    secondaryButton: {
        borderColor: '#1abc9c',
        borderWidth: 2,
        backgroundColor: 'white',
    },
    secondaryButtonText: {
        color: '#1abc9c',
    },
    dangerButton: {
        backgroundColor: '#e74c3c'
    }
})