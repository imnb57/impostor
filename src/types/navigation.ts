import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  LocalSetup: undefined;
  LocalReveal: undefined;
  LocalDiscussion: undefined;
  LocalVoting: undefined;
  LocalResults: undefined;
  OnlineEntry: undefined;
  OnlineRoom: { roomCode: string };
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
