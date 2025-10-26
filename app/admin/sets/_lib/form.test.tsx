// @vitest-environment jsdom

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { within } from "@testing-library/dom";
import { SetForm } from "@/app/admin/sets/_lib/form";

function renderForm(overrides?: Partial<Parameters<typeof SetForm>[0]>) {
  type Props = Required<Parameters<typeof SetForm>[0]>;
  const defaultSubmit = vi.fn().mockResolvedValue({ ok: true, id: "1" }) as Props["onSubmitAction"];
  const props: Props = {
    ...(overrides as Props),
    onSubmitAction: (overrides?.onSubmitAction as Props["onSubmitAction"]) ?? defaultSubmit,
    onCancelAction: (overrides?.onCancelAction as Props["onCancelAction"]) ?? (vi.fn() as Props["onCancelAction"]),
  };
  const ui = render(<SetForm {...props} />);
  return { ui, onSubmitAction: props.onSubmitAction, onCancelAction: props.onCancelAction };
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

  it("submits converted payload values (numbers and nulls)", async () => {
    const onSubmitAction = vi.fn().mockResolvedValue({ ok: true, id: "1" });
    renderForm({ onSubmitAction });

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "  A  " } });
    fireEvent.change(screen.getByPlaceholderText("Required"), { target: { value: " 1 " } });
    fireEvent.change(screen.getByPlaceholderText("Required and unique"), { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("Optional"), { target: { value: " 5 " } });
    fireEvent.change(screen.getByPlaceholderText("Optional, positive"), { target: { value: "7" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(onSubmitAction).toHaveBeenCalled());
    const arg = onSubmitAction.mock.calls[0][0];
    expect(arg).toEqual({
      name: "A",
      mandatoryNumber: 1,
      uniqueNumber: 2,
      optionalNumber: 5,
      optionalPositiveNumber: 7,
    });
  });

  it("opens delete dialog and confirms deletion", async () => {
    const onDeleteAction = vi.fn().mockResolvedValue(undefined);
    renderForm({ onDeleteAction, onCancelAction: vi.fn() });

    // Open confirm dialog
    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    const dialog = await screen.findByRole("dialog");
    const dialogUtils = within(dialog);
    fireEvent.click(dialogUtils.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(onDeleteAction).toHaveBeenCalled());
  });
});
