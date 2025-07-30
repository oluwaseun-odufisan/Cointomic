import { View, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useAssets } from 'expo-asset';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useRouter } from 'expo-router';

const Index = () => {
    const [assets, assetError] = useAssets([require('@/assets/videos/cointomic.mp4')]);
    const router = useRouter();

    // Initialize video player
    const player = useVideoPlayer({ uri: assets?.[0]?.uri || '' });

    // Configure player settings and navigate after 5 seconds
    useEffect(() => {
        // Navigate to login screen after 5 seconds, regardless of video status
        const timer = setTimeout(() => {
            router.push('/login');
        }, 5000);

        // Try to set up video player
        if (assets && !assetError && player) {
            try {
                player.loop = true;
                player.muted = true;
                player.play();
            } catch (error) {
                console.error('Error setting up video player:', error);
                // Navigation will still occur after 5 seconds
            }
        } else if (assetError) {
            console.error('Asset loading error:', assetError);
            // Navigation will still occur after 5 seconds
        }

        return () => clearTimeout(timer);
    }, [assets, assetError, player, router]);

    return (
        <View style={styles.container}>
            {assets && !assetError && (
                <VideoView
                    style={styles.video}
                    player={player}
                    contentFit="cover"
                    nativeControls={false}
                    allowsFullscreen={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
});

export default Index;