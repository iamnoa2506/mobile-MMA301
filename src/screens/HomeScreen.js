import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("auth_user");
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        
        // Redirect based on role
        if (userData?.roleName === "SHOP") {
          navigation.reset({
            index: 0,
            routes: [{ name: "ShopHome" }],
          });
        } else if (userData?.roleName === "ADMIN") {
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminHome" }],
          });
        } else if (userData?.roleName === "CUSTOMER") {
          navigation.reset({
            index: 0,
            routes: [{ name: "CustomerHome" }],
          });
        }
      }
    })();
  }, []);

  return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator size="large" color="#00b894" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});



