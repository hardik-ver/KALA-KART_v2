import React from "react";

interface AppShellProps {
  children: React.ReactNode;
  theme?: "buyer" | "seller" | "dark";
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  theme = "seller",
  className = "",
}) => {
  const themeBg =
    theme === "dark"
      ? "bg-kk-ink text-white"
      : "bg-kk-surface text-kk-ink";

  return (
    <div
      id="app-root-shell"
      className={`w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden relative ${themeBg} ${className}`}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {children}
    </div>
  );
};
