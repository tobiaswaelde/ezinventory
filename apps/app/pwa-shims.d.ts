declare module '#imports' {
  export function defineNuxtPlugin<T>(plugin: T): T;
}

declare module '#build/pwa-icons/pwa-icons' {
  export type PWAAssetIcon = Record<string, never>;
  export type PWAIcons = {
    transparent: Record<string, PWAAssetIcon>;
    maskable: Record<string, PWAAssetIcon>;
    favicon: Record<string, PWAAssetIcon>;
    apple: Record<string, PWAAssetIcon>;
    appleSplashScreen: Record<string, PWAAssetIcon>;
  };
}
