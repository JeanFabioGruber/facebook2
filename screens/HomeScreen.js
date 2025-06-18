import { useState, useEffect } from "react";
import { SafeAreaView, Text, StyleSheet, View, FlatList, Alert, TouchableOpacity, Image } from "react-native";
import { db } from '../firebase';
import { SecondaryButton } from "../components/Buttons";
import { collection, getDocs, query, orderBy, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                loadPosts();
            }
        });

        return unsubscribe;
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const postsQuery = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc')
            );
            
            const snapshot = await getDocs(postsQuery);
            const postsData = [];
            
            for (const docSnap of snapshot.docs) {
                const postData = { id: docSnap.id, ...docSnap.data() };
                
                // Buscar dados do usuário que publicou
                if (postData.userId) {
                    const userDoc = await getDoc(doc(db, 'users', postData.userId));
                    if (userDoc.exists()) {
                        postData.author = userDoc.data();
                    }
                }
                
                postsData.push(postData);
            }
            
            setPosts(postsData);
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            Alert.alert('Erro', 'Não foi possível carregar as publicações');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (!user) return;
        
        try {
            const postRef = doc(db, 'posts', postId);
            const postDoc = await getDoc(postRef);
            
            if (postDoc.exists()) {
                const postData = postDoc.data();
                const likedBy = postData.likedBy || [];
                
                if (likedBy.includes(user.uid)) {
                    // Remover curtida
                    const updatedLikedBy = likedBy.filter(uid => uid !== user.uid);
                    await updateDoc(postRef, {
                        likes: increment(-1),
                        likedBy: updatedLikedBy
                    });
                } else {
                    // Adicionar curtida
                    await updateDoc(postRef, {
                        likes: increment(1),
                        likedBy: [...likedBy, user.uid]
                    });
                }
                
                // Recarregar posts
                loadPosts();
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error);
            Alert.alert('Erro', 'Não foi possível curtir a publicação');
        }
    };

    const openProfile = (userId) => {
        if (userId === user?.uid) {
            navigation.navigate('MinhaConta');
        } else {
            navigation.navigate('Profile', { userId });
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderPost = ({ item }) => {
        const isLiked = item.likedBy?.includes(user?.uid) || false;
        
        return (
            <View style={styles.postContainer}>
                <TouchableOpacity 
                    style={styles.profileHeader}
                    onPress={() => openProfile(item.userId)}
                >
                    <View style={styles.profileInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.author?.nome?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.authorName}>
                                {item.author?.nome || 'Usuário'}
                            </Text>
                            <Text style={styles.postDate}>
                                {formatDate(item.createdAt)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
                )}

                <View style={styles.postContent}>
                    <Text style={styles.postDescription}>{item.description}</Text>
                    
                    {item.location && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={16} color="#636e72" />
                            <Text style={styles.locationText}>{item.location}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.postActions}>
                    <TouchableOpacity 
                        style={styles.likeButton}
                        onPress={() => handleLike(item.id)}
                    >
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isLiked ? "#e74c3c" : "#636e72"} 
                        />
                        <Text style={[styles.likeCount, isLiked && styles.likedText]}>
                            {item.likes || 0}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Carregando publicações...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Feed</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('MinhaConta')}
                    style={styles.profileButton}
                >
                    <Ionicons name="person-circle-outline" size={32} color="#1abc9c" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                refreshing={loading}
                onRefresh={loadPosts}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma publicação encontrada</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />           
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1abc9c',
    },
    profileButton: {
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postContainer: {
        backgroundColor: '#fff',
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileHeader: {
        padding: 16,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1abc9c',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    authorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    postDate: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    postImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    postContent: {
        padding: 16,
    },
    postDescription: {
        fontSize: 16,
        color: '#2d3436',
        lineHeight: 22,
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#636e72',
        marginLeft: 4,
    },
    postActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeCount: {
        fontSize: 16,
        color: '#636e72',
        marginLeft: 8,
        fontWeight: '600',
    },
    likedText: {
        color: '#e74c3c',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#636e72',
        textAlign: 'center',
    },
    bottomButtons: {
        padding: 16,
        backgroundColor: '#fff',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});