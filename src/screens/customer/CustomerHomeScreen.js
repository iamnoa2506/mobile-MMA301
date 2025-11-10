import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { authApi, customerApi } from "../../api/client";

export default function CustomerHomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    loadProducts();
    (async () => {
      const stored = await AsyncStorage.getItem("auth_user");
      if (stored) setUser(JSON.parse(stored));
    })();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (category !== "ALL") {
        filters.category = category;
      }
      if (searchText) {
        filters.search = searchText;
      }
      const res = await customerApi.getProducts(filters);
      setProducts(res?.data?.products || []);
    } catch (e) {
      console.log("Products error:", e?.message || e);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.customerName}>{user?.fullName || user?.email || "Customer"}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CustomerProfile")}
            style={styles.profileBtn}
          >
            <Text style={styles.profileBtnText}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Loại:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Tất cả" value="ALL" />
              <Picker.Item label="Pin" value="BATTERY" />
              <Picker.Item label="Xe điện" value="ELECTRIC_SCOOTER" />
            </Picker>
            <View style={styles.pickerValueContainer}>
              <Text style={styles.pickerValue}>
                {category === "ALL" ? "Tất cả" : category === "BATTERY" ? "Pin" : "Xe điện"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Products List */}
      {loading && products.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0984e3" />
        </View>
      ) : products.length > 0 ? (
        <View style={styles.productsContainer}>
          {products.map((product) => {
            const hasImageError = imageErrors[product._id];
            const shopId = typeof product.shopId === 'object' ? product.shopId : null;
            const hasShopInfo = shopId && (shopId.shopName || shopId._id);
            
            return (
              <TouchableOpacity
                key={product._id}
                style={styles.productCard}
                onPress={() => navigation.navigate("CustomerProductDetail", { productId: product._id })}
              >
                {product.images && product.images.length > 0 && !hasImageError ? (
                  <Image
                    source={{ uri: product.images[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [product._id]: true }));
                    }}
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.placeholderText}>📦</Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productCategory}>
                    {getCategoryLabel(product.category)}
                  </Text>
                  {hasShopInfo && (
                    <View style={styles.shopInfo}>
                      {shopId.logo ? (
                        <Image
                          source={{ uri: shopId.logo }}
                          style={styles.shopLogo}
                          resizeMode="cover"
                          onError={() => {}}
                        />
                      ) : null}
                      <Text style={styles.productShop} numberOfLines={1}>
                        Shop: {shopId.shopName || "N/A"}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.productPrice}>
                    {product.price?.amount?.toLocaleString("vi-VN") || 0} đ
                  </Text>
                  {hasShopInfo && (
                    <TouchableOpacity
                      style={styles.contactShopBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate("CustomerProductDetail", { productId: product._id });
                      }}
                    >
                      <Text style={styles.contactShopBtnText}>Liên hệ Shop</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
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
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  customerName: {
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
  profileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#e3f2fd",
  },
  profileBtnText: {
    fontSize: 20,
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
  searchSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: "#0984e3",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchBtnText: {
    fontSize: 18,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    position: "relative",
  },
  picker: {
    height: 50,
    color: "transparent", // Ẩn text mặc định của Picker
  },
  pickerValueContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 12,
    pointerEvents: "none",
  },
  pickerValue: {
    fontSize: 14,
    color: "#111",
  },
  centerContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  productsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 10,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f0f0",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 48,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
    minHeight: 36,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  shopLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  productShop: {
    fontSize: 11,
    color: "#999",
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0984e3",
    marginBottom: 8,
  },
  contactShopBtn: {
    backgroundColor: "#00b894",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 4,
  },
  contactShopBtnText: {
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

