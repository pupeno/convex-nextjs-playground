"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/lib/ui/admin/form";
import { Input } from "@/lib/ui/admin/input";
import { Button } from "@/lib/ui/button";
import { IconDeviceFloppy, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ConfirmDialog } from "@/lib/ui/admin/confirm-dialog";
import { Competition } from "@/lib/validation/competitions";
import { validateCompetitionFrontend } from "./validation";
import type { Resolver } from "react-hook-form";
import { fromFormValues, toFieldErrors } from "@/lib/rhf";

export type CompetitionFormValues = {
  title: string;
  number1: string;
  number2: string;
};
export const competitionFormDefaults: CompetitionFormValues = {
  title: "",
  number1: "",
  number2: "",
};

export function CompetitionForm({ competition, onSubmitAction, onCancelAction, onDeleteAction }:
  {
    competition?: CompetitionFormValues,
    onSubmitAction: (competition: Competition) => Promise<void>;
    onCancelAction: () => void;
    onDeleteAction?: () => Promise<void>;
  }
) {
  const resolver: Resolver<CompetitionFormValues> = async (values) => {
    const result = validateCompetitionFrontend(values);
    return result.ok ? { values, errors: {} } : { values: {}, errors: toFieldErrors(values, result) };
  };

  const form = useForm<CompetitionFormValues>({
    resolver,
    ...(competition ? { values: competition } : {}),
    defaultValues: competitionFormDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmitAction(fromFormValues<Competition>(values));
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col gap-4"
        onSubmit={handleSubmit}>
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
                <Input placeholder="Optional" {...field} />
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
