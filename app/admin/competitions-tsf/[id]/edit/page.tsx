"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { CompetitionForm } from "../../_lib/form";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { useHeader } from "@/app/admin/_lib/header";
import { Competition } from "@/lib/validation/competitions";

export default function AdminCompetitionsTSFEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as Id<"competitions">;
  const competition = useQuery(api.admin.competitions.get, id ? { id } : "skip");
  const update = useMutation(api.admin.competitions.update);
  const remove = useMutation(api.admin.competitions.remove);

  useHeader({
    title: competition ? `Edit Competition (TSF) "${competition.title}"` : undefined,
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

  async function onSubmit(values: Competition) {
    try {
      await update({ id, ...values });
      toast.success("Competition updated", { description: `"${values.title}" was updated.` });
      router.push("/admin/competitions-tsf");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error("Update competition failed:", err);
      toast.error("Failed to update competition", { description: message });
    }
  }

  const onDelete = async () => {
    try {
      await remove({ id });
      toast.success("Competition deleted");
      router.push("/admin/competitions-tsf");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error("Delete competition failed:", err);
      toast.error("Failed to delete competition", { description: message });
    }
  };

  return (
    <CompetitionForm
      competition={competition}
      onSubmitAction={onSubmit}
      onCancelAction={() => router.push("/admin/competitions-tsf")}
      onDeleteAction={onDelete}
    />
  );
}
