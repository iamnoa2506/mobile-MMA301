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

export default function ShopPostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await shopApi.getMyPosts();
      // Backend returns: { success: true, data: { products: [...] } }
      setPosts(res?.data?.products || []);
    } catch (e) {
      console.log("Posts error:", e?.message || e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (postId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa bài đăng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await shopApi.deletePost(postId);
            Alert.alert("Thành công", "Xóa bài đăng thành công");
            loadPosts();
          } catch (e) {
            Alert.alert("Lỗi", "Không thể xóa bài đăng");
          }
        },
      },
    ]);
  };

  const handleEdit = (post) => {
    // Navigate to edit screen (you can create a separate edit screen or reuse create screen)
    navigation.navigate("ShopCreatePost", { postId: post._id, post });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadPosts} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý bài đăng</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadPosts} style={styles.refreshBtn} disabled={loading}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("ShopCreatePost")}
          >
            <Text style={styles.addBtnText}>+ Tạo mới</Text>
          </TouchableOpacity>
        </View>
      </View>

      {posts.length > 0 ? (
        posts.map((post) => (
          <View key={post._id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postTitle}>{post.name || post.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  post.status === "APPROVED"
                    ? styles.statusActive
                    : post.status === "PENDING"
                    ? styles.statusPending
                    : styles.statusInactive,
                ]}
              >
                <Text style={styles.statusText}>
                  {post.status === "APPROVED"
                    ? "Đã duyệt"
                    : post.status === "PENDING"
                    ? "Chờ duyệt"
                    : "Đã ẩn"}
                </Text>
              </View>
            </View>

            <Text style={styles.postCategory}>
              {post.category === "BATTERY" ? "Pin" : "Xe điện"}
            </Text>

            <Text style={styles.postDescription} numberOfLines={2}>
              {post.description}
            </Text>

            <View style={styles.postFooter}>
              <Text style={styles.postPrice}>
                {post.price?.amount
                  ? post.price.amount.toLocaleString("vi-VN")
                  : post.price?.toLocaleString("vi-VN") || 0}{" "}
                đ
              </Text>
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleEdit(post)}
                >
                  <Text style={styles.actionBtnText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(post._id)}
                >
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {post.createdAt && (
              <Text style={styles.postDate}>
                Đăng ngày: {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </Text>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có bài đăng nào</Text>
          <TouchableOpacity
            style={styles.createFirstBtn}
            onPress={() => navigation.navigate("ShopCreatePost")}
          >
            <Text style={styles.createFirstBtnText}>Tạo bài đăng đầu tiên</Text>
          </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: "600",
  },
  addBtn: {
    backgroundColor: "#00b894",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  postCard: {
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
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: "#d4edda",
  },
  statusPending: {
    backgroundColor: "#fff3cd",
  },
  statusInactive: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#155724",
  },
  postCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  postPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00b894",
  },
  postActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0984e3",
  },
  deleteBtn: {
    backgroundColor: "#ffe0e0",
  },
  deleteBtnText: {
    color: "#e74c3c",
  },
  postDate: {
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
    marginBottom: 20,
  },
  createFirstBtn: {
    backgroundColor: "#00b894",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

