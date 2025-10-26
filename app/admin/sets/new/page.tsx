"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { SetForm } from "../_lib/form";
import type { ValidationResult } from "@/lib/validation/validation";
import type { Id } from "@/convex/_generated/dataModel";
import type { SetApi } from "@/lib/validation/sets";
import { toast } from "sonner";
import { useHeader } from "@/app/admin/_lib/header";

export default function AdminSetsNewPage() {
  const router = useRouter();
  const create = useMutation(api.admin.sets.create);
  useHeader({ title: "Add New Set" });

  async function onSubmit(set: SetApi): Promise<ValidationResult<Id<"sets">>> {
    const result = await create(set);
    if (result.ok) {
      toast.success("New set created", { description: `"${set.name}" was created successfully.` });
      router.push("/admin/sets");
    }
    return result;
  }

  return <SetForm onCancelAction={() => router.push("/admin/sets")} onSubmitAction={onSubmit} />;
}
