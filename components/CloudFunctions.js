const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Webhook para quando um post é curtido
exports.onPostLiked = functions.firestore
    .document('posts/{postId}')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        
        // Verificar se o número de likes aumentou
        if (afterData.likes > beforeData.likes) {
            console.log(`Post ${context.params.postId} foi curtido!`);
            
            // Aqui você pode adicionar lógica adicional como:
            // - Enviar notificação push
            // - Atualizar estatísticas
            // - Registrar evento de analytics
        }
        
        return null;
    });

// Webhook para quando um novo post é criado
exports.onPostCreated = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snap, context) => {
        const postData = snap.data();
        console.log(`Novo post criado por ${postData.userId}`);   
        return null;
    });