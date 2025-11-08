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
import { shopApi, authApi } from "../../api/client";

export default function ShopHomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [packages, setPackages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("auth_user");
      if (stored) setUser(JSON.parse(stored));

      // Load wallet balance
      try {
        const walletData = await shopApi.getWallet();
        // Backend returns: { success: true, data: { wallet } }
        setWallet(walletData?.data?.wallet || { balance: 0 });
      } catch (e) {
        console.log("Wallet error:", e?.message || e);
        setWallet({ balance: 0 });
      }

      // Load active packages
      try {
        const packagesData = await shopApi.getMyPackages();
        // Backend returns: { success: true, data: { packages: [...] } }
        setPackages(packagesData?.data?.packages || []);
      } catch (e) {
        console.log("Packages error:", e?.message || e);
        setPackages([]);
      }

      // Load posts
      try {
        const postsData = await shopApi.getMyPosts();
        // Backend returns: { success: true, data: { products: [...] } }
        setPosts(postsData?.data?.products || []);
      } catch (e) {
        console.log("Posts error:", e?.message || e);
        setPosts([]);
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

  const totalRemainingPosts = packages.reduce(
    (sum, pkg) => sum + (pkg.remainingPosts || 0),
    0
  );

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
          <Text style={styles.shopName}>{user?.email || "Shop"}</Text>
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

      {/* Wallet Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ShopWallet")}
      >
        <Text style={styles.cardTitle}>Ví của tôi</Text>
        <Text style={styles.balance}>
          {wallet.balance?.toLocaleString("vi-VN") || 0} đ
        </Text>
        <Text style={styles.cardSubtitle}>Nhấn để nạp tiền</Text>
      </TouchableOpacity>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalRemainingPosts}</Text>
          <Text style={styles.statLabel}>Bài đăng còn lại</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{packages.length}</Text>
          <Text style={styles.statLabel}>Gói đang dùng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{posts.length}</Text>
          <Text style={styles.statLabel}>Bài đã đăng</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("ShopPackage")}
        >
          <Text style={styles.actionBtnText}>📦 Mua gói đăng bài</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("ShopCreatePost")}
        >
          <Text style={styles.actionBtnText}>➕ Tạo bài đăng mới</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("ShopPosts")}
        >
          <Text style={styles.actionBtnText}>📋 Quản lý bài đăng</Text>
        </TouchableOpacity>
      </View>

      {/* Active Packages */}
      {packages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gói đang sử dụng</Text>
          {packages.slice(0, 3).map((pkg) => (
            <View key={pkg._id} style={styles.packageItem}>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>{pkg.packageName}</Text>
                <Text style={styles.packageType}>{pkg.packageType}</Text>
              </View>
              <View style={styles.packageStats}>
                <Text style={styles.packageRemaining}>
                  Còn: {pkg.remainingPosts || 0} bài
                </Text>
              </View>
            </View>
          ))}
          {packages.length > 3 && (
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => navigation.navigate("ShopPackage")}
            >
              <Text style={styles.moreBtnText}>
                Xem thêm {packages.length - 3} gói khác
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  shopName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
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
  card: {
    backgroundColor: "#00b894",
    margin: 20,
    padding: 20,
    borderRadius: 16,
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
  balance: {
    color: "#fff",
    fontSize: 32,
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
    color: "#00b894",
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
  packageItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  packageType: {
    fontSize: 12,
    color: "#666",
  },
  packageStats: {
    alignItems: "flex-end",
  },
  packageRemaining: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00b894",
  },
  moreBtn: {
    padding: 12,
    alignItems: "center",
  },
  moreBtnText: {
    color: "#0984e3",
    fontSize: 14,
    fontWeight: "600",
  },
});

