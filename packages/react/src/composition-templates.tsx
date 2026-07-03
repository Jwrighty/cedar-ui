"use client";

import { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";
import { Checkbox } from "./Checkbox";
import { Dialog } from "./Dialog";
import { Heading } from "./Heading";
import { Inline } from "./Inline";
import { Radio, RadioGroup } from "./RadioGroup";
import { Skeleton } from "./Skeleton";
import { Stack } from "./Stack";
import { Switch } from "./Switch";
import { Table, TableCell, TableHeaderCell, TableRow } from "./Table";
import { Tabs } from "./Tabs";
import { Text } from "./Text";
import { TextField } from "./TextField";
import type { TemplateMeta } from "./meta";

export const formDialogTemplate: TemplateMeta = {
  id: "form-dialog",
  summary:
    "A modal form for collecting a short set of fields before confirming or cancelling.",
  useWhen: [
    "Opening a focused create, edit, or confirmation flow without navigating away from the current page.",
    "Collecting a small number of fields where users need explicit primary and secondary actions.",
    "Keeping form controls, helper text, and footer actions inside one accessible modal dialog.",
  ],
  components: ["Dialog", "Stack", "TextField", "Inline", "Button", "Text"],
  skeleton: `<Dialog.Root>
  <Dialog.Trigger>Open form</Dialog.Trigger>
  <Dialog.Content>
    <Stack gap="lg">
      <Dialog.Title>Form title</Dialog.Title>
      <Stack as="form" gap="lg">
        <TextField label="Field label" />
      </Stack>
      <Inline gap="sm">
        <Dialog.Close>Cancel</Dialog.Close>
        <Button variant="primary">Submit</Button>
      </Inline>
    </Stack>
  </Dialog.Content>
</Dialog.Root>`,
  status: "experimental",
};

export function FormDialogTemplateExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Create project</Dialog.Trigger>
      <Dialog.Content>
        <Stack gap="lg">
          <Dialog.Title>Create project</Dialog.Title>
          <Stack as="form" gap="lg">
            <Text tone="muted">
              Add the project details. You can change these later.
            </Text>
            <TextField
              label="Project name"
              description="Use the name your team will recognize."
              placeholder="Platform migration"
            />
            <TextField
              label="Owner email"
              type="email"
              placeholder="owner@example.com"
            />
          </Stack>
          <Inline gap="sm">
            <Dialog.Close>Cancel</Dialog.Close>
            <Button variant="primary">Create project</Button>
          </Inline>
        </Stack>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export const filterableTableTemplate: TemplateMeta = {
  id: "filterable-table",
  summary:
    "A searchable data table with filters, status context, and row-level actions owned by app state.",
  useWhen: [
    "Building a list view where users scan rows, filter by text or status, and act on individual records.",
    "Keeping Cedar responsible for table presentation while the product owns query state, sorting, pagination, and row navigation.",
    "Pairing filter controls and result metadata with a native table instead of inventing a card grid for tabular data.",
  ],
  components: [
    "Stack",
    "Inline",
    "TextField",
    "Button",
    "Badge",
    "Table",
    "TableRow",
    "TableHeaderCell",
    "TableCell",
    "Text",
  ],
  skeleton: `<Stack gap="lg">
  <Stack gap="sm">
    <Inline gap="sm">
      <TextField label="Search" />
      <Button variant="secondary">Clear</Button>
    </Inline>
    <Text tone="muted">Result count</Text>
  </Stack>
  <Table>
    <thead>
      <TableRow>
        <TableHeaderCell>Primary label</TableHeaderCell>
        <TableHeaderCell>Status</TableHeaderCell>
        <TableHeaderCell align="end">Action</TableHeaderCell>
      </TableRow>
    </thead>
    <tbody>
      <TableRow isInteractive>
        <TableCell>Row label</TableCell>
        <TableCell><Badge>Status</Badge></TableCell>
        <TableCell align="end"><Button variant="ghost">Open</Button></TableCell>
      </TableRow>
    </tbody>
  </Table>
</Stack>`,
  status: "experimental",
};

const filterableTableRuns = [
  {
    id: "run_1842",
    status: "success" as const,
    statusLabel: "Complete",
    latency: "842 ms",
  },
  {
    id: "run_1843",
    status: "running" as const,
    statusLabel: "Running",
    latency: "1.2 s",
  },
];

export function FilterableTableTemplateExample() {
  const [query, setQuery] = useState("");
  const visibleRuns = filterableTableRuns.filter((run) =>
    run.id.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Inline gap="sm">
          <TextField
            label="Search runs"
            placeholder="Trace id or owner"
            description="Filter the visible rows before opening a detail view."
            value={query}
            onChange={setQuery}
          />
          <Button
            variant="secondary"
            isDisabled={query.trim() === ""}
            onPress={() => setQuery("")}
          >
            Clear
          </Button>
        </Inline>
        <Text size="sm" tone="muted">
          Showing {visibleRuns.length} of {filterableTableRuns.length} runs
        </Text>
      </Stack>
      <Table density="compact">
        <thead>
          <TableRow>
            <TableHeaderCell>Run</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell align="end" isNumeric>
              Latency
            </TableHeaderCell>
            <TableHeaderCell align="end">Action</TableHeaderCell>
          </TableRow>
        </thead>
        <tbody>
          {visibleRuns.map((run) => (
            <TableRow key={run.id} isInteractive>
              <TableCell>{run.id}</TableCell>
              <TableCell>
                <Badge status={run.status}>{run.statusLabel}</Badge>
              </TableCell>
              <TableCell align="end" isNumeric>
                {run.latency}
              </TableCell>
              <TableCell align="end">
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Stack>
  );
}

export const settingsPageTemplate: TemplateMeta = {
  id: "settings-page",
  summary:
    "A settings screen with sectioned cards, immediate toggles, form fields, and explicit save actions.",
  useWhen: [
    "Building account, workspace, billing, or notification settings that need grouped sections and repeat visits.",
    "Separating immediate settings such as switches from form settings that require an explicit save action.",
    "Keeping page hierarchy, helper copy, and controls predictable instead of scattering settings in unrelated panels.",
  ],
  components: [
    "Stack",
    "Inline",
    "Heading",
    "Text",
    "Card",
    "CardHeader",
    "CardBody",
    "CardFooter",
    "Switch",
    "Checkbox",
    "RadioGroup",
    "Radio",
    "TextField",
    "Button",
  ],
  skeleton: `<Stack gap="lg">
  <Stack gap="sm">
    <Heading level={1}>Settings</Heading>
    <Text tone="muted">Describe what these settings control.</Text>
  </Stack>
  <Card>
    <CardHeader><Heading level={2}>Section title</Heading></CardHeader>
    <CardBody>
      <Stack gap="lg">
        <Switch>Immediate setting</Switch>
        <TextField label="Saved field" />
      </Stack>
    </CardBody>
    <CardFooter>
      <Inline gap="sm">
        <Button variant="primary">Save changes</Button>
        <Button variant="secondary">Cancel</Button>
      </Inline>
    </CardFooter>
  </Card>
</Stack>`,
  status: "experimental",
};

export function SettingsPageTemplateExample() {
  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Heading level={1} size="xl">
          Workspace settings
        </Heading>
        <Text tone="muted">
          Manage notifications, defaults, and billing contacts for this
          workspace.
        </Text>
      </Stack>
      <Card>
        <CardHeader>
          <Heading level={2} size="sm">
            Notifications
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack gap="lg">
            <Switch defaultSelected>Email run failures</Switch>
            <Checkbox defaultSelected>Include weekly summary</Checkbox>
            <RadioGroup label="Digest cadence" defaultValue="daily">
              <Radio value="daily">Daily</Radio>
              <Radio value="weekly">Weekly</Radio>
            </RadioGroup>
          </Stack>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <Heading level={2} size="sm">
            Billing contact
          </Heading>
        </CardHeader>
        <CardBody>
          <TextField
            label="Billing email"
            type="email"
            placeholder="billing@example.com"
          />
        </CardBody>
        <CardFooter>
          <Inline gap="sm">
            <Button variant="primary">Save changes</Button>
            <Button variant="secondary">Cancel</Button>
          </Inline>
        </CardFooter>
      </Card>
    </Stack>
  );
}

export const asyncStatePanelTemplate: TemplateMeta = {
  id: "async-state-panel",
  summary:
    "A consistent loading, empty, and error state set for a data-backed panel or page section.",
  useWhen: [
    "Representing the lifecycle of a query or mutation-backed surface without changing the surrounding layout.",
    "Keeping loading geometry, empty guidance, and recoverable errors visually related instead of designing each state differently.",
    "Giving agents a complete state pattern before they wire real data, retries, and creation actions.",
  ],
  components: [
    "Card",
    "CardHeader",
    "CardBody",
    "CardFooter",
    "Stack",
    "Inline",
    "Heading",
    "Text",
    "Skeleton",
    "Badge",
    "Button",
    "Tabs",
  ],
  skeleton: `<Card>
  <CardHeader>
    <Heading level={2}>Panel title</Heading>
  </CardHeader>
  <CardBody>
    <Stack gap="md">
      <Skeleton shape="text" />
      <Skeleton shape="rounded" />
      <Text tone="muted">Empty or error copy replaces skeletons.</Text>
    </Stack>
  </CardBody>
  <CardFooter>
    <Inline gap="sm">
      <Button variant="primary">Primary action</Button>
      <Button variant="secondary">Retry</Button>
    </Inline>
  </CardFooter>
</Card>`,
  status: "experimental",
};

export function AsyncStatePanelTemplateExample() {
  return (
    <Card>
      <CardHeader>
        <Inline gap="sm">
          <Heading level={2} size="sm">
            Recent runs
          </Heading>
          <Badge status="running">Loading</Badge>
        </Inline>
      </CardHeader>
      <CardBody>
        <Tabs.Root defaultSelectedKey="loading">
          <Tabs.List aria-label="Panel states">
            <Tabs.Tab id="loading">Loading</Tabs.Tab>
            <Tabs.Tab id="empty">Empty</Tabs.Tab>
            <Tabs.Tab id="error">Error</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel id="loading">
            <Stack gap="sm" aria-label="Loading recent runs">
              <Skeleton shape="text" />
              <Skeleton shape="text" />
              <Skeleton shape="rounded" style={{ height: 96 }} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel id="empty">
            <Stack gap="md">
              <Stack gap="sm">
                <Heading level={3} size="sm">
                  No runs yet
                </Heading>
                <Text tone="muted">
                  Start a run to populate this panel with live activity.
                </Text>
              </Stack>
              <Button variant="primary" style={{ width: "100%" }}>
                Start run
              </Button>
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel id="error">
            <Stack gap="md">
              <Stack gap="sm">
                <Heading level={3} size="sm" tone="danger">
                  Could not load runs
                </Heading>
                <Text tone="muted">
                  Keep the panel in place and offer a retry path.
                </Text>
              </Stack>
              <Button variant="secondary" style={{ width: "100%" }}>
                Retry
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs.Root>
      </CardBody>
    </Card>
  );
}

export const compositionTemplates = [
  asyncStatePanelTemplate,
  filterableTableTemplate,
  formDialogTemplate,
  settingsPageTemplate,
] as const;

export const templateExamples = {
  "async-state-panel": AsyncStatePanelTemplateExample,
  "filterable-table": FilterableTableTemplateExample,
  "form-dialog": FormDialogTemplateExample,
  "settings-page": SettingsPageTemplateExample,
} as const;
