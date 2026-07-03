import { Badge } from "./Badge";
import { Box } from "./Box";
import { Button } from "./Button";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";
import { Checkbox } from "./Checkbox";
import { Dialog } from "./Dialog";
import { Heading } from "./Heading";
import { IconButton } from "./IconButton";
import { Inline } from "./Inline";
import { Popover } from "./Popover";
import { Radio, RadioGroup } from "./RadioGroup";
import { Skeleton } from "./Skeleton";
import { Stack } from "./Stack";
import { Stat } from "./Stat";
import { Switch } from "./Switch";
import { Table, TableCell, TableHeaderCell, TableRow } from "./Table";
import { Tabs } from "./Tabs";
import { Text } from "./Text";
import { TextField } from "./TextField";
import { Toast } from "./Toast";
import { Tooltip } from "./Tooltip";

export function BadgeExample() {
  return <Badge status="running">Syncing</Badge>;
}

export function BoxExample() {
  return (
    <Box as="section" padding="lg" aria-label="Billing summary">
      <Text>Next invoice: $128.00</Text>
    </Box>
  );
}

export function ButtonExample() {
  return <Button variant="primary">Save changes</Button>;
}

export function CardExample() {
  return (
    <Card>
      <CardHeader>
        <Heading level={2} size="sm">
          Project health
        </Heading>
      </CardHeader>
      <CardBody>
        <Text tone="muted">All checks passed in the last run.</Text>
      </CardBody>
      <CardFooter>
        <Button variant="secondary">View details</Button>
      </CardFooter>
    </Card>
  );
}

export function CheckboxExample() {
  return <Checkbox defaultSelected>Include archived runs</Checkbox>;
}

export function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Delete project</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Delete project?</Dialog.Title>
        <Text>This action cannot be undone.</Text>
        <Inline gap="sm">
          <Dialog.Close>Cancel</Dialog.Close>
          <Dialog.Close variant="primary">Delete</Dialog.Close>
        </Inline>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function HeadingExample() {
  return (
    <Heading level={2} size="lg">
      Billing details
    </Heading>
  );
}

export function IconButtonExample() {
  return (
    <IconButton aria-label="Close" variant="ghost" size="sm">
      <span aria-hidden="true">x</span>
    </IconButton>
  );
}

export function InlineExample() {
  return (
    <Inline as="nav" gap="sm" aria-label="Pagination">
      <Button variant="secondary">Previous</Button>
      <Button variant="secondary">Next</Button>
    </Inline>
  );
}

export function PopoverExample() {
  return (
    <Popover.Root>
      <Popover.Trigger>View details</Popover.Trigger>
      <Popover.Content aria-label="Project details">
        <Text>Last updated today.</Text>
        <Button variant="secondary">Open project</Button>
      </Popover.Content>
    </Popover.Root>
  );
}

export function RadioGroupExample() {
  return (
    <RadioGroup label="Plan" defaultValue="pro">
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
    </RadioGroup>
  );
}

export function SkeletonExample() {
  return <Skeleton shape="rounded" style={{ height: 96, width: 240 }} />;
}

export function StackExample() {
  return (
    <Stack as="ul" gap="sm">
      <li>Queued</li>
      <li>Running</li>
      <li>Complete</li>
    </Stack>
  );
}

export function StatExample() {
  return (
    <Stat
      label="Runs"
      value="1,248"
      delta={{ direction: "positive", value: "+8%" }}
    />
  );
}

export function SwitchExample() {
  return <Switch defaultSelected>Enable notifications</Switch>;
}

export function TabsExample() {
  return (
    <Tabs.Root defaultSelectedKey="details">
      <Tabs.List aria-label="Project sections">
        <Tabs.Tab id="details">Details</Tabs.Tab>
        <Tabs.Tab id="activity">Activity</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel id="details">Project details</Tabs.Panel>
      <Tabs.Panel id="activity">Recent activity</Tabs.Panel>
    </Tabs.Root>
  );
}

export function TableExample() {
  return (
    <Table>
      <thead>
        <TableRow>
          <TableHeaderCell>Run</TableHeaderCell>
          <TableHeaderCell align="end" isNumeric>
            Latency
          </TableHeaderCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow isInteractive>
          <TableCell>run_123</TableCell>
          <TableCell align="end" isNumeric>
            842 ms
          </TableCell>
        </TableRow>
      </tbody>
    </Table>
  );
}

export function TextExample() {
  return (
    <Text as="span" size="sm" tone="muted">
      Optional
    </Text>
  );
}

export function TextFieldExample() {
  return (
    <TextField
      label="Email"
      description="We will never share it."
      type="email"
      placeholder="you@example.com"
    />
  );
}

export function ToastExample() {
  return (
    <Toast.Provider
      defaultToasts={[
        {
          id: "saved",
          variant: "success",
          title: "Tags saved",
          description: "The trace now has 3 tags.",
          duration: null,
        },
      ]}
    >
      <Toast.Region />
    </Toast.Provider>
  );
}

export function TooltipExample() {
  return (
    <Tooltip.Trigger>
      <Button variant="secondary">Save</Button>
      <Tooltip>Save changes</Tooltip>
    </Tooltip.Trigger>
  );
}

export const canonicalExamples = {
  Badge: BadgeExample,
  Box: BoxExample,
  Button: ButtonExample,
  Card: CardExample,
  Checkbox: CheckboxExample,
  Dialog: DialogExample,
  Heading: HeadingExample,
  IconButton: IconButtonExample,
  Inline: InlineExample,
  Popover: PopoverExample,
  RadioGroup: RadioGroupExample,
  Skeleton: SkeletonExample,
  Stack: StackExample,
  Stat: StatExample,
  Switch: SwitchExample,
  Tabs: TabsExample,
  Table: TableExample,
  Text: TextExample,
  TextField: TextFieldExample,
  Toast: ToastExample,
  Tooltip: TooltipExample,
} as const;
