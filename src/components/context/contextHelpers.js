import { useContext } from "react";

export function getContext(ctx, hookName, providerName) {
    const context = useContext(ctx);
    if (!context) {
        throw new Error(`${hookName} must be used within a ${providerName}`);
    }
    return context;
}