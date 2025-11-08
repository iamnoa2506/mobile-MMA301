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
import { shopApi } from "../../api/client";

export default function ShopWalletScreen({ navigation }) {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

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

  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await shopApi.getWallet();
      // Backend returns: { success: true, data: { wallet } }
      const walletData = res?.data?.wallet || { balance: 0 };
      setWallet({ ...walletData, transactions: walletData.transactions || [] });
    } catch (e) {
      // Silently handle error - API might not be implemented yet
      console.log("Wallet error:", e?.message || e);
      setWallet({ balance: 0, transactions: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (text) => {
    const formatted = formatCurrency(text);
    setAmount(formatted);
  };

  const handleDeposit = async () => {
    const depositAmount = parseCurrency(amount);
    if (!amount || depositAmount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    try {
      setDepositing(true);
      await shopApi.deposit({ amount: depositAmount });
      Alert.alert("Thành công", "Nạp tiền thành công!", [
        {
          text: "OK",
          onPress: () => {
            setAmount("");
            loadWallet();
          },
        },
      ]);
    } catch (e) {
      Alert.alert("Lỗi", e?.message || "Không thể nạp tiền");
    } finally {
      setDepositing(false);
    }
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
        <Text style={styles.headerTitle}>Ví của tôi</Text>
        <TouchableOpacity onPress={loadWallet} style={styles.refreshBtn} disabled={loading}>
          <Text style={styles.refreshText}>🔄 Tải lại</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
        <Text style={styles.balanceAmount}>
          {wallet.balance?.toLocaleString("vi-VN") || 0} đ
        </Text>
      </View>

      {/* Deposit Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nạp tiền vào ví</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số tiền (VNĐ)"
          keyboardType="numeric"
          value={amount}
          onChangeText={handleAmountChange}
        />
        <TouchableOpacity
          style={[styles.depositBtn, depositing && styles.depositBtnDisabled]}
          onPress={handleDeposit}
          disabled={depositing}
        >
          {depositing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.depositBtnText}>Nạp tiền</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
        {wallet.transactions && wallet.transactions.length > 0 ? (
          wallet.transactions.map((transaction) => (
            <View key={transaction._id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>
                  {transaction.type === "DEPOSIT" ? "Nạp tiền" : "Chi tiêu"}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === "DEPOSIT"
                    ? styles.amountPositive
                    : styles.amountNegative,
                ]}
              >
                {transaction.type === "DEPOSIT" ? "+" : "-"}
                {transaction.amount?.toLocaleString("vi-VN")} đ
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
  balanceCard: {
    backgroundColor: "#00b894",
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
  balanceLabel: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
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
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  depositBtn: {
    backgroundColor: "#00b894",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  depositBtnDisabled: {
    opacity: 0.7,
  },
  depositBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  amountPositive: {
    color: "#00b894",
  },
  amountNegative: {
    color: "#e74c3c",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
  },
});

