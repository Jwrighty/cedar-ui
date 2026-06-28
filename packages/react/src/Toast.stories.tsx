import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Inline } from "./Inline";
import { Stack } from "./Stack";
import { Toast, useToast, type ToastMessage } from "./Toast";
import { toastMeta } from "./Toast.meta";
import { usageDocs } from "./usage-docs";

const meta = {
  title: "Components/Toast",
  component: Toast.Region,
  parameters: {
    docs: { description: { component: usageDocs(toastMeta) } },
  },
} satisfies Meta<typeof Toast.Region>;

export default meta;
type Story = StoryObj<typeof meta>;

function ToastControls() {
  const toast = useToast();

  return (
    <Inline gap="sm">
      <Button
        onPress={() =>
          toast.success({
            title: "Tags saved",
            description: "The trace now has 3 tags.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onPress={() =>
          toast.error({
            title: "Could not save tags",
            description: "Check your connection and try again.",
          })
        }
      >
        Error
      </Button>
    </Inline>
  );
}

export const Default: Story = {
  render: () => (
    <Toast.Provider>
      <Stack gap="md">
        <ToastControls />
      </Stack>
      <Toast.Region />
    </Toast.Provider>
  ),
};

const posedToasts: ToastMessage[] = [
  {
    id: "success",
    variant: "success",
    title: "Tags saved",
    description: "The trace now has 3 tags.",
    duration: null,
  },
  {
    id: "error",
    variant: "error",
    title: "Could not save tags",
    description: "Check your connection and try again.",
    duration: null,
  },
];

export const Variants: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Toast.Provider defaultToasts={posedToasts}>
      <Toast.Region />
    </Toast.Provider>
  ),
};

export const Stacking: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Toast.Provider
      defaultToasts={[
        ...posedToasts,
        {
          id: "retry",
          variant: "success",
          title: "Retry queued",
          description: "The failed run will start again shortly.",
          duration: null,
        },
      ]}
    >
      <Toast.Region />
    </Toast.Provider>
  ),
};

function AutoOpenDemo() {
  const toast = useToast();

  useEffect(() => {
    toast.success({
      id: "auto-open",
      title: "Replay started",
      description: "Demo mode is streaming trace events.",
      duration: null,
    });
  }, [toast]);

  return <Toast.Region />;
}

export const AutoOpen: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Toast.Provider>
      <AutoOpenDemo />
    </Toast.Provider>
  ),
};
