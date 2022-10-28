import {StatusBar, View} from 'react-native';

import {CameraScreen} from 'react-native-camera-kit';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import React from 'react';
import {screenHeight} from './constants/screenSize';
import styled from '@emotion/native';

export interface ReadCodeEvent {
  nativeEvent: {codeStringValue: string};
}

const App = () => {
  const onReadCode = (event: ReadCodeEvent) => {
    console.log(event.nativeEvent);
  };

  return (
    <View>
      <StatusBar barStyle="light-content" />
      <GestureHandlerRootView>
        <StyledCameraScreen onReadCode={onReadCode} scanBarcode hideControls />
      </GestureHandlerRootView>
    </View>
  );
};

const StyledCameraScreen = styled(CameraScreen as any)`
  height: ${screenHeight}px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export default App;
