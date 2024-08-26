import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {authorize} from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ParamListBase,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import HomeScreen from '../src/screens/HomeScreen';
import {StackNavigationProp} from '@react-navigation/stack';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  })),
}));

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(),
}));

describe('HomeScreen', () => {
  const route: RouteProp<ParamListBase, 'Home'> = {
    key: 'Home',
    name: 'Home',
    path: undefined,
  };
  let navigation: StackNavigationProp<ParamListBase, 'Home', undefined>;

  beforeEach(() => {
    navigation = useNavigation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Home page renders correctly', async () => {
    const screen = render(<HomeScreen navigation={navigation} route={route} />);
    await waitFor(() => screen);
    expect(screen).toBeDefined();
  });

  it("If there is no token in the async storage, then we see the 'Login with Strava' Button", async () => {
    const getItemMock = jest.spyOn(AsyncStorage, 'getItem');
    getItemMock.mockResolvedValue(null);
    const screen = render(<HomeScreen navigation={navigation} route={route} />);
    await AsyncStorage.getItem('token');
    await waitFor(() => {
      const loginButton = screen.getByTestId('login-button');
      expect(loginButton).toBeDefined();
    });
    getItemMock.mockRestore();
  });

  it('Clicking on the login with strava button should redirect us to the login page', async () => {
    const getItemMock = jest.spyOn(AsyncStorage, 'getItem');
    getItemMock.mockResolvedValue(null);
    const screen = render(<HomeScreen navigation={navigation} route={route} />);
    let loginButton: any;
    await waitFor(() => {
      loginButton = screen.getByTestId('login-button');
    });
    fireEvent.press(loginButton);
    await waitFor(() => {
      expect(authorize).toHaveBeenCalledTimes(1);
    });
    getItemMock.mockRestore();
  });

  it('If there is a token in the async storage, then we navigate to the Activities screen', async () => {
    const getItemMock = jest.spyOn(AsyncStorage, 'getItem');
    getItemMock.mockResolvedValue('mock-token');
    render(<HomeScreen navigation={navigation} route={route} />);
    await waitFor(async () => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('token');
      await AsyncStorage.getItem('token');
    });
    await waitFor(() => {
      expect(navigation.navigate).toHaveBeenCalledWith('Activities');
    });
    getItemMock.mockRestore();
  });
});
