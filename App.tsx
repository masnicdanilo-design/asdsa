import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PluginManager } from 'sn-plugin-lib';
import {
  InstalledApp, MAX_SHORTCUTS, Shortcut, exportIcon,
  listInstalledApps, loadShortcuts, registerShortcutButtons, saveShortcuts,
} from './src/shortcuts';

export default function App() {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      setApps(await listInstalledApps());
      setSelected((await loadShortcuts()).map(s => s.pkg));
    })();
  }, []);

  const toggle = (pkg: string) =>
    setSelected(cur =>
      cur.includes(pkg)
        ? cur.filter(p => p !== pkg)
        : cur.length < MAX_SHORTCUTS ? [...cur, pkg] : cur,
    );

  const save = async () => {
    setBusy(true);
    const list: Shortcut[] = [];
    for (const pkg of selected) {
      const app = apps.find(a => a.pkg === pkg)!;
      list.push({ pkg, label: app.label, icon: await exportIcon(pkg) });
    }
    await saveShortcuts(list);
    await registerShortcutButtons(list);
    setBusy(false);
    PluginManager.closePluginView();
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Shortcuti u context meniju (max {MAX_SHORTCUTS})</Text>
      <FlatList
        data={apps}
        keyExtractor={a => a.pkg}
        renderItem={({ item }) => (
          <Pressable style={s.row} onPress={() => toggle(item.pkg)}>
            <Text style={s.check}>{selected.includes(item.pkg) ? '[x]' : '[ ]'}</Text>
            <Text style={s.label}>{item.label}</Text>
          </Pressable>
        )}
      />
      <View style={s.footer}>
        <Pressable style={s.btn} onPress={() => PluginManager.closePluginView()}>
          <Text style={s.btnText}>Otkaži</Text>
        </Pressable>
        <Pressable style={s.btn} onPress={save} disabled={busy}>
          <Text style={s.btnText}>{busy ? '...' : 'Sačuvaj'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// E-ink: crno-bijelo, bez animacija, veliki razmaci
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 26, fontWeight: '600', color: '#000', marginBottom: 16 },
  row: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#000' },
  check: { fontSize: 24, width: 56, color: '#000' },
  label: { fontSize: 24, color: '#000' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btn: { borderWidth: 2, borderColor: '#000', paddingVertical: 12, paddingHorizontal: 32 },
  btnText: { fontSize: 24, color: '#000' },
});
