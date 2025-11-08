import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { shopApi } from "../../api/client";

export default function ShopContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("PENDING"); // PENDING, CONTACTED, CLOSED

  useEffect(() => {
    loadContacts();
  }, [filter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await shopApi.getContacts({ status: filter });
      console.log("Contacts response:", JSON.stringify(res?.data?.contacts || [], null, 2));
      setContacts(res?.data?.contacts || []);
    } catch (e) {
      console.log("Contacts error:", e?.message || e);
      Alert.alert("Lỗi", "Không thể tải danh sách liên hệ");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      await shopApi.updateContactStatus(contactId, { status: newStatus });
      Alert.alert("Thành công", "Cập nhật trạng thái thành công");
      loadContacts();
    } catch (e) {
      Alert.alert("Lỗi", e?.message || "Không thể cập nhật trạng thái");
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Chờ xử lý",
      CONTACTED: "Đã liên hệ",
      CLOSED: "Đã đóng",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#ffc107",
      CONTACTED: "#00b894",
      CLOSED: "#666",
    };
    return colors[status] || "#666";
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadContacts} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông tin liên hệ</Text>
        <TouchableOpacity onPress={loadContacts} style={styles.refreshBtn} disabled={loading}>
          <Text style={styles.refreshText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "PENDING" && styles.filterTabActive]}
          onPress={() => setFilter("PENDING")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "PENDING" && styles.filterTabTextActive,
            ]}
          >
            Chờ xử lý
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "CONTACTED" && styles.filterTabActive]}
          onPress={() => setFilter("CONTACTED")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "CONTACTED" && styles.filterTabTextActive,
            ]}
          >
            Đã liên hệ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "CLOSED" && styles.filterTabActive]}
          onPress={() => setFilter("CLOSED")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "CLOSED" && styles.filterTabTextActive,
            ]}
          >
            Đã đóng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      {loading && contacts.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00b894" />
        </View>
      ) : contacts.length > 0 ? (
        <View style={styles.contactsContainer}>
          {contacts.map((contact) => (
            <View key={contact._id} style={styles.contactCard}>
              {/* Product Info */}
              {contact.productId && (
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {contact.productId.name || "N/A"}
                  </Text>
                  {contact.productId.price && (
                    <Text style={styles.productPrice}>
                      {contact.productId.price.amount?.toLocaleString("vi-VN") || 0} đ
                    </Text>
                  )}
                </View>
              )}

              {/* Customer Info */}
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{contact.customerName}</Text>
                <Text style={styles.customerDetail}>📞 {contact.customerPhone}</Text>
                <Text style={styles.customerDetail}>✉️ {contact.customerEmail}</Text>
                {contact.message && (
                  <Text style={styles.customerMessage}>{contact.message}</Text>
                )}
              </View>

              {/* Status and Actions */}
              <View style={styles.contactFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(contact.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(contact.status) },
                    ]}
                  >
                    {getStatusLabel(contact.status)}
                  </Text>
                </View>

                {contact.status === "PENDING" && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.contactedBtn]}
                      onPress={() => handleUpdateStatus(contact._id, "CONTACTED")}
                    >
                      <Text style={styles.actionBtnText}>Đã liên hệ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.closedBtn]}
                      onPress={() => handleUpdateStatus(contact._id, "CLOSED")}
                    >
                      <Text style={styles.actionBtnText}>Đóng</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {contact.status === "CONTACTED" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.closedBtn]}
                    onPress={() => handleUpdateStatus(contact._id, "CLOSED")}
                  >
                    <Text style={styles.actionBtnText}>Đóng</Text>
                  </TouchableOpacity>
                )}
              </View>

              {contact.createdAt && (
                <Text style={styles.contactDate}>
                  {new Date(contact.createdAt).toLocaleString("vi-VN")}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === "PENDING"
              ? "Không có liên hệ nào chờ xử lý"
              : `Không có liên hệ ${getStatusLabel(filter).toLowerCase()}`}
          </Text>
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
  filterTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#00b894",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTabTextActive: {
    color: "#fff",
  },
  centerContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  contactsContainer: {
    padding: 20,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00b894",
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  customerMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    fontStyle: "italic",
  },
  contactFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  contactedBtn: {
    backgroundColor: "#00b894",
  },
  closedBtn: {
    backgroundColor: "#666",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  contactDate: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

