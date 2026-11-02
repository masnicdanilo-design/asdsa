import { AppRegistry, Image, NativeModules } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { PluginManager, PluginDocAPI } from 'sn-plugin-lib';
import {
  SETUP_BUTTON_ID, BASE_ID, loadShortcuts, registerShortcutButtons,
} from './src/shortcuts';

const { AppLauncher } = NativeModules;

AppRegistry.registerComponent(appName, () => App);
PluginManager.init();

// Dugme za podešavanje (toolbar u NOTE/DOC) - otvara App.tsx
PluginManager.registerButton(1, ['NOTE', 'DOC'], {
  id: SETUP_BUTTON_ID,
  name: 'App shortcuts',
  icon: Image.resolveAssetSource(require('./assets/icon.png')).uri,
  showType: 1,
});

// Shortcuti u context meniju (selekcija teksta u DOC readeru)
loadShortcuts().then(registerShortcutButtons);

PluginManager.registerButtonListener({
  onButtonPress: async event => {
    if (event.id < BASE_ID) return;
    const list = await loadShortcuts();
    const s = list[event.id - BASE_ID];
    if (!s) return;
    let text = '';
    try {
      const res = await PluginDocAPI.getLastSelectedText();
      if (res.success && res.result) text = res.result;
    } catch {}
    // Pokreće app; selektovani tekst se šalje kao EXTRA_TEXT / PROCESS_TEXT
    AppLauncher.launch(s.pkg, text);
  },
});
