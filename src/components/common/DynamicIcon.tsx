import React from "react";
import * as Icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = "w-5 h-5", size = 20 }) => {
  // Normalize lookup
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "");
  const IconComponent = (Icons as any)[cleanName] || (Icons as any)[name] || Icons.Sparkles;

  return <IconComponent className={className} size={size} />;
};
