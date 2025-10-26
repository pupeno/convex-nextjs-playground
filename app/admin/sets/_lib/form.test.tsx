// @vitest-environment jsdom

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SetForm } from "@/app/admin/sets/_lib/form";

function renderForm(overrides?: Partial<Parameters<typeof SetForm>[0]>) {
  type Props = Required<Parameters<typeof SetForm>[0]>;
  const defaultSubmit: Props["onSubmitAction"] = vi
    .fn<Parameters<Props["onSubmitAction"]>, ReturnType<Props["onSubmitAction"]>>()
    .mockResolvedValue({ ok: true, id: "1" });
  const onSubmitAction: Props["onSubmitAction"] = overrides?.onSubmitAction ?? defaultSubmit;
  const onCancelAction: Props["onCancelAction"] = (overrides?.onCancelAction as Props["onCancelAction"]) ?? vi.fn();
  const props: Props = {
    onSubmitAction,
    onCancelAction,
    ...((overrides as Props) ?? {}),
  };
  const ui = render(<SetForm {...props} />);
  return { ui, onSubmitAction, onCancelAction };
}

describe("SetForm", () => {
  it("renders fields and validates client-side", async () => {
    const { onSubmitAction } = renderForm();
    // Submit with defaults (empty) should show messages
    const save = screen.getByRole("button", { name: /save/i });
    fireEvent.click(save);
    await screen.findAllByText(/required|number/i);

    // Fill valid values and submit
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "A" } });
    fireEvent.change(screen.getByPlaceholderText("Required"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Required and unique"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("Optional"), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText("Optional, positive"), { target: { value: "" } });

    fireEvent.click(save);
    await waitFor(() => expect(onSubmitAction).toHaveBeenCalled());
  });

  it("maps server-side field errors onto the form", async () => {
    const { onSubmitAction } = renderForm({
      onSubmitAction: vi.fn().mockResolvedValue({ ok: false, errors: { uniqueNumber: "duplicate" } }),
    });
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "A" } });
    fireEvent.change(screen.getByPlaceholderText("Required"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Required and unique"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await screen.findByText(/duplicate/i);
    expect(onSubmitAction).toHaveBeenCalled();
  });

  it("calls onCancelAction when Cancel is clicked", () => {
    const { onCancelAction } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancelAction).toHaveBeenCalled();
  });
});
