import React from "react";
interface HeaderProps {
    logoComponent?: React.ReactNode;
    navigationItems?: Array<{
        href: string;
        label: string;
    }>;
    onLoginClick?: () => void;
    onSignUpClick?: () => void;
}
export declare function Header({ logoComponent, navigationItems, onLoginClick, onSignUpClick, }: HeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=header.d.ts.map