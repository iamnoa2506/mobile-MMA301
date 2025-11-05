import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/client";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("auth_user");
      if (stored) setUser(JSON.parse(stored));
    })();
  }, []);

  const onLogout = async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xin chào</Text>
      <Text>{user?.email || "User"}</Text>
      <View style={{ height: 16 }} />
      <Button title="Đăng xuất" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
});



