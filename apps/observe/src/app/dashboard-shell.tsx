"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";

import { Button, Inline, Stack, Tooltip } from "@jwrighty/cedar-react";

import { DemoModeControl } from "./demo-mode-control";

const THEME_STORAGE_KEY = "observe-theme";
const SIDEBAR_STORAGE_KEY = "observe-sidebar-collapsed";

type Theme = "light" | "dark";

const navigationItems: Array<{
  href: string;
  label: string;
  Icon: LucideIcon;
}> = [
  { href: "/", label: "Overview", Icon: LayoutDashboard },
  { href: "/runs", label: "Live feed", Icon: Activity },
  { href: "/runs/run_0001", label: "Trace detail", Icon: Waypoints },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme = storedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;

    setIsCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  }, []);

  const collapseLabel = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
  const CollapseIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;
  const nextTheme = theme === "dark" ? "light" : "dark";
  const ThemeIcon = theme === "dark" ? Moon : Sun;

  const shellClassName = useMemo(
    () =>
      isCollapsed
        ? "dashboard-shell dashboard-shell--collapsed"
        : "dashboard-shell",
    [isCollapsed],
  );

  return (
    <div className={shellClassName}>
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <Stack className="dashboard-sidebar__inner" gap="lg">
          <Inline className="dashboard-brand" gap="sm">
            <span className="dashboard-brand__mark" aria-hidden="true">
              C
            </span>
            <span className="dashboard-sidebar__label dashboard-brand__name">
              Cedar observe
            </span>
          </Inline>

          <nav className="dashboard-nav" aria-label="Primary">
            {navigationItems.map(({ href, label, Icon }) => {
              const isCurrent =
                href === "/" ? pathname === href : pathname.startsWith(href);

              return (
                <Tooltip.Trigger key={label} delay={500}>
                  <Link
                    className="dashboard-nav__link"
                    href={href}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <Icon
                      className="dashboard-nav__icon"
                      size={16}
                      aria-hidden="true"
                    />
                    <span className="dashboard-sidebar__label">{label}</span>
                  </Link>
                  <Tooltip placement="right">{label}</Tooltip>
                </Tooltip.Trigger>
              );
            })}
          </nav>
        </Stack>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <Tooltip.Trigger delay={500}>
            <Button
              className="dashboard-icon-button"
              variant="ghost"
              size="sm"
              aria-label={collapseLabel}
              aria-expanded={!isCollapsed}
              onPress={() => {
                const nextValue = !isCollapsed;
                setIsCollapsed(nextValue);
                window.localStorage.setItem(
                  SIDEBAR_STORAGE_KEY,
                  String(nextValue),
                );
              }}
            >
              <CollapseIcon size={16} aria-hidden="true" />
            </Button>
            <Tooltip placement="bottom">{collapseLabel}</Tooltip>
          </Tooltip.Trigger>

          <Inline className="dashboard-header__actions" gap="sm">
            <Suspense fallback={null}>
              <DemoModeControl />
            </Suspense>
            <Tooltip.Trigger delay={500}>
              <Button
                className="dashboard-icon-button"
                variant="ghost"
                size="sm"
                aria-label={`Switch to ${nextTheme} theme`}
                aria-pressed={theme === "dark"}
                onPress={() => {
                  setTheme(nextTheme);
                  document.documentElement.dataset.theme = nextTheme;
                  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
                }}
              >
                <ThemeIcon size={16} aria-hidden="true" />
              </Button>
              <Tooltip placement="bottom">{`Switch to ${nextTheme} theme`}</Tooltip>
            </Tooltip.Trigger>
          </Inline>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
