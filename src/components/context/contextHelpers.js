import { useContext } from "react";

// Named use* so React's rules-of-hooks lint can see it for what it is: a hook
// that every use* wrapper below delegates to.
export function useSafeContext(ctx, hookName, providerName) {
    const context = useContext(ctx);
    if (!context) {
        throw new Error(`${hookName} must be used within a ${providerName}`);
    }
    return context;
}
