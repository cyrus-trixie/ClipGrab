import { Text, TextInput, View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import React, { useState } from 'react'; 
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto'; 

// --- Constants for Clean Design ---
const SUCCESS_COLOR = '#058a31'; 
const DANGER_COLOR = '#E53935';
const DARK_TEXT = '#333333';
const LIGHT_TEXT = '#666666';

// 🚨 CRITICAL: REPLACE THIS WITH YOUR LOCAL IP ADDRESS 🚨
// Example for Android Emulator: 'http://10.0.2.2:3000/download-video'
// Example for Physical Device/Simulator: 'http://192.168.1.X:3000/download-video'
const API_URL = 'http://YOUR_LOCAL_IP_ADDRESS:3000/download-video'; 


export default function Index() {
    const [videoLink, setVideoLink] = useState('');
    const [isLoading, setIsLoading] = useState(false); // New loading state

    // ** 🛠️ CORE DOWNLOAD LOGIC FUNCTION 🛠️ **
    const handleDownload = async (platform) => {
        if (!videoLink) {
            Alert.alert("Error", "Please paste a video link first.");
            return;
        }

        let platformPattern;
        let platformName;

        // Simple URL validation logic
        if (platform === 'youtube') {
            platformPattern = /(youtube\.com|youtu\.be)/i;
            platformName = 'YouTube';
        } else if (platform === 'instagram') {
            platformPattern = /(instagram\.com\/reel)/i;
            platformName = 'Instagram Reel';
        } else if (platform === 'tiktok') {
            platformPattern = /(tiktok\.com)/i;
            platformName = 'TikTok';
        } else {
            return;
        }

        if (!platformPattern.test(videoLink)) {
            // Notify the user if they clicked the wrong button for the pasted link
            Alert.alert(
                "Mismatched Link", 
                `The link you pasted doesn't look like a ${platformName} link. Please use the correct button.`
            );
            return;
        }
        
        // --- API CALL INITIATION ---
        setIsLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoURL: videoLink,
                    platform: platform,
                }),
            });

            // The backend is designed to stream the file directly. 
            // In a real mobile app, you would handle the file download here (e.g., using a library like rn-fetch-blob).
            // For now, we will handle the API response JSON.
            
            if (response.ok) {
                // Since the server streams the file, a successful request usually means the stream started.
                // We'll read the JSON response for confirmation messages, especially for platforms not yet implemented.
                const result = await response.json(); 

                if (result.success) {
                    Alert.alert("Download Initiated", `${platformName} download process started on the server!`);
                } else {
                    // This handles the server-side errors, like "Download for tiktok is not yet implemented"
                    Alert.alert("Server Error", result.message);
                }
                
            } else {
                // Handles 4xx or 5xx status codes from the server
                const errorData = await response.json();
                Alert.alert("Server Error", `Status ${response.status}: ${errorData.message || 'Unknown server error.'}`);
            }

        } catch (error) {
            console.error('Network or API call failed:', error);
            Alert.alert("Connection Error", "Could not connect to the download server. Please ensure the API is running and the IP address is correct.");
        } finally {
            setIsLoading(false);
        }
        // ** ------------------------------------ **
    };

    const isButtonDisabled = isLoading || !videoLink;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>ClipGrab</Text>
      
      {/* App icons */}
      <View style={styles.AppsContainer}>
        <View style={styles.individualAppContainer}>
          <FontAwesome name="youtube" size={40} color="#FF0000" />
          <Text style={styles.AppText}>YouTube</Text>
        </View>

        <View style={styles.individualAppContainer}>
          <FontAwesome name="instagram" size={40} color="#E4405F" />
          <Text style={styles.AppText}>Instagram Reels</Text>
        </View>

        <View style={styles.individualAppContainer}>
          <Fontisto name="tiktok" size={40} color={DARK_TEXT} /> 
          <Text style={styles.AppText}>TikTok</Text>
        </View>
      </View>

      {/* Search Bar and Instructions */}
      <View style={styles.InputSection}>
        <View style={styles.SearchBarContainer}>
          <TextInput 
                value={videoLink}
                onChangeText={setVideoLink}
            placeholder="Paste Video Link Here..." 
            placeholderTextColor={LIGHT_TEXT} 
            style={styles.SearchBar} 
                editable={!isLoading} // Disable input while loading
          />
        </View>

        <View style={styles.InstructionsContainer}>
          <Text style={styles.InstructionText}>1. Paste link</Text>
          <Text style={styles.InstructionText}>2. Tap the platform button below</Text>
          <Text style={styles.InstructionText}>3. Enjoy Offline</Text>
        </View>
      </View> 

      {/* Three Download Buttons Container */}
      <View style={styles.ButtonStripContainer}>
        
            {/* Button 1: YouTube */}
        <TouchableOpacity 
            style={[styles.PlatformButton, {backgroundColor: '#FF0000', opacity: isButtonDisabled ? 0.5 : 1}]} 
            activeOpacity={0.8}
            onPress={() => handleDownload('youtube')}
            disabled={isButtonDisabled}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <FontAwesome name="youtube" size={18} color="#ffffff" /> 
            )}
          <Text style={styles.ButtonTextSmall}>YouTube MP4</Text>
        </TouchableOpacity>

            {/* Button 2: Instagram */}
        <TouchableOpacity 
            style={[styles.PlatformButton, {backgroundColor: DANGER_COLOR, opacity: isButtonDisabled ? 0.5 : 1}]} 
            activeOpacity={0.8}
            onPress={() => handleDownload('instagram')}
            disabled={isButtonDisabled}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <FontAwesome name="instagram" size={18} color="#ffffff" /> 
            )}
          <Text style={styles.ButtonTextSmall}>IG Reel</Text>
        </TouchableOpacity>

            {/* Button 3: TikTok */}
        <TouchableOpacity 
            style={[styles.PlatformButton, {backgroundColor: DARK_TEXT, opacity: isButtonDisabled ? 0.5 : 1}]} 
            activeOpacity={0.8}
            onPress={() => handleDownload('tiktok')}
            disabled={isButtonDisabled}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Fontisto name="tiktok" size={18} color="#ffffff" /> 
            )}
          <Text style={styles.ButtonTextSmall}>TikTok MP4</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 60,
      backgroundColor: '#ffffff',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "900",
      color: DARK_TEXT,
      marginBottom: 50,
    },
    AppsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '85%',
      marginBottom: 50,
    },
    individualAppContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    AppText: {
      marginTop: 8,
      fontSize: 13,
      color: LIGHT_TEXT,
      fontWeight: '600',
    },
    InputSection: {
        width: '90%',
        alignItems: 'center',
    },
    SearchBarContainer:{
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
    },
    SearchBar:{
        paddingHorizontal: 20,
        paddingVertical: 15,
        width:"100%",
        borderRadius: 12,
        fontSize: 16,
        color: DARK_TEXT,
        height: 50,
    },
    InstructionsContainer: {
        width: '100%',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    InstructionText: {
        fontSize: 14,
        color: LIGHT_TEXT,
        lineHeight: 22,
    },
    ButtonStripContainer: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    PlatformButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderRadius: 8,
        flex: 1, 
        marginHorizontal: 5, 
    },
    ButtonTextSmall: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5, 
    }
});