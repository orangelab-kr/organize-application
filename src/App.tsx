import 'moment/locale/ko';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StatusBar,
  View,
} from 'react-native';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import React, {useEffect, useMemo, useState} from 'react';
import {screenHeight, screenWidth} from './constants/screenSize';

import {CameraScreen} from 'react-native-camera-kit';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KickboardItem} from './components/KickboardItem';
import {ShadowInput} from './components/ShadowInput';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import styled from '@emotion/native';

export interface ReadCodeEvent {
  nativeEvent: {codeStringValue: string};
}

moment.locale('kr');
const kickboardCol = firestore().collection('kickboards');

const App = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentQrcode, setRecentQrcode] = useState<string>();
  const [kickboards, setKickboards] = useState<
    {kickboardCode: string; createdAt: Date}[]
  >([]);

  const searchedKickboards = useMemo(
    () => kickboards.filter(k => k.kickboardCode.includes(search)),
    [kickboards, search],
  );

  useEffect(() => {
    const subscriber = firestore()
      .collection('kickboards')
      .onSnapshot(querySnapshot =>
        setKickboards(
          querySnapshot.docs
            .map(r => ({
              kickboardCode: r.data().kickboardCode,
              createdAt: new Date(r.data().createdAt._seconds * 1000),
            }))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        ),
      );

    return () => subscriber();
  }, []);

  const getKickboardCodeByUrl = async (url: string) =>
    axios.get(url).then(r => r.request.responseURL.split('?code=')[1]);

  const onReadCode = async (event: ReadCodeEvent) => {
    try {
      setLoading(true);
      const url = event.nativeEvent.codeStringValue;
      if (recentQrcode === url) {
        console.log('Duplicate QR Code', url);
        return;
      }

      if (!url.startsWith('https://hikickride.page.link/')) {
        console.log('This QR code is not for kickboard code');
        return;
      }

      setRecentQrcode(url);
      const kickboardCode = await getKickboardCodeByUrl(url);
      await kickboardCol.doc(kickboardCode).set({
        kickboardCode,
        createdAt: new Date(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{height: screenHeight, width: screenWidth}}>
      <StatusBar barStyle="light-content" />
      <GestureHandlerRootView style={{flex: 1}}>
        <KeyboardAvoidingView behavior="height" style={{flex: 1}}>
          {loading && <LoadingIndicator size={50} />}
          <StyledCameraScreen
            onReadCode={onReadCode}
            scanBarcode
            hideControls
          />
          <BottomSheet
            snapPoints={['40%', '80%']}
            enableHandlePanningGesture={false}>
            <BottomContainer>
              <ShadowInput
                placeholder="킥보드 코드를 입력하세요."
                value={search}
                onChangeText={setSearch}
                onFormat={r => r.toUpperCase()}
              />
              <BottomSheetFlatList
                data={searchedKickboards}
                keyExtractor={i => i.kickboardCode}
                renderItem={KickboardItem}
              />
            </BottomContainer>
          </BottomSheet>
        </KeyboardAvoidingView>
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

const BottomContainer = styled.View`
  flex: 1;
  padding: 0px 20px;
`;

const LoadingIndicator = styled(ActivityIndicator)`
  z-index: 1;
  background-color: #000;
  opacity: 0.7;
  height: ${screenHeight}px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export default App;
