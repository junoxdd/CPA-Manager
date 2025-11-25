import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Theme } from '../types';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('cpa_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('cpa_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-secondary hover:text-foreground hover:bg-surfaceHighlight transition-colors relative overflow-hidden group"
      title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
    >
      <div className="relative z-10">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </div>
    </button>
  );
};