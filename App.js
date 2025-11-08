import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

// Shop Screens
import ShopHomeScreen from './src/screens/shop/ShopHomeScreen';
import ShopWalletScreen from './src/screens/shop/ShopWalletScreen';
import ShopPackageScreen from './src/screens/shop/ShopPackageScreen';
import ShopCreatePostScreen from './src/screens/shop/ShopCreatePostScreen';
import ShopPostsScreen from './src/screens/shop/ShopPostsScreen';

// Admin Screens
import AdminHomeScreen from './src/screens/admin/AdminHomeScreen';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminRevenueScreen from './src/screens/admin/AdminRevenueScreen';
import AdminProductsScreen from './src/screens/admin/AdminProductsScreen';

// Customer Screens
import CustomerHomeScreen from './src/screens/customer/CustomerHomeScreen';
import CustomerProductDetailScreen from './src/screens/customer/CustomerProductDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('auth_user');
      console.log('Token:', token);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        // Redirect based on role
        if (user?.roleName === 'SHOP') {
          setInitialRoute('ShopHome');
        } else if (user?.roleName === 'ADMIN') {
          setInitialRoute('AdminHome');
        } else if (user?.roleName === 'CUSTOMER') {
          setInitialRoute('CustomerHome');
        } else {
          setInitialRoute('Home');
        }
      } else {
        setInitialRoute('Login');
      }
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName={initialRoute}>
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
          
          {/* Shop Screens */}
          <Stack.Screen name="ShopHome" component={ShopHomeScreen} options={{ title: 'Trang chủ Shop' }} />
          <Stack.Screen name="ShopWallet" component={ShopWalletScreen} options={{ title: 'Ví của tôi' }} />
          <Stack.Screen name="ShopPackage" component={ShopPackageScreen} options={{ title: 'Gói đăng bài' }} />
          <Stack.Screen name="ShopCreatePost" component={ShopCreatePostScreen} options={{ title: 'Tạo bài đăng' }} />
          <Stack.Screen name="ShopPosts" component={ShopPostsScreen} options={{ title: 'Quản lý bài đăng' }} />
          
          {/* Admin Screens */}
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Trang chủ Admin' }} />
          <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: 'Duyệt sản phẩm' }} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Quản lý User' }} />
          <Stack.Screen name="AdminRevenue" component={AdminRevenueScreen} options={{ title: 'Doanh thu' }} />
          
          {/* Customer Screens */}
          <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} options={{ title: 'Trang chủ' }} />
          <Stack.Screen name="CustomerProductDetail" component={CustomerProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
