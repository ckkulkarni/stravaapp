import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ParamListBase,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Details from '../src/screens/Details';
import http from '../src/api/http';
import {AxiosResponse} from 'axios';
import CreateActivity from '../src/screens/CreateActivity';
import {PaperProvider} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
jest.useFakeTimers();

const navigation = useNavigation<NativeStackNavigationProp<any>>();
jest.mock('../src/api/http', () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };
});
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  })),
}));

describe('Activities Screen', () => {
  let screen: any;
  const route: RouteProp<ParamListBase, 'Create'> = {
    key: 'Create',
    name: 'Create',
    path: undefined,
  };
  let navigation: StackNavigationProp<ParamListBase, 'Create', undefined>;
  beforeEach(async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(null);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('token');
  });
  beforeEach(() => {
    navigation = useNavigation();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Create Activity page renders correctly', async () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    await waitFor(() => screen);
    expect(screen).toBeDefined();
  });
  it('changes name input', () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const nameInput = screen.getByTestId('activity-name');
    act(() => {
      fireEvent.changeText(nameInput, 'New Activity');
    });
    expect(nameInput.props.value).toBe('New Activity');
  });

  it('changes type dropdown', async () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const typeDropdown = screen.getByTestId('activity-type');
    act(() => {
      fireEvent.press(typeDropdown);
    });
    const option = await waitFor(() => screen.findByText('Run'));
    act(() => {
      fireEvent.press(option);
    });
  });

  it('changes start date input', () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const startDateInput = screen.getByTestId('activity-start-date');
    act(() => {
      fireEvent.changeText(startDateInput, '2024-08-15');
    });
    expect(startDateInput.props.value).toBe('2024-08-15');
  });

  it('changes elapsed time input', () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const elapsedTimeInput = screen.getByTestId('activity-elapsed-time');
    act(() => {
      fireEvent.changeText(elapsedTimeInput, '2');
    });
    expect(elapsedTimeInput.props.value).toBe('2');
  });

  it('changes description input', () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const descriptionInput = screen.getByTestId('activity-description');
    act(() => {
      fireEvent.changeText(descriptionInput, 'This is a new activity');
    });
    expect(descriptionInput.props.value).toBe('This is a new activity');
  });

  it('changes distance input', () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const distanceInput = screen.getByTestId('activity-distance');
    act(() => {
      fireEvent.changeText(distanceInput, '10');
    });
    expect(distanceInput.props.value).toBe('10');
  });

  it('toggles trainer switch', () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const trainerSwitch = screen.getByTestId('activity-trainer');
    act(() => {
      fireEvent(trainerSwitch, 'onValueChange', true);
    });
    expect(trainerSwitch.props.value).toBe(true);
  });

  it('toggles commute switch', () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const commuteSwitch = screen.getByTestId('activity-commute');
    act(() => {
      fireEvent(commuteSwitch, 'onValueChange', true);
    });
    expect(commuteSwitch.props.value).toBe(true);
  });

  it('submits form', async () => {
    const screen = render(
      <PaperProvider>
        <CreateActivity navigation={navigation} route={route} />
      </PaperProvider>,
    );
    const nameInput = screen.getByTestId('activity-name');
    const typeDropdown = screen.getByTestId('activity-type');
    const startDateInput = screen.getByTestId('activity-start-date');
    const elapsedTimeInput = screen.getByTestId('activity-elapsed-time');
    const descriptionInput = screen.getByTestId('activity-description');
    const distanceInput = screen.getByTestId('activity-distance');
    const trainerSwitch = screen.getByTestId('activity-trainer');
    const commuteSwitch = screen.getByTestId('activity-commute');
    const submitButton = screen.getByTestId('submit-button');

    act(() => {
      fireEvent.changeText(nameInput, 'New Activity');
      fireEvent.press(typeDropdown);
    });
    const option = await waitFor(() => screen.findByText('Run'));
    act(() => {
      fireEvent.press(option);
    });
    act(() => {
      fireEvent.changeText(startDateInput, '2024-08-15');
      fireEvent.changeText(elapsedTimeInput, '2');
      fireEvent.changeText(descriptionInput, 'This is a new activity');
      fireEvent.changeText(distanceInput, '10');
      fireEvent(trainerSwitch, 'onValueChange', true);
      fireEvent(commuteSwitch, 'onValueChange', true);
    });
    await act(() => {
      fireEvent.press(submitButton);
    });
    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        '/activities',
        {
          commute: true,
          description: 'This is a new activity',
          distance: '10',
          elapsed_time: '2',
          name: 'New Activity',
          start_date_local: '2024-08-15',
          trainer: true,
          type: 'Run',
        },
        {
          headers: {Authorization: 'Bearer token'},
        },
      );
    });
  });
});
