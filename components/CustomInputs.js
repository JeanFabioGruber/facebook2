
import { TextInput, StyleSheet } from "react-native";

export function EmailInput ({ placeholder = "E-mail", value, setValue }) {
    return (
        <TextInput
            placeholder={placeholder}
            placeholderTextColor="black"
            style={styles.input}
            inputMode="email"
            autoCapitalize="none"
            onChangeText={setValue}
            value={value}
        />
    )
}

export function PasswordInput ({ placeholder = "Senha", value, setValue }) {
    return (
        <TextInput
            placeholder={placeholder}
            placeholderTextColor="black"
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry={true}
            onChangeText={setValue}
            value={value}
        />
    )
}

export function CustomTextInput ({ placeholder, value, setValue }) {
    return (
        <TextInput
            placeholder={placeholder}
            placeholderTextColor="black"
            style={styles.input}
            onChangeText={setValue}
            value={value}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        width: '100%',
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 15,
        padding: 15,
        fontSize: 20,
        color: 'black',
        marginVertical: 15
    },
})