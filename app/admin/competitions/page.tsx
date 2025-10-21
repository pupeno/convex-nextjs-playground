"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { IconDotsVertical, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/ui/admin/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/lib/ui/admin/dropdown-menu";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/lib/ui/admin/confirm-dialog";
import { toast } from "sonner";
import { useHeader } from "@/app/admin/_lib/header";

export default function AdminCompetitionsPage() {
  const router = useRouter();
  useHeader({ title: "Competitions" });
  const competitions = useQuery(api.admin.competitions.list, {});
  const remove = useMutation(api.admin.competitions.remove);

  const [confirm, setConfirm] = useState<{ id: Id<"competitions">; title: string } | null>(null);

  if (competitions === undefined) {
    return <div className="p-8">Loading…</div>;
  }

  function goToCreate() {
    router.push("/admin/competitions/new");
  }

  function goToEdit(id: Id<"competitions">) {
    router.push(`/admin/competitions/${id}/edit`);
  }

  async function onDelete(id: Id<"competitions">) {
    await remove({ id });
    toast.success("Competition deleted");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Number 1</TableHead>
            <TableHead>Number 2</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitions.map((competition) => (
            <TableRow key={competition._id} className="cursor-pointer" onClick={() => goToEdit(competition._id)}>
              <TableCell>{competition.title}</TableCell>
              <TableCell>{competition.number1}</TableCell>
              <TableCell>{competition.number2}</TableCell>
              <TableCell className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}>
                      <IconDotsVertical />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onSelect={() => goToEdit(competition._id)}>
                      <IconPencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setConfirm({ id: competition._id, title: competition.title })}>
                      <IconTrash />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-end">
        <Button className="w-full md:w-auto" variant="outline" size="sm" onClick={goToCreate}>
          <IconPlus />
          Add New Competition
        </Button>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title="Confirm deletion"
        description={`Are you sure you want to delete "${confirm?.title ?? ""}"?`}
        onConfirm={async () => {
          if (confirm) await onDelete(confirm.id);
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
}
