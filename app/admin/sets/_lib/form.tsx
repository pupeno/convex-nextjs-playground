"use client";

import React, { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/lib/ui/admin/form";
import { Input } from "@/lib/ui/admin/input";
import { Button } from "@/lib/ui/button";
import { IconDeviceFloppy, IconTrash, IconX } from "@tabler/icons-react";
import { ConfirmDialog } from "@/lib/ui/admin/confirm-dialog";
import { type SetApi, validateSet } from "@/lib/validation/sets";
import type { ValidationResult } from "@/lib/validation/validation";
import type { Id } from "@/convex/_generated/dataModel";
import { valuesFromFormToApi, errorsFromApiToForm } from "@/lib/rhf";

/**
 * This is the type of the sets when they are being used in the form. It uses
 * `""` to represent blank fields.
 *
 * See also:
 * * @SetApi for the type of the sets when they are being serialized through the API.
 * * @SetValues for the superset of all set types for the purpose of validation.
 */
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
  onSubmitAction: (set: SetApi) => Promise<ValidationResult<Id<"sets">>>;
  onCancelAction: () => void;
  onDeleteAction?: () => Promise<void>;
}) {
  const resolver: Resolver<SetFormValues> = async (values) => {
    const result = validateSet(values);
    if (result.ok) {
      return { values, errors: {} };
    }
    return { values: {}, errors: errorsFromApiToForm(values, result.errors) };
  };

  const form = useForm<SetFormValues>({
    resolver,
    ...(set ? { values: set } : {}),
    defaultValues: setFormDefaults,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const result = await onSubmitAction(valuesFromFormToApi<SetApi>(values));
    if (!result.ok) {
      const fieldErrors = errorsFromApiToForm(values, result.errors);
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
