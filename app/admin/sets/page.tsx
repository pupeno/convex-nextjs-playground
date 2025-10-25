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

export default function AdminSetsPage() {
  const router = useRouter();
  useHeader({ title: "Sets" });
  const sets = useQuery(api.admin.sets.list, {});
  const remove = useMutation(api.admin.sets.remove);

  const [confirm, setConfirm] = useState<{ id: Id<"sets">; title: string } | null>(null);

  if (sets === undefined) {
    return <div className="p-8">Loading…</div>;
  }

  function goToCreate() {
    router.push("/admin/sets/new");
  }

  function goToEdit(id: Id<"sets">) {
    router.push(`/admin/sets/${id}/edit`);
  }

  async function onDelete(id: Id<"sets">) {
    await remove({ id });
    toast.success("Set deleted");
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
          {sets.map((set) => (
            <TableRow key={set._id} className="cursor-pointer" onClick={() => goToEdit(set._id)}>
              <TableCell>{set.title}</TableCell>
              <TableCell>{set.number1}</TableCell>
              <TableCell>{set.number2}</TableCell>
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
                    <DropdownMenuItem onSelect={() => goToEdit(set._id)}>
                      <IconPencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setConfirm({ id: set._id, title: set.title })}>
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
          Add New Set
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
