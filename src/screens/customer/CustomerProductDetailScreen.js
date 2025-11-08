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
} from "react-native";
import { customerApi } from "../../api/client";

export default function CustomerProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

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

  const handleContactShop = () => {
    if (product?.shopId?.phoneNumber) {
      Alert.alert(
        "Liên hệ Shop",
        `Số điện thoại: ${product.shopId.phoneNumber}`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Thông tin", "Shop chưa cập nhật số điện thoại");
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
              style={styles.contactBtn}
              onPress={handleContactShop}
            >
              <Text style={styles.contactBtnText}>Liên hệ Shop</Text>
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
});

