'use client';

import * as React from 'react';

/**
 * Frame içine yerleşen overlay'lerin (chat drawer, dialog, modal) hangi
 * DOM container'a portal'lanacağını belirten context. Yolcu/sürücü mobil
 * çerçevesinde her şey çerçevenin içinde kalsın diye kullanılır.
 */
const FrameContainerContext = React.createContext<HTMLElement | null>(null);

export function FrameContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null;
  children: React.ReactNode;
}) {
  return (
    <FrameContainerContext.Provider value={container}>
      {children}
    </FrameContainerContext.Provider>
  );
}

/**
 * Mobil çerçevenin DOM elementini döner. Henüz mount olmadıysa null.
 * createPortal'a güvenle geçilebilir (null verirsek portal render etmeyiz).
 */
export function useFrameContainer(): HTMLElement | null {
  return React.useContext(FrameContainerContext);
}
