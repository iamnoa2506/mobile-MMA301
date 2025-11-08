import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { shopApi } from "../../api/client";

export default function ShopPackageScreen({ navigation }) {
  const [availablePackages, setAvailablePackages] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      try {
        const availableRes = await shopApi.getAvailablePackages();
        // Backend returns: { success: true, data: { packages: [...] } }
        setAvailablePackages(availableRes?.data?.packages || []);
      } catch (e) {
        console.log("Available packages error:", e?.message || e);
        setAvailablePackages([]);
      }
      
      try {
        const myRes = await shopApi.getMyPackages();
        // Backend returns: { success: true, data: { packages: [...] } }
        setMyPackages(myRes?.data?.packages || []);
      } catch (e) {
        console.log("My packages error:", e?.message || e);
        setMyPackages([]);
      }
    } catch (e) {
      console.log("Load packages error:", e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    Alert.alert(
      "Xác nhận mua gói",
      "Bạn có chắc chắn muốn mua gói này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Mua",
          onPress: async () => {
            try {
              setPurchasing(packageId);
              await shopApi.purchasePackage({ packageId });
              Alert.alert("Thành công", "Mua gói thành công!", [
                {
                  text: "OK",
                  onPress: () => {
                    loadPackages();
                    navigation.navigate("ShopHome");
                  },
                },
              ]);
            } catch (e) {
              Alert.alert(
                "Lỗi",
                e?.message || "Không thể mua gói. Vui lòng kiểm tra số dư ví."
              );
            } finally {
              setPurchasing(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gói đăng bài</Text>
        <TouchableOpacity onPress={loadPackages} style={styles.refreshBtn} disabled={loading}>
          <Text style={styles.refreshText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </View>

      {/* My Packages Section */}
      {myPackages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gói của tôi</Text>
          {myPackages.map((pkg) => (
            <View key={pkg._id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.packageName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    pkg.status === "ACTIVE"
                      ? styles.statusActive
                      : styles.statusExpired,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {pkg.status === "ACTIVE" ? "Đang dùng" : "Hết hạn"}
                  </Text>
                </View>
              </View>
              <Text style={styles.packageType}>{pkg.packageType}</Text>
              <View style={styles.packageStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Tổng bài</Text>
                  <Text style={styles.statValue}>{pkg.freePosts || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Đã dùng</Text>
                  <Text style={styles.statValue}>{pkg.usedPosts || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Còn lại</Text>
                  <Text style={[styles.statValue, styles.statRemaining]}>
                    {pkg.remainingPosts || 0}
                  </Text>
                </View>
              </View>
              {pkg.expiresAt && (
                <Text style={styles.expiryDate}>
                  Hết hạn: {new Date(pkg.expiresAt).toLocaleDateString("vi-VN")}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Available Packages Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gói có sẵn</Text>
        {availablePackages.length > 0 ? (
          availablePackages.map((pkg) => (
            <View key={pkg._id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{pkg.name || pkg.packageName}</Text>
                <Text style={styles.packagePrice}>
                  {pkg.price?.toLocaleString("vi-VN")} đ
                </Text>
              </View>
              <Text style={styles.packageType}>{pkg.type || pkg.packageType}</Text>
              <Text style={styles.packageDescription}>
                {pkg.description || `Gói ${pkg.freePosts || 0} bài đăng`}
              </Text>
              <View style={styles.packageFeatures}>
                <Text style={styles.featureText}>
                  📝 {pkg.freePosts || 0} bài đăng
                </Text>
                {pkg.duration && (
                  <Text style={styles.featureText}>
                    ⏰ Thời hạn: {pkg.duration} ngày
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.purchaseBtn,
                  purchasing === pkg._id && styles.purchaseBtnDisabled,
                ]}
                onPress={() => handlePurchase(pkg._id)}
                disabled={purchasing === pkg._id}
              >
                {purchasing === pkg._id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.purchaseBtnText}>Mua gói</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Chưa có gói nào</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    flex: 1,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00b894",
  },
  packageType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  packageStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginVertical: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  statRemaining: {
    color: "#00b894",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#d4edda",
  },
  statusExpired: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#155724",
  },
  expiryDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  packageFeatures: {
    marginBottom: 16,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  purchaseBtn: {
    backgroundColor: "#00b894",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  purchaseBtnDisabled: {
    opacity: 0.7,
  },
  purchaseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
  },
});

