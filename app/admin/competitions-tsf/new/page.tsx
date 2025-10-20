"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { CompetitionForm } from "../_lib/form";
import { toast } from "sonner";
import { useHeader } from "@/app/admin/_lib/header";
import { Competition } from "@/lib/validation/competitions";

export default function AdminCompetitionsTSFNewPage() {
  const router = useRouter();
  const create = useMutation(api.admin.competitions.create);
  useHeader({ title: "Add New Competition (TSF)" });

  async function onSubmit(competition: Competition) {
    try {
      await create(competition);
      toast.success("New competition created", { description: `"${competition.title}" was created successfully.` });
      router.push("/admin/competitions-tsf");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error("Create competition failed:", err);
      toast.error("Failed to create competition", { description: message });
    }
  }

  return <CompetitionForm onCancelAction={() => router.push("/admin/competitions-tsf")} onSubmitAction={onSubmit} />;
}
