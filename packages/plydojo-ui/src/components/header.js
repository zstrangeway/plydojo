"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./button.js";
export function Header({ logoComponent, navigationItems = [], onLoginClick, onSignUpClick, }) {
    return (_jsx("header", { className: "bg-background border-b px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-between max-w-7xl mx-auto", children: [_jsx("div", { className: "text-xl font-semibold", children: logoComponent || "PlyDojo" }), _jsx("nav", { className: "hidden md:flex items-center gap-6", children: navigationItems.map((item) => (_jsx("a", { href: item.href, className: "text-sm hover:text-foreground/80", children: item.label }, item.href))) }), _jsxs("div", { className: "flex items-center gap-2", children: [onLoginClick && (_jsx(Button, { variant: "outline", size: "sm", onClick: onLoginClick, children: "Login" })), onSignUpClick && (_jsx(Button, { size: "sm", onClick: onSignUpClick, children: "Sign Up" }))] })] }) }));
}
