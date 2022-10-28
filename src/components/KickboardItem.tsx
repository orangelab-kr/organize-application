import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import styled from '@emotion/native';

const kickboardCol = firestore().collection('kickboards');
export const KickboardItem: React.FC<{
  item: {kickboardCode: string; createdAt: Date};
}> = ({item}) => {
  const onDelete = async () => kickboardCol.doc(item.kickboardCode).delete();

  return (
    <Container>
      <View>
        <KickboardCodeText>{item.kickboardCode}</KickboardCodeText>
        <CreatedText>{moment(item.createdAt).format('lll')}</CreatedText>
      </View>
      <TouchableOpacity onPress={onDelete}>
        <DeleteText>삭제</DeleteText>
      </TouchableOpacity>
    </Container>
  );
};

const Container = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
  padding: 15px 20px;
  border-radius: 10px;
  background-color: #fcfeff;
  shadow-color: #999;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  elevation: 13;
`;

const KickboardCodeText = styled.Text`
  color: #000;
  font-weight: 600;
  font-size: 25px;
  letter-spacing: 4px;
`;

const CreatedText = styled.Text`
  color: #000;
  font-weight: 400;
  font-size: 15px;
`;

const DeleteText = styled.Text`
  color: #ff0000;
  font-weight: 800;
  font-size: 20px;
`;
