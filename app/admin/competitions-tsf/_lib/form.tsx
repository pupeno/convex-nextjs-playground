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
  const titleValidator = z.string().trim().min(1, "Title is required");
  const optionalMoneyNumber = z.number().positive().finite().optional();
  const form = useForm<Competition, any>({
    defaultValues: {
      title: competition?.title ?? "",
      fee: competition?.fee,
      prize: competition?.prize,
    },
    validatorAdapter: zodValidator() as any,
    validators: {
      onBlur: CompetitionValidator as any,
      onSubmit: CompetitionValidator as any,
    },
    onSubmit: async ({ value }) => {
      await onSubmitAction(value);
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
        validators={{ onChange: titleValidator as any, onBlur: titleValidator as any }}
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
        validators={{ onChange: optionalMoneyNumber as any, onBlur: optionalMoneyNumber as any }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor="fee">Fee</Label>
            <Input
              id="fee"
              type="number"
              step="0.01"
              placeholder="Optional"
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  field.handleChange(undefined);
                  return;
                }
                const parsed = Number(raw);
                field.handleChange(Number.isNaN(parsed) ? undefined : parsed);
              }}
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
        validators={{ onChange: optionalMoneyNumber as any, onBlur: optionalMoneyNumber as any }}
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor="prize">Prize</Label>
            <Input
              id="prize"
              placeholder="Optional"
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  field.handleChange(undefined);
                  return;
                }
                const parsed = Number(raw);
                field.handleChange(Number.isNaN(parsed) ? undefined : parsed);
              }}
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
