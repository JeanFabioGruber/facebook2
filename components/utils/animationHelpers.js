import { Animated } from 'react-native';

export function setupScrollAnimation(scrollY, headerTranslateY, lastScrollY) {
    return Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;
                
                if (diff > 0 && currentScrollY > 50) {                   
                    Animated.timing(headerTranslateY, {
                        toValue: -80,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                } else if (diff < 0) {                  
                    Animated.timing(headerTranslateY, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }
                
                lastScrollY.current = currentScrollY;
            },
        }
    );
}