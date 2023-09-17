import React, {useEffect, useState} from 'react';
import {Provider as StyletronProvider} from 'styletron-react';
import {LightTheme, DarkTheme, BaseProvider} from 'baseui';
import {styletron} from '../styletron';

export const COLOR_THEMES = {
  light: 'light',
  dark: 'dark',
};

export type ColorTheme = (typeof COLOR_THEMES)[keyof typeof COLOR_THEMES];

export const useColorTheme = (): ColorTheme => {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(COLOR_THEMES.light);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
      setColorTheme(COLOR_THEMES.dark);
    }
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        setColorTheme(event.matches ? COLOR_THEMES.dark : COLOR_THEMES.light);
      });
  }, []);

  return colorTheme;
};

function MyApp({Component, pageProps}) {
  const colorTheme = useColorTheme();
  return (
    <StyletronProvider value={styletron}>
      <BaseProvider
        theme={colorTheme === COLOR_THEMES.light ? LightTheme : DarkTheme}
      >
        <Component {...pageProps} />
      </BaseProvider>
    </StyletronProvider>
  );
}

export default MyApp;
