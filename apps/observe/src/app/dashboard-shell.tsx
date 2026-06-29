"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  Box,
  Button,
  Heading,
  Inline,
  Stack,
  Tooltip,
} from "@jwrighty/cedar-react";

const THEME_STORAGE_KEY = "observe-theme";
const SIDEBAR_STORAGE_KEY = "observe-sidebar-collapsed";

type Theme = "light" | "dark";

const navigationItems = [
  { href: "/", label: "Overview", icon: "O" },
  { href: "/runs", label: "Live feed", icon: "R" },
  { href: "/runs/run_0001", label: "Trace detail", icon: "T" },
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
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeLabel = theme === "dark" ? "Dark theme" : "Light theme";

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
            {navigationItems.map((item) => {
              const isCurrent =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Tooltip.Trigger key={item.label} delay={500}>
                  <Link
                    className="dashboard-nav__link"
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <span className="dashboard-nav__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="dashboard-sidebar__label">
                      {item.label}
                    </span>
                  </Link>
                  <Tooltip placement="right">{item.label}</Tooltip>
                </Tooltip.Trigger>
              );
            })}
          </nav>

          <Box className="dashboard-sidebar__footer">
            <Tooltip.Trigger delay={500}>
              <Button
                className="dashboard-sidebar__toggle"
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
                <span aria-hidden="true">{isCollapsed ? ">>" : "<<"}</span>
                <span className="dashboard-sidebar__label">
                  {collapseLabel}
                </span>
              </Button>
              <Tooltip placement="right">{collapseLabel}</Tooltip>
            </Tooltip.Trigger>
          </Box>
        </Stack>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <Heading level={1} size="lg">
            Agent run telemetry
          </Heading>

          <Inline className="dashboard-header__actions" gap="sm">
            <span className="dashboard-env-pill">Production</span>
            <Button
              className="dashboard-theme-toggle"
              variant="secondary"
              size="sm"
              aria-label={`Switch to ${nextTheme} theme`}
              aria-pressed={theme === "dark"}
              onPress={() => {
                setTheme(nextTheme);
                document.documentElement.dataset.theme = nextTheme;
                window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
              }}
            >
              <span className="dashboard-theme-toggle__icon" aria-hidden="true">
                {theme === "dark" ? "D" : "L"}
              </span>
              <span suppressHydrationWarning>{themeLabel}</span>
            </Button>
          </Inline>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
