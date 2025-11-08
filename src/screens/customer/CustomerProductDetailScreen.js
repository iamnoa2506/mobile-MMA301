import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { customerApi } from "../../api/client";

export default function CustomerProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);
  const [checkingContact, setCheckingContact] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    message: "",
  });

  useEffect(() => {
    loadProduct();
    loadUserInfo();
    checkContactStatus();
  }, [productId]);

  const loadUserInfo = async () => {
    try {
      // Try to load from API first to get latest profile
      try {
        const res = await customerApi.getProfile();
        const user = res?.data?.user || {};
        setContactForm({
          customerName: user.fullName || user.email || "",
          customerPhone: user.phoneNumber || "",
          customerEmail: user.email || "",
          message: "",
        });
        // Update AsyncStorage
        await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      } catch (apiError) {
        // Fallback to AsyncStorage if API fails
        const userStr = await AsyncStorage.getItem("auth_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setContactForm({
            customerName: user.fullName || user.email || "",
            customerPhone: user.phoneNumber || "",
            customerEmail: user.email || "",
            message: "",
          });
        }
      }
    } catch (e) {
      console.log("Load user info error:", e?.message || e);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getProductById(productId);
      setProduct(res?.data?.product);
    } catch (e) {
      console.log("Product error:", e?.message || e);
      Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkContactStatus = async () => {
    try {
      setCheckingContact(true);
      const userStr = await AsyncStorage.getItem("auth_user");
      let email = null;
      if (userStr) {
        const user = JSON.parse(userStr);
        email = user.email;
      }
      const res = await customerApi.checkContact(productId, email);
      setHasContacted(res?.data?.hasContacted || false);
    } catch (e) {
      console.log("Check contact error:", e?.message || e);
      setHasContacted(false);
    } finally {
      setCheckingContact(false);
    }
  };

  const handleContactShop = () => {
    setContactModalVisible(true);
  };

  const handleSubmitContact = async () => {
    // Validate
    if (!contactForm.customerName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên của bạn");
      return;
    }
    if (!contactForm.customerPhone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }
    if (!contactForm.customerEmail.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.customerEmail.trim())) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(contactForm.customerPhone.replace(/\s/g, ""))) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ (10-11 số)");
      return;
    }

    try {
      setSubmitting(true);
      await customerApi.contactShop(productId, {
        customerName: contactForm.customerName.trim(),
        customerPhone: contactForm.customerPhone.trim(),
        customerEmail: contactForm.customerEmail.trim(),
        message: contactForm.message.trim(),
      });
      Alert.alert(
        "Thành công",
        "Gửi thông tin liên hệ thành công. Shop sẽ liên hệ với bạn sớm nhất.",
        [
          {
            text: "OK",
            onPress: () => {
              setContactModalVisible(false);
              setHasContacted(true);
              setContactForm({
                customerName: contactForm.customerName,
                customerPhone: "",
                customerEmail: contactForm.customerEmail,
                message: "",
              });
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert("Lỗi", e?.message || "Không thể gửi thông tin liên hệ");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      BATTERY: "Pin",
      ELECTRIC_SCOOTER: "Xe điện",
    };
    return labels[cat] || cat;
  };

  if (loading || !product) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0984e3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Images */}
      {product.images && product.images.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}

      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {product.price?.amount?.toLocaleString("vi-VN") || 0} đ
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(product.category)}
            </Text>
          </View>
        </View>

        {/* Shop Info */}
        {product.shopId && (
          <View style={styles.shopCard}>
            <Text style={styles.shopTitle}>Thông tin Shop</Text>
            <Text style={styles.shopName}>{product.shopId.shopName || "N/A"}</Text>
            {product.shopId.address && (
              <Text style={styles.shopAddress}>📍 {product.shopId.address}</Text>
            )}
            <TouchableOpacity
              style={[styles.contactBtn, hasContacted && styles.contactedBtn]}
              onPress={hasContacted ? undefined : handleContactShop}
              disabled={hasContacted}
            >
              <Text style={styles.contactBtnText}>
                {hasContacted ? "✓ Đã liên hệ với người bán" : "📞 Liên hệ với người bán"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        {product.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        )}

        {/* Specs */}
        {product.specs && (
          <View style={styles.specsCard}>
            <Text style={styles.specsTitle}>Thông số kỹ thuật</Text>
            {product.specs.batteryCapacityWh && (
              <Text style={styles.specItem}>
                Dung lượng pin: {product.specs.batteryCapacityWh} Wh
              </Text>
            )}
            {product.specs.motorPowerW && (
              <Text style={styles.specItem}>
                Công suất động cơ: {product.specs.motorPowerW} W
              </Text>
            )}
            {product.specs.rangeKm && (
              <Text style={styles.specItem}>
                Quãng đường: {product.specs.rangeKm} km
              </Text>
            )}
            {product.specs.topSpeedKmh && (
              <Text style={styles.specItem}>
                Tốc độ tối đa: {product.specs.topSpeedKmh} km/h
              </Text>
            )}
            {product.specs.weightKg && (
              <Text style={styles.specItem}>
                Trọng lượng: {product.specs.weightKg} kg
              </Text>
            )}
          </View>
        )}

        {/* Stock */}
        <View style={styles.stockCard}>
          <Text style={styles.stockText}>
            {product.stock > 0
              ? `Còn hàng: ${product.stock} sản phẩm`
              : "Hết hàng"}
          </Text>
        </View>
      </View>

      {/* Contact Modal */}
      <Modal
        visible={contactModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Liên hệ với người bán</Text>
            <Text style={styles.modalSubtitle}>
              Điền thông tin để Shop liên hệ với bạn
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Họ và tên *"
              value={contactForm.customerName}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, customerName: text })
              }
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Số điện thoại *"
              value={contactForm.customerPhone}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, customerPhone: text })
              }
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Email *"
              value={contactForm.customerEmail}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, customerEmail: text })
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Tin nhắn (tùy chọn)"
              value={contactForm.message}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, message: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setContactModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSubmitBtn]}
                onPress={handleSubmitContact}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Gửi</Text>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 400,
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 64,
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0984e3",
  },
  categoryBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0984e3",
  },
  shopCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shopTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#00b894",
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  contactBtn: {
    backgroundColor: "#00b894",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  contactedBtn: {
    backgroundColor: "#6c757d",
    opacity: 0.8,
  },
  contactBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
  },
  specsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  specsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  specItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    paddingLeft: 8,
  },
  stockCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stockText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00b894",
    textAlign: "center",
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
    maxHeight: "90%",
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
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalTextArea: {
    minHeight: 100,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
  modalSubmitBtn: {
    backgroundColor: "#00b894",
  },
  modalSubmitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

