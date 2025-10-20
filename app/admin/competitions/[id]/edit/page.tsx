"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { CompetitionForm } from "../../_lib/form";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useHeader } from "@/app/admin/_lib/header";

export default function AdminCompetitionsEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as Id<"competitions">;
  const competition = useQuery(api.admin.competitions.get, id ? { id } : "skip");
  const update = useMutation(api.admin.competitions.update);
  const remove = useMutation(api.admin.competitions.remove);

  useHeader({
    title: competition ? `Edit Competition "${competition.title}"` : undefined,
  });

  if (competition === undefined) {
    return <div className="p-8">Loading…</div>;
  }

  if (competition === null) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div>Record not found.</div>
      </div>
    );
  }

  async function onSubmit(competition) {
    const result = await update(competition);
    toast.success("Competition updated", { description: `"${competition.title}" was updated.` });
    router.push("/admin/competitions");
    return result;
  }

  const onDelete = async () => {
    await remove({ id });
    toast.success("Competition deleted");
    router.push("/admin/competitions");
  };

  return (
    <CompetitionForm
      competition={competition}
      onSubmitAction={onSubmit}
      onCancelAction={() => router.push("/admin/competitions")}
      onDeleteAction={onDelete}
    />
  );
}
