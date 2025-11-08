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
import { adminApi } from "../../api/client";

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banning, setBanning] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      setUsers(res?.data?.users || []);
    } catch (e) {
      console.log("Users error:", e?.message || e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = (userId, isBanned) => {
    const action = isBanned ? "mở khóa" : "khóa";
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc chắn muốn ${action} user này?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: isBanned ? "default" : "destructive",
          onPress: async () => {
            try {
              setBanning(userId);
              await adminApi.banUser(userId, { isBanned: !isBanned });
              Alert.alert("Thành công", `${action.charAt(0).toUpperCase() + action.slice(1)} user thành công`);
              loadUsers();
            } catch (e) {
              Alert.alert("Lỗi", e?.message || "Không thể thực hiện thao tác");
            } finally {
              setBanning(null);
            }
          },
        },
      ]
    );
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: "Admin",
      SHOP: "Shop",
      CUSTOMER: "Customer",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "#e74c3c",
      SHOP: "#00b894",
      CUSTOMER: "#0984e3",
    };
    return colors[role] || "#666";
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadUsers} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý User</Text>
        <TouchableOpacity onPress={loadUsers} style={styles.refreshBtn} disabled={loading}>
          <Text style={styles.refreshText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </View>

      {users.length > 0 ? (
        users.map((user) => (
          <View key={user._id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userMeta}>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(user.roleName) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        { color: getRoleColor(user.roleName) },
                      ]}
                    >
                      {getRoleLabel(user.roleName)}
                    </Text>
                  </View>
                  {user.isBanned && (
                    <View style={styles.bannedBadge}>
                      <Text style={styles.bannedText}>🔒 Đã khóa</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {user.fullName && (
              <Text style={styles.userName}>Tên: {user.fullName}</Text>
            )}
            {user.phoneNumber && (
              <Text style={styles.userDetail}>SĐT: {user.phoneNumber}</Text>
            )}
            {user.address && (
              <Text style={styles.userDetail}>Địa chỉ: {user.address}</Text>
            )}

            <View style={styles.userFooter}>
              <Text style={styles.userDate}>
                Đăng ký: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.banBtn,
                  user.isBanned ? styles.unbanBtn : styles.banBtnActive,
                  banning === user._id && styles.banBtnDisabled,
                ]}
                onPress={() => handleBanUser(user._id, user.isBanned)}
                disabled={banning === user._id}
              >
                {banning === user._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.banBtnText}>
                    {user.isBanned ? "Mở khóa" : "Khóa"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có user nào</Text>
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
  userCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bannedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f8d7da",
  },
  bannedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#721c24",
  },
  userName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  userFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  userDate: {
    fontSize: 11,
    color: "#999",
  },
  banBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  banBtnActive: {
    backgroundColor: "#e74c3c",
  },
  unbanBtn: {
    backgroundColor: "#00b894",
  },
  banBtnDisabled: {
    opacity: 0.5,
  },
  banBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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


