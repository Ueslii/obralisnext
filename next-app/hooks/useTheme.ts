"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'orange' | 'blue' | 'green' | 'violet' | 'teal' | 'red';

const ACCENT_TO_HSL: Record<AccentColor, string> = {
    orange: '25 95% 53%',      // Laranja Construtivo
    blue: '217 91% 60%',       // Azul Técnico
    green: '158 64% 52%',      // Verde Engenharia
    violet: '262 83% 58%',     // Violeta Criativo
    teal: '174 72% 45%',       // Turquesa Moderno
    red: '0 72% 51%',          // Vermelho Energia
};

export const useTheme = () => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const [accentColor, setAccentColor] = useState<AccentColor>('orange');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            const savedMode = (localStorage.getItem('obralis_theme_mode') as ThemeMode) || undefined;
            const savedAccent = (localStorage.getItem('obralis_accent_color') as AccentColor) || undefined;

            try {
                const { data } = await supabase.auth.getUser();
                const meta = (data.user?.user_metadata ?? {}) as any;
                const ui = meta.ui_prefs as { themeMode?: ThemeMode; accentColor?: AccentColor } | undefined;
                const mode = ui?.themeMode || savedMode || 'light';
                const accent = ui?.accentColor || savedAccent || 'orange';
                if (!mounted) return;
                setThemeMode(mode);
                setAccentColor(accent as AccentColor);
                applyThemeMode(mode);
                applyAccentColor(accent as AccentColor);
            } catch {
                const mode = savedMode || 'light';
                const accent = savedAccent || 'orange';
                if (!mounted) return;
                setThemeMode(mode);
                setAccentColor(accent as AccentColor);
                applyThemeMode(mode);
                applyAccentColor(accent as AccentColor);
            }
        };
        void load();
        return () => {
            mounted = false;
        };
    }, []);

    const persistUiPrefs = async (mode: ThemeMode, accent: AccentColor) => {
        localStorage.setItem('obralis_theme_mode', mode);
        localStorage.setItem('obralis_accent_color', accent);
        try {
            await supabase.auth.updateUser({ data: { ui_prefs: { themeMode: mode, accentColor: accent } } });
        } catch {
            // ignore persistence errors (offline etc.)
        }
    };

    const applyThemeMode = (mode: ThemeMode) => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    const applyAccentColor = (color: AccentColor) => {
        const root = document.documentElement;
        const hsl = ACCENT_TO_HSL[color];
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
        root.style.setProperty('--sidebar-primary', hsl);
        root.style.setProperty('--sidebar-ring', hsl);
        // primary gradient aligned to the accent
        root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${hsl}), hsl(${hsl}))`);
    };

    const toggleTheme = () => {
        const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
        applyThemeMode(newMode);
        void persistUiPrefs(newMode, accentColor);
    };

    const changeAccent = (color: AccentColor) => {
        setAccentColor(color);
        applyAccentColor(color);
        void persistUiPrefs(themeMode, color);
    };

    return { themeMode, accentColor, toggleTheme, changeAccent };
};
