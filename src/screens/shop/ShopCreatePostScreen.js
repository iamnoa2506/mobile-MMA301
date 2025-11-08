import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { shopApi } from "../../api/client";

export default function ShopCreatePostScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [category, setCategory] = useState("BATTERY"); // BATTERY or ELECTRIC_SCOOTER
  const [images, setImages] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const res = await shopApi.getMyPackages();
      // Backend returns: { success: true, data: { packages: [...] } }
      const activePackages = (res?.data?.packages || []).filter(
        (pkg) => pkg.status === "ACTIVE" && pkg.remainingPosts > 0
      );
      setPackages(activePackages);
    } catch (e) {
      console.log("Packages error:", e?.message || e);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    if (!numericValue) return "";
    
    // Add dots every 3 digits from right to left
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseCurrency = (value) => {
    // Remove dots and convert to number
    return parseFloat(value.replace(/\./g, "")) || 0;
  };

  const handlePriceChange = (text) => {
    const formatted = formatCurrency(text);
    setPrice(formatted);
  };

  const handleSubmit = async () => {
    if (!title || !description || !price) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const priceNum = parseCurrency(price);
    if (priceNum <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập giá hợp lệ");
      return;
    }

    const stockNum = parseInt(stock) || 0;
    if (stockNum < 0) {
      Alert.alert("Lỗi", "Số lượng không hợp lệ");
      return;
    }

    if (packages.length === 0) {
      Alert.alert(
        "Lỗi",
        "Bạn chưa có gói đăng bài nào. Vui lòng mua gói trước."
      );
      navigation.navigate("ShopPackage");
      return;
    }

    try {
      setSubmitting(true);
      await shopApi.createPost({
        title,
        description,
        price: priceNum,
        stock: stockNum,
        category,
        images,
      });
      Alert.alert("Thành công", "Đăng bài thành công!", [
        {
          text: "OK",
          onPress: () => {
            setTitle("");
            setDescription("");
            setPrice("");
            setStock("1");
            setCategory("BATTERY");
            setImages([]);
            navigation.navigate("ShopPosts");
          },
        },
      ]);
    } catch (e) {
      Alert.alert("Lỗi", e?.message || "Không thể đăng bài");
    } finally {
      setSubmitting(false);
    }
  };

  const totalRemainingPosts = packages.reduce(
    (sum, pkg) => sum + (pkg.remainingPosts || 0),
    0
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Thông tin gói đăng bài</Text>
        <Text style={styles.infoText}>
          Số bài đăng còn lại: {totalRemainingPosts}
        </Text>
        {totalRemainingPosts === 0 && (
          <TouchableOpacity
            style={styles.buyPackageBtn}
            onPress={() => navigation.navigate("ShopPackage")}
          >
            <Text style={styles.buyPackageBtnText}>Mua gói ngay</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form */}
      <View style={styles.section}>
        <Text style={styles.label}>Tiêu đề *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề sản phẩm"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Loại sản phẩm *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Pin" value="BATTERY" />
            <Picker.Item label="Xe điện" value="ELECTRIC_SCOOTER" />
          </Picker>
        </View>

        <Text style={styles.label}>Mô tả *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập mô tả chi tiết sản phẩm"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
        />

        <Text style={styles.label}>Giá (VNĐ) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập giá sản phẩm"
          keyboardType="numeric"
          value={price}
          onChangeText={handlePriceChange}
        />

        <Text style={styles.label}>Số lượng *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số lượng sản phẩm"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <Text style={styles.label}>Hình ảnh (URL, tách bằng dấu phẩy)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          value={images.join(", ")}
          onChangeText={(text) =>
            setImages(
              text
                .split(",")
                .map((url) => url.trim())
                .filter((url) => url)
            )
          }
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (submitting || totalRemainingPosts === 0) &&
              styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting || totalRemainingPosts === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Đăng bài</Text>
          )}
        </TouchableOpacity>
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
  infoCard: {
    backgroundColor: "#fff3cd",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#856404",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#856404",
    marginBottom: 12,
  },
  buyPackageBtn: {
    backgroundColor: "#ffc107",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buyPackageBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  submitBtn: {
    backgroundColor: "#00b894",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

