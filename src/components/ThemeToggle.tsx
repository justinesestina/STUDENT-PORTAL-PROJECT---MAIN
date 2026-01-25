import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      onClick={toggleTheme}
      className={cn("transition-all duration-300", className)}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5" />
          {showLabel && <span className="ml-2">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="h-5 w-5" />
          {showLabel && <span className="ml-2">Light Mode</span>}
        </>
      )}
    </Button>
  );
};
