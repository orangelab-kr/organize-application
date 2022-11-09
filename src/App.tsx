/* eslint-disable react-native/no-inline-styles */
import 'moment/locale/ko';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import BottomSheet, {
  BottomSheetFlatList,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import {screenHeight, screenWidth} from './constants/screenSize';
import {useEffect, useMemo, useState} from 'react';

import {CameraScreen} from 'react-native-camera-kit';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KickboardItem} from './components/KickboardItem';
import {Label} from './components/Label';
import React from 'react';
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
      await createKickboard(kickboardCode);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const createKickboardByInput = () => createKickboard(search);
  const createKickboard = async (kickboardCode: string) => {
    await kickboardCol
      .doc(kickboardCode)
      .set({kickboardCode, createdAt: new Date()});
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
            snapPoints={['45%', '80%']}
            enableHandlePanningGesture={false}>
            <BottomContainer>
              <Label>{searchedKickboards.length}개 킥보드</Label>
              <ShadowInput
                placeholder="킥보드 코드를 입력하세요."
                value={search}
                onChangeText={setSearch}
                onFormat={r => r.toUpperCase()}
              />
              {search.length === 6 && searchedKickboards.length <= 0 && (
                <View style={{display: 'flex', alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={createKickboardByInput}
                    style={{
                      borderRadius: 10,
                      backgroundColor: '#000',
                      width: screenWidth * 0.85,
                      padding: 15,
                    }}>
                    <Text
                      style={{
                        fontSize: 15,
                        textAlign: 'center',
                        fontWeight: '700',
                        color: '#fff',
                      }}>
                      등록
                    </Text>
                  </TouchableOpacity>
                  <Label style={{fontSize: 15, marginTop: 10}}>
                    등록되지 않은 킥보드입니다.
                  </Label>
                </View>
              )}
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
