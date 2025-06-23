import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import MinhaContaScreen from "../screens/MinhaContaScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AddPostScreen from "../screens/AddPostScreen";
import CommentsScreen from "../screens/CommentsScreen";
import TagPostsScreen from '../screens/TagPostsScreen';

export default function AppNavigator () {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MinhaConta" component={MinhaContaScreen} options={{ headerShown: false }} />            
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddPostScreen" component={AddPostScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CommentsScreen" component={CommentsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TagPostsScreen" component={TagPostsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}