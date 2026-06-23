"use client";

import { forwardRef } from "react";
import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  Tab as AriaTab,
  TabPanel as AriaTabPanel,
  composeRenderProps,
  type TabsProps as AriaTabsProps,
  type TabListProps as AriaTabListProps,
  type TabProps as AriaTabProps,
  type TabPanelProps as AriaTabPanelProps,
} from "react-aria-components";
import styles from "./Tabs.module.css";

/**
 * Props for {@link Tabs.Root}.
 *
 * Supports React Aria's controlled (`selectedKey` + `onSelectionChange`) and
 * uncontrolled (`defaultSelectedKey`) selection props, plus orientation,
 * keyboard activation, `className`, `style`, and `data-*` passthrough.
 */
export type TabsRootProps = AriaTabsProps;

/**
 * Props for {@link Tabs.List}.
 *
 * Provide either `aria-label` or `aria-labelledby` so assistive technology can
 * announce the tab strip's purpose. Tabs may be supplied as children or through
 * React Aria's collection props.
 */
export type TabsListProps<T extends object = object> = AriaTabListProps<T>;

/**
 * Props for {@link Tabs.Tab}.
 *
 * The `id` identifies the tab and connects it to the corresponding
 * `Tabs.Panel`. Use React Aria's `isDisabled` prop for unavailable tabs.
 */
export type TabsTabProps = AriaTabProps;

/**
 * Props for {@link Tabs.Panel}.
 *
 * The `id` should match its associated `Tabs.Tab`; React Aria wires the
 * `tab`/`tabpanel` roles and ARIA relationship. `className`, `style`, and
 * `data-*` attributes pass through to the panel element.
 */
export type TabsPanelProps = AriaTabPanelProps;

/**
 * Selection state owner for a tabbed interface.
 *
 * Use uncontrolled selection for simple cases:
 *
 * @example
 * <Tabs.Root defaultSelectedKey="details">
 *   <Tabs.List aria-label="Project sections">
 *     <Tabs.Tab id="details">Details</Tabs.Tab>
 *     <Tabs.Tab id="activity">Activity</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel id="details">Project details…</Tabs.Panel>
 *   <Tabs.Panel id="activity">Recent activity…</Tabs.Panel>
 * </Tabs.Root>
 *
 * Or control selection from app state with `selectedKey` and
 * `onSelectionChange`. Keyboard navigation, focus management, and ARIA
 * associations are delegated to React Aria Components.
 */
const Root = forwardRef<HTMLDivElement, TabsRootProps>(function Root(
  { className, ...props },
  ref,
) {
  return (
    <AriaTabs
      ref={ref}
      className={composeRenderProps(className, (className) =>
        className ? `${styles.root!} ${className}` : styles.root!,
      )}
      {...props}
    />
  );
});

/**
 * The tab strip. Must live inside {@link Tabs.Root}; pass an accessible label
 * with `aria-label` or `aria-labelledby`.
 */
const List = forwardRef<HTMLDivElement, TabsListProps>(function List(
  { className, ...props },
  ref,
) {
  return (
    <AriaTabList
      ref={ref}
      className={composeRenderProps(className, (className) =>
        className ? `${styles.list!} ${className}` : styles.list!,
      )}
      {...props}
    />
  );
});

/**
 * A selectable tab within {@link Tabs.List}. The `id` should match its
 * associated {@link Tabs.Panel}; use `isDisabled` to keep a tab visible but
 * unavailable.
 */
const Tab = forwardRef<HTMLDivElement, TabsTabProps>(function Tab(
  { className, ...props },
  ref,
) {
  return (
    <AriaTab
      ref={ref}
      className={composeRenderProps(className, (className) =>
        className ? `${styles.tab!} ${className}` : styles.tab!,
      )}
      {...props}
    />
  );
});

/**
 * The content region associated with a {@link Tabs.Tab}. React Aria delegates
 * the `role="tabpanel"` and `aria-labelledby` wiring.
 */
const Panel = forwardRef<HTMLDivElement, TabsPanelProps>(function Panel(
  { className, ...props },
  ref,
) {
  return (
    <AriaTabPanel
      ref={ref}
      className={composeRenderProps(className, (className) =>
        className ? `${styles.panel!} ${className}` : styles.panel!,
      )}
      {...props}
    />
  );
});

/**
 * Compound Tabs primitive built on React Aria Components.
 *
 * `Tabs.Root` owns selection, `Tabs.List` groups the tabs, `Tabs.Tab` renders
 * each selectable label, and `Tabs.Panel` renders the matching content. The
 * primitive re-themes through Cedar tokens and `[data-theme]` with no component
 * code changes.
 */
export const Tabs = {
  Root,
  List,
  Tab,
  Panel,
};
