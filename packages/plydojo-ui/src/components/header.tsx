"use client";

import React from "react";
import { Button } from "./button.js";

interface HeaderProps {
  logoComponent?: React.ReactNode;
  navigationItems?: Array<{
    href: string;
    label: string;
  }>;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

export function Header({
  logoComponent,
  navigationItems = [],
  onLoginClick,
  onSignUpClick,
}: HeaderProps) {
  return (
    <header className="bg-background border-b px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-xl font-semibold">
          {logoComponent || "PlyDojo"}
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm hover:text-foreground/80"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {onLoginClick && (
            <Button variant="outline" size="sm" onClick={onLoginClick}>
              Login
            </Button>
          )}
          {onSignUpClick && (
            <Button size="sm" onClick={onSignUpClick}>
              Sign Up
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
