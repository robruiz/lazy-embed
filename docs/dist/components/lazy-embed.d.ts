import type { Components, JSX } from "../types/components";

interface LazyEmbed extends Components.LazyEmbed, HTMLElement {}
export const LazyEmbed: {
    prototype: LazyEmbed;
    new (): LazyEmbed;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
