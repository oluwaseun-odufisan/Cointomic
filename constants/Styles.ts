import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

export const defaultStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background, // #FFF8F0 (Warm Cream) for a cozy, orange-friendly background
        padding: 16,
    },
    header: {
        fontSize: 40,
        fontWeight: "700",
        color: Colors.dark, // #1F1A15 (Warm Black) for high-contrast, readable headers
    },
    pillButton: {
        padding: 10,
        height: 60,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary, // #FF6600 (Dark Saturated Orange) for prominent buttons
    },
    textLink: {
        color: Colors.primary, // #FF6600 (Dark Saturated Orange) for links to align with brand
        fontSize: 18,
        fontWeight: "500",
    },
    descriptionText: {
        fontSize: 18,
        marginTop: 20,
        color: Colors.gray, // #7A6B5D (Warm Taupe Gray) for secondary text
    },
    buttonText: {
        color: Colors.background, // #FFF8F0 (Warm Cream) for text on primary-colored buttons
        fontSize: 18,
        fontWeight: "500",
    },
    pillButtonSmall: {
        paddingHorizontal: 20,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primaryMuted, // #FF9B66 (Muted Coral Orange) for secondary buttons
    },
    buttonTextSmall: {
        color: Colors.dark, // #1F1A15 (Warm Black) for contrast on muted buttons
        fontSize: 16,
        fontWeight: "500",
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "bold",
        margin: 20,
        marginBottom: 10,
        color: Colors.dark, // #1F1A15 (Warm Black) for section headers
    },
    block: {
        marginHorizontal: 20,
        padding: 14,
        backgroundColor: Colors.lightGray, // #E6DED5 (Soft Warm Gray) for subtle card backgrounds
        borderRadius: 16,
        gap: 20,
    },
});