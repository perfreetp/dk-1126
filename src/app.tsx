import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { InspirationProvider } from './store/InspirationContext';
import './app.scss';

function App(props) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return (
    <InspirationProvider>
      {props.children}
    </InspirationProvider>
  );
}

export default App;
