import {Component, ReactNode} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, ActivityIndicator} from 'react-native-paper';
import http from '../api/http';
import Colors from '../theme/theme';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {StackScreenProps} from '@react-navigation/stack';
import {ParamListBase} from '@react-navigation/native';

interface Props extends StackScreenProps<ParamListBase, 'Activities'> {}

class Details extends Component<Props, {loading: boolean; data: any[]}> {
  focusListener: any;

  constructor(props: Props) {
    super(props);
    this.state = {loading: true, data: []};
  }

  handleLogoutClick = async () => {
    await AsyncStorage.removeItem('token');
    this.props.navigation.navigate('Home');
  };

  fetchData = async () => {
    try {
      this.setState({loading: true});
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        this.props.navigation.navigate('Home');
      } else {
        const res: any = await http.get('/athlete/activities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const newData = res.data.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          distance: activity.distance,
          averageSpeed: activity.average_speed,
          activityType: activity.type,
          maxSpeed: activity.max_speed,
          heartRate: activity.hasHeartRate ? activity.heart_rate : '-',
        }));
        this.setState({data: newData});
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({loading: false});
    }
  };

  componentDidMount() {
    this.fetchData();
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.fetchData();
    });
  }

  render(): ReactNode {
    return (
      <View style={styles.containerStyle}>
        {this.state.loading ? (
          <View style={styles.loaderStyle}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            testID="activity-list"
            data={this.state.data}
            renderItem={({item}) => (
              <View style={styles.activityContainer}>
                <Text style={styles.activityName}>{item.name}</Text>
                <View style={styles.activityDetails}>
                  <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Distance:</Text>
                    <Text style={styles.detailValue}>
                      {item.distance} miles
                    </Text>
                  </View>
                  <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Average Speed:</Text>
                    <Text style={styles.detailValue}>
                      {item.averageSpeed} mph
                    </Text>
                  </View>
                  <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Activity Type:</Text>
                    <Text style={styles.detailValue}>{item.activityType}</Text>
                  </View>
                  <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Max Speed:</Text>
                    <Text style={styles.detailValue}>{item.maxSpeed} mph</Text>
                  </View>
                  <View style={styles.detailContainer}>
                    <Text style={styles.detailLabel}>Heart Rate:</Text>
                    {item?.heartRate && item?.heartRate !== '-' ? (
                      <Text style={styles.detailValue}>
                        {item.heartRate} bpm
                      </Text>
                    ) : (
                      <Text style={styles.detailValue}>Not Logged</Text>
                    )}
                  </View>
                </View>
              </View>
            )}
            keyExtractor={item => item.id.toString()}
          />
        )}
        <View style={styles.buttonStyle}>
          <Button
            testID="create-button"
            mode="contained"
            labelStyle={{color: 'white'}}
            onPress={() => this.props.navigation.navigate('Create')}>
            Create Activity
          </Button>
          <Button
            testID="logout-button"
            mode="contained"
            labelStyle={{color: 'white'}}
            onPress={this.handleLogoutClick}>
            Logout
          </Button>
        </View>
      </View>
    );
  }
}

export default Details;

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  activityContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 10,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailContainer: {
    width: '45%',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.black,
  },
  buttonStyle: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  loaderStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});
