"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/lib/ui/admin/form";
import { Input } from "@/lib/ui/admin/input";
import { Button } from "@/lib/ui/button";
import { IconDeviceFloppy, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ConfirmDialog } from "@/lib/ui/admin/confirm-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CompetitionValidator } from "./validation";

type CompetitionInput = z.input<typeof CompetitionValidator>;
type CompetitionOutput = z.output<typeof CompetitionValidator>;

export function CompetitionForm({ competition, onSubmitAction, onCancelAction, onDeleteAction }:
  {
    competition?: CompetitionInput,
    onSubmitAction: (competition: CompetitionOutput) => Promise<void>;
    onCancelAction: () => void;
    onDeleteAction?: () => Promise<void>;
  }
) {
  const form = useForm<CompetitionInput, any, CompetitionOutput>({
    resolver: zodResolver(CompetitionValidator),
    ...(competition ? { values: competition } : {}),
    defaultValues: {
      title: "",
      number1: "",
      number2: ""
    }
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const competition: CompetitionOutput = CompetitionValidator.parse(values);
    await onSubmitAction(competition);
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number 1</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number 2</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="order-3 md:order-1">
            {onDeleteAction ? (
              <Button
                className="w-full md:w-auto"
                type="button"
                variant="destructive"
                onClick={() => setConfirmOpen(true)}>
                <IconTrash />
                Delete
              </Button>
            ) : null}
          </div>
          <div className="order-1 md:order-2 flex flex-col gap-2 md:flex-row md:gap-2 md:justify-end md:items-center">
            <Button className="w-full md:w-auto order-1 md:order-2" type="submit">
              <IconDeviceFloppy />
              Save
            </Button>
            <Button
              className="w-full md:w-auto order-2 md:order-1"
              type="button"
              variant="outline"
              onClick={onCancelAction}>
              <IconX />
              Cancel
            </Button>
          </div>
        </div>
      </form>

      {onDeleteAction ? (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirm deletion"
          description={`Are you sure you want to delete "${competition?.title ?? ""}"?`}
          onConfirm={async () => {
            await onDeleteAction();
          }}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmVariant="destructive"
        />
      ) : null}
    </Form>
  );
}
