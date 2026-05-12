import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import DrawerMenu from '../components/DrawerMenu';
import HomeScreen from '../../features/home/screens/HomeScreen';
import QuestionScreen from '../../features/questions/screens/QuestionScreen';
import AskQuestionScreen from '../../features/questions/screens/AskQuestionScreen';
import QuestionDetailScreen from '../../features/questions/screens/QuestionDetailScreen';
import NotificationScreen from '../../features/notification/screens/NotificationScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import EditProfileScreen from '../../features/profile/screens/EditProfileScreen';
import TagScreen from '../../features/tags/screens/TagScreen';
import UserScreen from '../../features/users/screens/UserScreen';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import RegisterScreen from '../../features/auth/screens/RegisterScreen';
import AdminScreen from '../../features/admin/screens/AdminScreen';
import SplashScreen from '../../features/splash/screens/SplashScreen';
import ManageUsersScreen from '../../features/admin/screens/ManageUsersScreen';
import ManageQuestionsScreen from '../../features/admin/screens/ManageQuestionsScreen';
import ApproveQuestionsScreen from '../../features/admin/screens/ApproveQuestionsScreen';
import AuthService from '../../features/auth/services/AuthService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Questions" component={QuestionScreen} />
      <Tab.Screen name="Ask" component={AskQuestionScreen} />
      <Tab.Screen name="Tags" component={TagScreen} />
      <Tab.Screen name="Users" component={UserScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Home');

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const [isAuth] = await Promise.all([
        AuthService.isAuthenticated(),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
      if (isAuth) {
        const user = await AuthService.getUser();
        if (user?.role === 'Admin') {
          setInitialRoute('AdminScreen');
        } else {
          setInitialRoute('MainTabs');
        }
      } else {
        setInitialRoute('LoginScreen');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setInitialRoute('LoginScreen');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* <TopBar onMenuPress={() => setDrawerVisible(!drawerVisible)} /> */}
      <View style={styles.content}>
        <NavigationContainer
          independent
          onStateChange={(state) => {
            if (state) {
              const route = state.routes[state.index];
              if (route.state) {
                const tabRoute = route.state.routes[route.state.index];
                setCurrentRoute(tabRoute.name);
              }else setCurrentRoute(route.name);
            }
          }}
        >
          <TopBar onMenuPress={() => setDrawerVisible(!drawerVisible)} />
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="AdminScreen" component={AdminScreen} />
            <Stack.Screen name="ManageUsersScreen" component={ManageUsersScreen} />
            <Stack.Screen name="ManageQuestionsScreen" component={ManageQuestionsScreen} />
            <Stack.Screen name="ApproveQuestionsScreen" component={ApproveQuestionsScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            <Stack.Screen name="QuestionDetailScreen" component={QuestionDetailScreen} />
          </Stack.Navigator>
          <DrawerMenu
            visible={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            currentRoute={currentRoute}
          />
        </NavigationContainer>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});