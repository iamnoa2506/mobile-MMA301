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
import { adminApi } from "../../api/client";

export default function AdminRevenueScreen({ navigation }) {
  const [revenue, setRevenue] = useState({
    totalRevenue: 0,
    transactions: [],
    packageStats: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRevenue();
  }, []);

  const loadRevenue = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRevenue();
      setRevenue(res?.data || { totalRevenue: 0, transactions: [], packageStats: [] });
    } catch (e) {
      console.log("Revenue error:", e?.message || e);
      setRevenue({ totalRevenue: 0, transactions: [], packageStats: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadRevenue} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Doanh thu</Text>
        <TouchableOpacity onPress={loadRevenue} style={styles.refreshBtn} disabled={loading}>
          <Text style={styles.refreshText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </View>

      {/* Total Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.cardTitle}>Tổng doanh thu</Text>
        <Text style={styles.revenueAmount}>
          {revenue.totalRevenue?.toLocaleString("vi-VN") || 0} đ
        </Text>
        <Text style={styles.cardSubtitle}>Từ việc bán gói package</Text>
      </View>

      {/* Package Stats */}
      {revenue.packageStats && revenue.packageStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê theo gói</Text>
          {revenue.packageStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statPackageName}>{stat.packageName || "Gói"}</Text>
                <Text style={styles.statCount}>{stat.count || 0} giao dịch</Text>
              </View>
              <Text style={styles.statRevenue}>
                {stat.revenue?.toLocaleString("vi-VN") || 0} đ
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
        {revenue.transactions && revenue.transactions.length > 0 ? (
          revenue.transactions.map((transaction) => (
            <View key={transaction._id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionType}>
                  {transaction.type === "PURCHASE_PACKAGE" ? "Mua gói" : "Giao dịch"}
                </Text>
                <Text style={styles.transactionAmount}>
                  +{Math.abs(transaction.amount)?.toLocaleString("vi-VN")} đ
                </Text>
              </View>
              <Text style={styles.transactionDescription}>
                {transaction.description || "Giao dịch mua gói"}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.createdAt).toLocaleString("vi-VN")}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
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
  statCard: {
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
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statPackageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  statCount: {
    fontSize: 12,
    color: "#666",
  },
  statRevenue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6c5ce7",
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00b894",
  },
  transactionDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
  },
});


