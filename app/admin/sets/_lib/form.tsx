"use client";

import React from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/lib/ui/admin/form";
import { Input } from "@/lib/ui/admin/input";
import { Button } from "@/lib/ui/button";
import { IconDeviceFloppy, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ConfirmDialog } from "@/lib/ui/admin/confirm-dialog";
import { validateSet } from "@/lib/validation/sets";
import { fromFormValues, toFieldErrors } from "@/lib/rhf";

export type SetApi = {
  name: string;
  mandatoryNumber: number;
  uniqueNumber: number;
  optionalNumber: number | null;
  optionalPositiveNumber: number | null;
};

export type SetFormValues = {
  name: string;
  mandatoryNumber: string;
  uniqueNumber: string;
  optionalNumber: string;
  optionalPositiveNumber: string;
};

export const setFormDefaults: SetFormValues = {
  name: "",
  mandatoryNumber: "",
  uniqueNumber: "",
  optionalNumber: "",
  optionalPositiveNumber: "",
};

export function SetForm({
  set,
  onSubmitAction,
  onCancelAction,
  onDeleteAction,
}: {
  set?: SetFormValues;
  onSubmitAction: (set: SetApi) => Promise<{ ok: true; id: string } | { ok: false; errors: Record<string, string> }>;
  onCancelAction: () => void;
  onDeleteAction?: () => Promise<void>;
}) {
  const resolver: Resolver<SetFormValues> = async (values) => {
    const result = validateSet(values);
    return result.ok ? { values, errors: {} } : { values: {}, errors: toFieldErrors(values, result) };
  };

  const form = useForm<SetFormValues>({
    resolver,
    ...(set ? { values: set } : {}),
    defaultValues: setFormDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const result = await onSubmitAction(fromFormValues<SetApi>(values));
    if (!result.ok) {
      const fieldErrors = toFieldErrors(values, result);
      for (const name in fieldErrors) {
        const err = fieldErrors[name as keyof SetFormValues];
        if (err) {
          form.setError(name as keyof SetFormValues, err);
        }
      }
    }
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Form {...form}>
      <form className="flex h-full flex-col gap-4" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mandatoryNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mandatory Number</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Required" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="uniqueNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique Number</FormLabel>
              <FormControl>
                <Input type="number" step="1" placeholder="Required and unique" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="optionalNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optional Number</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="optionalPositiveNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optional Positive Number</FormLabel>
              <FormControl>
                <Input placeholder="Optional, positive" {...field} />
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
          description={`Are you sure you want to delete "${set?.name ?? ""}"?`}
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
