"use client";

import * as React from "react";
import { SidebarTrigger } from "@/lib/ui/admin/sidebar";
import { Separator } from "@/lib/ui/admin/separator";

export type HeaderState = {
  title?: string;
};

type HeaderContextValue = {
  state: HeaderState;
  setState: (headerState: HeaderState) => void;
};

const HeaderContext = React.createContext<HeaderContextValue | null>(null);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<HeaderState>({});

  const value = React.useMemo(() => ({ state, setState }), [state]);

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeader(headerState?: HeaderState) {
  const ctx = React.useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used within HeaderProvider");

  const { state, setState } = ctx;
  const title = headerState?.title;

  React.useLayoutEffect(() => {
    if (title !== undefined && state.title !== title) {
      setState({ title });
    }
  }, [title, state.title, setState]);

  return state;
}

export function Header() {
  const { title } = useHeader();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <div className="flex flex-1 items-center gap-2">
          {title && <h1 className="text-base font-medium">{title}</h1>}
        </div>
      </div>
    </header>
  );
}
