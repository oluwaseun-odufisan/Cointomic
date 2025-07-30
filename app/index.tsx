import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useAssets } from 'expo-asset';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Link } from 'expo-router';

const Index = () => {
    const [assets] = useAssets([require('@/assets/videos/cointomic.mp4')]);
    
    // Initialize video player with the asset URI or an empty string as a fallback
    const player = useVideoPlayer({ uri: assets?.[0]?.uri || '' });

    // Configure player settings when assets and player are ready
    useEffect(() => {
        if (assets && player) {
            player.loop = true;
            player.muted = true;
            player.play();
        }
    }, [assets, player]);

    return (
        <View style={styles.container}>
            {assets && player && (
                <VideoView
                    style={styles.video}
                    player={player}
                    contentFit="cover"
                    nativeControls={false}
                    allowsFullscreen={false}
                />
            )}
            <View style={styles.buttonContainer}>
                <Link
                    href={'/signup'}
                    style={styles.signupButton}
                    asChild
                >
                    <TouchableOpacity>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>
                </Link>
                <Link
                    href={'/login'}
                    style={styles.loginButton}
                    asChild
                >
                    <TouchableOpacity>
                        <Text style={styles.buttonText}>Log in</Text>
                    </TouchableOpacity>
                </Link>
            </View>
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
    buttonContainer: {
        position: 'absolute',
        top: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    loginButton: {
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fff',
    },
    signupButton: {
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fff',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default Index;