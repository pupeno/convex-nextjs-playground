import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const routerMock = { push: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("@/app/admin/_lib/header", () => ({
  useHeader: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));
import { toast } from "sonner";

type SetApi = {
  name: string;
  mandatoryNumber: number;
  uniqueNumber: number;
  optionalNumber: number | null;
  optionalPositiveNumber: number | null;
};

let lastSubmitAction: ((set: SetApi) => Promise<unknown>) | undefined;
let lastCancelAction: (() => void) | undefined;
const submittedSet: SetApi = {
  name: "New Set",
  mandatoryNumber: 1,
  uniqueNumber: 10,
  optionalNumber: null,
  optionalPositiveNumber: null,
};

vi.mock("../_lib/form", () => ({
  SetForm: (props: { onSubmitAction: (set: SetApi) => Promise<unknown>; onCancelAction: () => void }) => {
    lastSubmitAction = props.onSubmitAction;
    lastCancelAction = props.onCancelAction;
    return (
      <div>
        <div>SetFormMock</div>
        <button onClick={() => void props.onSubmitAction(submittedSet)}>submit</button>
        <button onClick={props.onCancelAction}>cancel</button>
      </div>
    );
  },
}));

import { useHeader } from "@/app/admin/_lib/header";
import * as convexReact from "convex/react";
vi.mock("convex/react", () => ({
  useMutation: vi.fn(),
}));

import Page from "./page";

const useHeaderMock = useHeader as unknown as Mock;
const useMutationMock = convexReact.useMutation as unknown as Mock;

describe("AdminSetsNewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routerMock.push.mockClear();
    lastSubmitAction = undefined;
    lastCancelAction = undefined;
  });

  it("registers the header and renders the form", () => {
    useMutationMock.mockReturnValue(vi.fn());

    render(<Page />);

    expect(useHeaderMock).toHaveBeenCalledWith({ title: "Add New Set" });
    expect(screen.getByText(/SetFormMock/i)).toBeInTheDocument();
    expect(lastSubmitAction).toBeTypeOf("function");
    expect(lastCancelAction).toBeTypeOf("function");
  });

  it("submits a new set, toasts, and redirects on success", async () => {
    const createMock = vi.fn().mockResolvedValue({ ok: true, id: "abc" });
    useMutationMock.mockReturnValue(createMock);

    render(<Page />);
    expect(lastSubmitAction).toBeDefined();

    await lastSubmitAction?.(submittedSet);

    expect(createMock).toHaveBeenCalledWith(submittedSet);
    expect((toast as any).success).toHaveBeenCalledWith("New set created", {
      description: '"New Set" was created successfully.',
    });
    expect(routerMock.push).toHaveBeenCalledWith("/admin/sets");
  });

  it("returns the mutation result without redirecting when creation fails", async () => {
    const errorResult = { ok: false, errors: { name: "duplicate" } };
    const createMock = vi.fn().mockResolvedValue(errorResult);
    useMutationMock.mockReturnValue(createMock);

    render(<Page />);
    expect(lastSubmitAction).toBeDefined();

    const result = await lastSubmitAction?.(submittedSet);

    expect(createMock).toHaveBeenCalledWith(submittedSet);
    expect(result).toEqual(errorResult);
    expect((toast as any).success).not.toHaveBeenCalled();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("navigates away when cancel is triggered", () => {
    useMutationMock.mockReturnValue(vi.fn());

    render(<Page />);

    fireEvent.click(screen.getByText(/^cancel$/i));

    expect(routerMock.push).toHaveBeenCalledWith("/admin/sets");
  });
});
