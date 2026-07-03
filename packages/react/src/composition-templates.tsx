import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Inline } from "./Inline";
import { Stack } from "./Stack";
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
    <Dialog.Title>Form title</Dialog.Title>
    <Stack as="form" gap="md">
      <TextField label="Field label" />
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
        <Dialog.Title>Create project</Dialog.Title>
        <Stack as="form" gap="md">
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
          <Inline gap="sm">
            <Dialog.Close>Cancel</Dialog.Close>
            <Button variant="primary">Create project</Button>
          </Inline>
        </Stack>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export const compositionTemplates = [formDialogTemplate] as const;

export const templateExamples = {
  "form-dialog": FormDialogTemplateExample,
} as const;
