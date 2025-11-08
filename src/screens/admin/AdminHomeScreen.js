import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { adminApi, authApi } from "../../api/client";

export default function AdminHomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("auth_user");
      if (stored) setUser(JSON.parse(stored));

      // Load stats
      try {
        const statsData = await adminApi.getStats();
        setStats(statsData?.data || stats);
      } catch (e) {
        console.log("Stats error:", e?.message || e);
      }

      // Load revenue
      try {
        const revenueData = await adminApi.getRevenue();
        setStats((prev) => ({
          ...prev,
          totalRevenue: revenueData?.data?.totalRevenue || 0,
        }));
      } catch (e) {
        console.log("Revenue error:", e?.message || e);
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.adminName}>{user?.email || "Admin"}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadData} style={styles.refreshBtn} disabled={loading}>
            <Text style={styles.refreshText}>🔄 Tải lại</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.cardTitle}>Tổng doanh thu</Text>
        <Text style={styles.revenueAmount}>
          {stats.totalRevenue?.toLocaleString("vi-VN") || 0} đ
        </Text>
        <Text style={styles.cardSubtitle}>Từ việc bán gói package</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Tổng User</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalShops}</Text>
          <Text style={styles.statLabel}>Shop</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCustomers}</Text>
          <Text style={styles.statLabel}>Customer</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quản lý</Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("AdminProducts")}
        >
          <Text style={styles.actionBtnText}>📦 Duyệt sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("AdminUsers")}
        >
          <Text style={styles.actionBtnText}>👥 Quản lý User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("AdminRevenue")}
        >
          <Text style={styles.actionBtnText}>💰 Xem doanh thu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  adminName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e3f2fd",
  },
  refreshText: {
    color: "#0984e3",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  logoutText: {
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "600",
  },
  revenueCard: {
    backgroundColor: "#6c5ce7",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  revenueAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6c5ce7",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "600",
  },
});


