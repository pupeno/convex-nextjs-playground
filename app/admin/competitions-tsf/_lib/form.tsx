"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Competition, CompetitionValidator } from "@/lib/validation/competitions";
import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/admin/input";
import { Label } from "@/lib/ui/admin/label";
import { ConfirmDialog } from "@/lib/ui/admin/confirm-dialog";
import { IconDeviceFloppy, IconTrash, IconX } from "@tabler/icons-react";

type Props = {
  competition?: Competition;
  onSubmitAction: (competition: Competition) => Promise<void>;
  onCancelAction: () => void;
  onDeleteAction?: () => Promise<void>;
};

export function CompetitionForm({ competition, onSubmitAction, onCancelAction, onDeleteAction }: Props) {
  type FormValues = { title: string; fee: string; prize: string };

  const NumberFromString = z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().positive().finite().optional(),
  );

  const FormSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    fee: NumberFromString,
    prize: NumberFromString,
  });

  const form = useForm<FormValues, any>({
    defaultValues: {
      title: competition?.title ?? "",
      fee: competition?.fee !== undefined ? String(competition.fee) : "",
      prize: competition?.prize !== undefined ? String(competition.prize) : "",
    },
    validatorAdapter: zodValidator() as any,
    validators: {
      onBlur: FormSchema as any,
      onSubmit: FormSchema as any,
    },
    onSubmit: async ({ value }) => {
      const payload: Competition = {
        title: value.title,
        fee: value.fee === "" ? undefined : Number(value.fee),
        prize: value.prize === "" ? undefined : Number(value.prize),
      };
      await onSubmitAction(payload);
    },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <form
      className="flex h-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="title"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Summer Short Story Prize"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors[0] ? (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
            ) : null}
          </div>
        )}
      />

      <form.Field
        name="fee"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor="fee">Fee</Label>
            <Input
              id="fee"
              type="text"
              inputMode="decimal"
              placeholder="Optional"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors[0] ? (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
            ) : null}
          </div>
        )}
      />

      <form.Field
        name="prize"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor="prize">Prize</Label>
            <Input
              id="prize"
              type="text"
              inputMode="decimal"
              placeholder="Optional"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors[0] ? (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
            ) : null}
          </div>
        )}
      />

      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="order-3 md:order-1">
          {onDeleteAction ? (
            <Button
              className="w-full md:w-auto"
              type="button"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <IconTrash />
              Delete
            </Button>
          ) : null}
        </div>
        <div className="order-1 md:order-2 flex flex-col gap-2 md:flex-row md:gap-2 md:justify-end md:items-center">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button className="w-full md:w-auto order-1 md:order-2" type="submit" disabled={isSubmitting}>
                <IconDeviceFloppy />
                Save
              </Button>
            )}
          </form.Subscribe>
          <Button
            className="w-full md:w-auto order-2 md:order-1"
            type="button"
            variant="outline"
            onClick={onCancelAction}
          >
            <IconX />
            Cancel
          </Button>
        </div>
      </div>

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
    </form>
  );
}
