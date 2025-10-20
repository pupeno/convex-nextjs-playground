"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { CompetitionForm } from "../_lib/form";
import { toast } from "sonner";
import { useHeader } from "@/app/admin/_lib/header";

export default function AdminCompetitionsNewPage() {
  const router = useRouter();
  const create = useMutation(api.admin.competitions.create);
  useHeader({ title: "Add New Competition" });

  async function onSubmit(competition) {
    const result = await create(competition);
    toast.success("New competition created", {
      description: `"${competition.title}" was created successfully.`,
    });
    router.push("/admin/competitions");

    return result;
  }

  return <CompetitionForm onCancelAction={() => router.push("/admin/competitions")} onSubmitAction={onSubmit} />;
}
