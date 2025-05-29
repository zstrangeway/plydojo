import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../lib/utils.js";
const Form = React.forwardRef(({ className, ...props }, ref) => {
    return _jsx("form", { className: cn("space-y-6", className), ref: ref, ...props });
});
Form.displayName = "Form";
const FormField = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("space-y-2", className), ...props })));
FormField.displayName = "FormField";
const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
    if (!children) {
        return null;
    }
    return (_jsx("p", { ref: ref, className: cn("text-sm font-medium text-destructive", className), ...props, children: children }));
});
FormMessage.displayName = "FormMessage";
export { Form, FormField, FormMessage };
