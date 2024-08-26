import {Component, ReactNode} from 'react';
import {View, StyleSheet} from 'react-native';
import {authorize} from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, ActivityIndicator} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StackScreenProps} from '@react-navigation/stack';
import {ParamListBase} from '@react-navigation/native';

const config: any = {
  clientId: '112167',
  clientSecret: '40439ca18199e95fd3ad4370d1e03599a593dc9e',
  redirectUrl: 'stravaapp://mystravaapp.com',
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
    tokenEndpoint:
      'https://www.strava.com/oauth/token?client_id=112167&client_secret=40439ca18199e95fd3ad4370d1e03599a593dc9e',
  },
  scopes: ['activity:read_all,activity:write'],
};

interface Props extends StackScreenProps<ParamListBase, 'Home'> {}
class HomeScreen extends Component<Props, {loading: boolean}> {
  focusListener: any;
  constructor(props: Props) {
    super(props);
    this.state = {loading: true};
  }

  handleLoginClick = async () => {
    try {
      this.setState({loading: true});
      const res: any = await authorize(config);
      const token = res?.accessToken;
      if (token) {
        await AsyncStorage.setItem('token', token);
        this.props.navigation.navigate('Activities');
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({loading: false});
    }
  };

  componentDidMount() {
    this.getAccessToken();
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.getAccessToken();
    });
  }

  componentWillUnmount() {
    if (this.focusListener && typeof this.focusListener.remove === 'function') {
      this.focusListener.remove();
    }
  }

  getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        this.props.navigation.navigate('Activities');
      } else {
        this.setState({loading: false});
      }
    } catch (err) {
      console.log(err);
      this.setState({loading: false});
    }
  };

  render(): ReactNode {
    return !this.state.loading ? (
      <View style={styles.baseStyle}>
        <View style={styles.buttonStyle}>
          <Button
            testID="login-button"
            mode="contained"
            labelStyle={{color: 'white'}}
            onPress={this.handleLoginClick}
            disabled={this.state.loading}>
            Login With Strava
          </Button>
        </View>
      </View>
    ) : (
      <View style={styles.baseStyle}>
        <ActivityIndicator size={'large'} color="blue" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  baseStyle: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    display: 'flex',
    flexDirection: 'row',
  },
});

export default HomeScreen;
