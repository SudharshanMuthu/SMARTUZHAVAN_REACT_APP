import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { DashboardHeader } from '../components/DashboardHeader';
import { ProfileModal } from '../components/ProfileModal';
import { FarmerDashboard } from './dashboards/FarmerDashboard';
import { TransporterDashboard } from './dashboards/TransporterDashboard';
import { WarehouseDashboard } from './dashboards/WarehouseDashboard';
import { BuyerDashboard } from './dashboards/BuyerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { Colors, Spacing } from '../constants/theme';
import { UserRole } from '../types/user';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, userProfile, logout } = useAuth();
  const [isTamil, setIsTamil] = useState<boolean>(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState<boolean>(false);

  const role: UserRole = userProfile?.role || 'Farmer';
  const name = userProfile?.name || 'User';
  const email = user?.email || userProfile?.email || '';

  const handleToggleLanguage = () => {
    setIsTamil((prev) => !prev);
  };

  const handleLogout = () => {
    Alert.alert(
      isTamil ? 'வெளியேறு' : 'Sign Out',
      isTamil
        ? 'ஸ்மார்ட் உழவன் கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா?'
        : 'Are you sure you want to sign out of Smart Uzhavan?',
      [
        {
          text: isTamil ? 'ரத்து' : 'Cancel',
          style: 'cancel',
        },
        {
          text: isTamil ? 'வெளியேறு' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const renderRoleDashboard = () => {
    switch (role) {
      case 'Farmer':
        return <FarmerDashboard isTamil={isTamil} />;
      case 'Transporter':
        return <TransporterDashboard isTamil={isTamil} />;
      case 'Warehouse':
        return <WarehouseDashboard isTamil={isTamil} />;
      case 'Buyer':
        return <BuyerDashboard isTamil={isTamil} />;
      case 'Admin':
        return <AdminDashboard isTamil={isTamil} />;
      default:
        return <FarmerDashboard isTamil={isTamil} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          name={name}
          email={email}
          role={role}
          isTamil={isTamil}
          onToggleLanguage={handleToggleLanguage}
          onLogout={handleLogout}
          onOpenNotifications={() => navigation.navigate('Notifications')}
          onOpenProfile={() => setIsProfileModalVisible(true)}
        />

        {renderRoleDashboard()}
      </ScrollView>

      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
        onLogout={handleLogout}
        isTamil={isTamil}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
