import {FormatterInput, FormatterInputProps} from './FormatterInput';
import {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';

import styled from '@emotion/native';

export interface ShadowInputProps extends FormatterInputProps {
  hideButton?: boolean;
  buttonName?: string;
  onPress?: () => any;
}

export const ShadowInput: React.FC<ShadowInputProps> = ({
  hideButton,
  buttonName,
  onPress,
  onChangeText,
  secureTextEntry,
  ...props
}) => {
  const [value, setValue] = useState(props.defaultValue);
  const onKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (event.nativeEvent.key !== 'Enter') {
      return;
    }

    if (!hideButton && onPress) {
      onPress();
    }
  };

  const onChangeTextByInput = (text: string) => {
    text = text.replace(/\n/g, '');

    setValue(text);
    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <Container>
      <Input
        value={value}
        onChangeText={onChangeTextByInput}
        placeholderTextColor="#999"
        multiline={!secureTextEntry}
        onKeyPress={onKeyPress}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {!hideButton && buttonName && (
        <TouchableOpacity onPress={onPress}>
          <InputButton>{buttonName}</InputButton>
        </TouchableOpacity>
      )}
    </Container>
  );
};

const Container = styled.View`
  margin: 10px;
  border-radius: 10px;
  background-color: #fcfeff;
  shadow-color: #999;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  elevation: 15;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  shadow-offset: 0px;
`;

const Input = styled(FormatterInput)`
  flex: auto;
  font-size: 18px;
  font-weight: 600;
  padding: 10px;
`;

const InputButton = styled.Text`
  font-size: 18px;
  font-weight: 500;
  margin: 12px;
  padding-right: 6px;
  border-radius: 2px;
  color: #999;
`;
