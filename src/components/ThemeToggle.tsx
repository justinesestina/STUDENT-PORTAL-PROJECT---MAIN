import React, { forwardRef } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, showLabel = false }, ref) => {
    const { theme, toggleTheme } = useTheme();

    return (
      <Button
        ref={ref}
        variant="ghost"
        size={showLabel ? "default" : "icon"}
        onClick={toggleTheme}
        className={cn("transition-all duration-300 relative overflow-hidden", className)}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <Sun className={`h-5 w-5 transition-all duration-300 ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
        <Moon className={`absolute h-5 w-5 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
        {showLabel && <span className="ml-2">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
      </Button>
    );
  }
);

ThemeToggle.displayName = "ThemeToggle";
