import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle color theme">
      {theme === 'light' ? <MoonStar size={16} /> : <SunMedium size={16} />}
    </Button>
  );
};
