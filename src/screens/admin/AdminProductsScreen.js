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
  Image,
  TextInput,
  Modal,
} from "react-native";
import { adminApi } from "../../api/client";

export default function AdminProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("PENDING"); // PENDING, APPROVED, REJECTED
  const [processing, setProcessing] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts({ status: filter });
      setProducts(res?.data?.products || []);
    } catch (e) {
      console.log("Products error:", e?.message || e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (productId) => {
    Alert.alert(
      "Xác nhận duyệt",
      "Bạn có chắc chắn muốn duyệt sản phẩm này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Duyệt",
          onPress: async () => {
            try {
              setProcessing(productId);
              await adminApi.approveProduct(productId, { status: "APPROVED" });
              Alert.alert("Thành công", "Duyệt sản phẩm thành công");
              loadProducts();
            } catch (e) {
              Alert.alert("Lỗi", e?.message || "Không thể duyệt sản phẩm");
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (productId) => {
    setRejectingProductId(productId);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason || rejectReason.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setProcessing(rejectingProductId);
      setRejectModalVisible(false);
      await adminApi.approveProduct(rejectingProductId, {
        status: "REJECTED",
        rejectedReason: rejectReason.trim(),
      });
      Alert.alert("Thành công", "Từ chối sản phẩm thành công");
      setRejectReason("");
      setRejectingProductId(null);
      loadProducts();
    } catch (e) {
      Alert.alert("Lỗi", e?.message || "Không thể từ chối sản phẩm");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Đã từ chối",
      INACTIVE: "Ngừng bán",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#ffc107",
      APPROVED: "#00b894",
      REJECTED: "#e74c3c",
      INACTIVE: "#666",
    };
    return colors[status] || "#666";
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      BATTERY: "Pin",
      ELECTRIC_SCOOTER: "Xe điện",
    };
    return labels[cat] || cat;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadProducts} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý sản phẩm</Text>
        <TouchableOpacity onPress={loadProducts} style={styles.refreshBtn} disabled={loading}>
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
            Chờ duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "APPROVED" && styles.filterTabActive]}
          onPress={() => setFilter("APPROVED")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "APPROVED" && styles.filterTabTextActive,
            ]}
          >
            Đã duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "REJECTED" && styles.filterTabActive]}
          onPress={() => setFilter("REJECTED")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "REJECTED" && styles.filterTabTextActive,
            ]}
          >
            Đã từ chối
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {loading && products.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" />
        </View>
      ) : products.length > 0 ? (
        <View style={styles.productsContainer}>
          {products.map((product) => (
            <View key={product._id} style={styles.productCard}>
              {/* Product Image */}
              {product.images && product.images.length > 0 ? (
                <Image
                  source={{ uri: product.images[0] }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={styles.placeholderText}>📦</Text>
                </View>
              )}

              {/* Product Info */}
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(product.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(product.status) },
                      ]}
                    >
                      {getStatusLabel(product.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.productCategory}>
                  {getCategoryLabel(product.category)}
                </Text>

                {product.shopId && (
                  <Text style={styles.productShop} numberOfLines={1}>
                    Shop: {product.shopId.shopName || "N/A"}
                  </Text>
                )}

                <Text style={styles.productPrice}>
                  {product.price?.amount?.toLocaleString("vi-VN") || 0} đ
                </Text>

                {product.description && (
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                  </Text>
                )}

                {product.rejectedReason && (
                  <View style={styles.rejectedReason}>
                    <Text style={styles.rejectedReasonLabel}>Lý do từ chối:</Text>
                    <Text style={styles.rejectedReasonText}>
                      {product.rejectedReason}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                {product.status === "PENDING" && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApprove(product._id)}
                      disabled={processing === product._id}
                    >
                      {processing === product._id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.actionBtnText}>✓ Duyệt</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleReject(product._id)}
                      disabled={processing === product._id}
                    >
                      {processing === product._id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.actionBtnText}>✗ Từ chối</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {product.createdAt && (
                  <Text style={styles.productDate}>
                    Đăng ngày: {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === "PENDING"
              ? "Không có sản phẩm nào chờ duyệt"
              : `Không có sản phẩm ${getStatusLabel(filter).toLowerCase()}`}
          </Text>
        </View>
      )}

      {/* Reject Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Từ chối sản phẩm</Text>
            <Text style={styles.modalSubtitle}>Nhập lý do từ chối:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setRejectModalVisible(false);
                  setRejectReason("");
                  setRejectingProductId(null);
                }}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={confirmReject}
                disabled={processing === rejectingProductId}
              >
                {processing === rejectingProductId ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Từ chối</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#6c5ce7",
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
  productsContainer: {
    padding: 20,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 64,
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginRight: 8,
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
  productCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productShop: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0984e3",
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  rejectedReason: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  rejectedReasonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 4,
  },
  rejectedReasonText: {
    fontSize: 14,
    color: "#856404",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: "#00b894",
  },
  rejectBtn: {
    backgroundColor: "#e74c3c",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  productDate: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelBtn: {
    backgroundColor: "#f0f0f0",
  },
  modalCancelText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  modalConfirmBtn: {
    backgroundColor: "#e74c3c",
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

