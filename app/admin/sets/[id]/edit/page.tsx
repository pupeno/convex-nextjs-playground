"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { SetForm, setFormDefaults, type SetFormValues } from "../../_lib/form";
import { valuesFromApiToForm } from "@/lib/rhf";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useHeader } from "@/app/admin/_lib/header";
import type { SetApi } from "@/lib/validation/sets";
import type { ValidationResult } from "@/lib/validation/validation";

export default function AdminSetsEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as Id<"sets">;
  const set = useQuery(api.admin.sets.get, id ? { id } : "skip");
  const update = useMutation(api.admin.sets.update);
  const remove = useMutation(api.admin.sets.remove);

  useHeader({
    title: set ? `Edit Set "${set.name}"` : undefined,
  });

  if (set === undefined) {
    return <div className="p-8">Loading…</div>;
  }

  if (set === null) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div>Record not found.</div>
      </div>
    );
  }

  async function onSubmit(data: SetApi): Promise<ValidationResult<Id<"sets">>> {
    const result = await update({ id, ...data });
    if (result.ok) {
      toast.success("Set updated", { description: `"${data.name}" was updated.` });
      router.push("/admin/sets");
    }
    return result;
  }

  const onDelete = async () => {
    await remove({ id });
    toast.success("Set deleted");
    router.push("/admin/sets");
  };

  return (
    <SetForm
      set={valuesFromApiToForm<SetFormValues>(setFormDefaults, set)}
      onSubmitAction={onSubmit}
      onCancelAction={() => router.push("/admin/sets")}
      onDeleteAction={onDelete}
    />
  );
}
