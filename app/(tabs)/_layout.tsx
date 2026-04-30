import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#DCF21E",   // Chartreuse Ramo
        tabBarInactiveTintColor: "#D3CBBF", // Sable
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#003c38",       // Vert forêt
          borderTopColor: "#00524d",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Session",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="leaf.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="comptage"
        options={{
          title: "Comptage",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="pencil.and.list.clipboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donnees"
        options={{
          title: "Données",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="chart.bar.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
