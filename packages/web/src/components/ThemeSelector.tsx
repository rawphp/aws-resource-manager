import { useTheme, THEMES } from '../hooks/useTheme';

const labels: Record<string, string> = {
  light: 'Light',
  dark: 'Dark',
  cyberpunk: 'Cyberpunk',
};

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof theme)}
      aria-label="Theme"
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        fontSize: '0.85rem',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
      }}
    >
      {THEMES.map((t) => (
        <option key={t} value={t}>{labels[t] ?? t}</option>
      ))}
    </select>
  );
}
