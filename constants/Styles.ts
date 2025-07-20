import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

export const defaultStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background, // #F8F7F4 (Off-White) for a warm, clean background
        padding: 16,
    },
    header: {
        fontSize: 40,
        fontWeight: "700",
        color: Colors.dark, // #1A1C1E (Deep Charcoal) for high-contrast, readable headers
    },
    pillButton: {
        padding: 10,
        height: 60,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primary, // #D4A017 (Gold Amber) for prominent buttons
    },
    textLink: {
        color: Colors.primary, // #D4A017 (Gold Amber) for links to align with brand
        fontSize: 18,
        fontWeight: "500",
    },
    descriptionText: {
        fontSize: 18,
        marginTop: 20,
        color: Colors.gray, // #6B6F66 (Warm Gray) for secondary text
    },
    buttonText: {
        color: Colors.background, // #F8F7F4 (Off-White) for text on primary-colored buttons
        fontSize: 18,
        fontWeight: "500",
    },
    pillButtonSmall: {
        paddingHorizontal: 20,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.primaryMuted, // #E8C680 (Soft Amber) for secondary buttons
    },
    buttonTextSmall: {
        color: Colors.dark, // #1A1C1E (Deep Charcoal) for contrast on muted buttons
        fontSize: 16,
        fontWeight: "500",
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "bold",
        margin: 20,
        marginBottom: 10,
        color: Colors.dark, // #1A1C1E (Deep Charcoal) for section headers
    },
    block: {
        marginHorizontal: 20,
        padding: 14,
        backgroundColor: Colors.lightGray, // #D9D9D5 (Pale Gray) for subtle card backgrounds
        borderRadius: 16,
        gap: 20,
    },
});
