import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PrimaryButton, SecondaryButton, DangerButton } from '../Buttons';

const ActionButtons = ({ 
    isEditing, 
    onSave, 
    onCancel, 
    onLogout,
    loading = false
}) => {
    return (
        <View style={styles.buttonSection}>
            {isEditing ? (
                <>
                    <PrimaryButton 
                        text={loading ? "Salvando..." : "Salvar Alterações"} 
                        action={onSave}
                    />
                    <SecondaryButton text="Cancelar" action={onCancel} />
                </>
            ) : (
                <DangerButton text="Sair da Conta" action={onLogout} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    buttonSection: { 
        paddingHorizontal: 20, 
        paddingBottom: 30, 
        gap: 10 
    },
});

export default ActionButtons;