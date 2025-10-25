"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { SetForm } from "../_lib/form";
import { toast } from "sonner";
import { useHeader } from "@/app/admin/_lib/header";
import { Set } from "@/lib/validation/sets";

export default function AdminSetsNewPage() {
  const router = useRouter();
  const create = useMutation(api.admin.sets.create);
  useHeader({ title: "Add New Set" });

  async function onSubmit(set: Set) {
    const result = await create(set);
    toast.success("New set created", { description: `"${set.name}" was created successfully.` });
    router.push("/admin/sets");
    return;
  }

  return <SetForm onCancelAction={() => router.push("/admin/sets")} onSubmitAction={onSubmit} />;
}
