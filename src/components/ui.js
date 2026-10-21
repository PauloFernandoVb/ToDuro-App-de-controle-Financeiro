import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export function Screen({ children, footer, scroll = true }) {
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={s.content}>{children}</View>
        )}
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, onBack }) {
  return (
    <View style={s.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Voltar">
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Field({ label, error, right, style, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, error && s.inputError]}>
        <TextInput
          style={[s.input, style]}
          placeholderTextColor={colors.muted}
          selectionColor={colors.mint}
          {...props}
        />
        {right}
      </View>
      {error ? <Text style={s.errorTxt}>⚠ {error}</Text> : null}
    </View>
  );
}

export function Button({ title, onPress, variant = 'primary', style }) {
  const primary = variant === 'primary';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.btn, primary ? s.btnPrimary : s.btnOutline, style]}
    >
      <Text style={[s.btnTxt, primary ? { color: colors.midnight } : { color: colors.cloud }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Chips({ options, value, onChange }) {
  return (
    <View style={s.chips}>
      {options.map((op) => {
        const ativo = op === value;
        return (
          <TouchableOpacity
            key={op}
            onPress={() => onChange(op)}
            style={[s.chip, ativo && s.chipActive]}
            accessibilityState={{ selected: ativo }}
          >
            <Text style={[s.chipTxt, ativo && { color: colors.midnight, fontWeight: '700' }]}>
              {ativo ? '✓ ' : ''}{op}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function Banner({ type = 'info', message }) {
  if (!message) return null;
  const icon = type === 'error' ? '⚠' : type === 'success' ? '✓' : 'ℹ';
  return (
    <View style={[s.banner, type === 'error' && { borderColor: colors.cloud }]}>
      <Text style={s.bannerTxt}>{icon} {message}</Text>
    </View>
  );
}

export function BottomNav({ navigation, active }) {
  const itens = [
    { rota: 'Dashboard', icone: '⌂', nome: 'Início' },
    { rota: 'Historico', icone: '☰', nome: 'Histórico' },
    { rota: 'Cotacao', icone: '$', nome: 'Cotação' },
  ];
  return (
    <View style={s.nav}>
      {itens.map((i) => {
        const ativo = i.rota === active;
        return (
          <TouchableOpacity
            key={i.rota}
            style={s.navItem}
            onPress={() => !ativo && navigation.reset({ index: 0, routes: [{ name: i.rota }] })}
          >
            <Text style={[s.navIcon, ativo && { color: colors.mint }]}>{i.icone}</Text>
            <Text style={[s.navTxt, ativo && { color: colors.mint, fontWeight: '700' }]}>{i.nome}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.midnight },
  content: { padding: 20, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.navy, borderWidth: 1,
    borderColor: colors.steel, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  backTxt: { color: colors.cloud, fontSize: 20 },
  title: { color: colors.cloud, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 2 },
  card: { backgroundColor: colors.navy, borderRadius: 18, borderWidth: 1, borderColor: colors.steel, padding: 16 },
  label: { color: colors.muted, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, borderRadius: 14,
    borderWidth: 1, borderColor: colors.steel, paddingHorizontal: 14,
  },
  inputError: { borderColor: colors.cloud, borderWidth: 2 },
  input: { flex: 1, color: colors.cloud, fontSize: 16, minHeight: 50 },
  errorTxt: { color: colors.cloud, fontSize: 12, marginTop: 5 },
  btn: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  btnPrimary: { backgroundColor: colors.mint },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.steel },
  btnTxt: { fontSize: 16, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1,
    borderColor: colors.steel, backgroundColor: colors.navy,
  },
  chipActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  chipTxt: { color: colors.cloud, fontSize: 14 },
  banner: {
    backgroundColor: colors.mintSoft, borderColor: colors.mint, borderWidth: 1, borderRadius: 12,
    padding: 12, marginBottom: 14,
  },
  bannerTxt: { color: colors.cloud, fontSize: 14 },
  nav: {
    flexDirection: 'row', backgroundColor: colors.navy, borderTopWidth: 1, borderTopColor: colors.steel,
    paddingTop: 8, paddingBottom: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navIcon: { color: colors.muted, fontSize: 20 },
  navTxt: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
