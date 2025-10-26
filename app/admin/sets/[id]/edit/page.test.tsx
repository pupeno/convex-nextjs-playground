import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ValidationErrors } from "@/lib/validation/validation";

// Stable router and params mocks for this suite; ensure React in scope for JSX
const routerMock = { push: vi.fn(), replace: vi.fn(), back: vi.fn() };
const paramsId = "123;sets";

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: paramsId }),
}));

// Mock SetForm to surface control points (submit/cancel/delete)
type SetApi = {
  name: string;
  mandatoryNumber: number;
  uniqueNumber: number;
  optionalNumber: number | null;
  optionalPositiveNumber: number | null;
};

let lastSetProp: unknown = undefined;

vi.mock("../../_lib/form", () => ({
  SetForm: (props: {
    set?: unknown;
    onSubmitAction: (s: SetApi) => Promise<{ ok: true; id: string } | { ok: false; errors: ValidationErrors }>;
    onCancelAction: () => void;
    onDeleteAction?: () => Promise<void>;
  }) => {
    lastSetProp = props.set;
    return (
      <div>
        <div>SetFormMock</div>
        <button
          onClick={() =>
            props.onSubmitAction({
              name: "Edited",
              mandatoryNumber: 1,
              uniqueNumber: 10,
              optionalNumber: null,
              optionalPositiveNumber: null,
            })
          }>
          submit
        </button>
        <button onClick={props.onCancelAction}>cancel</button>
        {props.onDeleteAction ? (
          <button onClick={() => props.onDeleteAction && props.onDeleteAction()}>delete</button>
        ) : null}
      </div>
    );
  },
  setFormDefaults: {
    name: "",
    mandatoryNumber: "",
    uniqueNumber: "",
    optionalNumber: "",
    optionalPositiveNumber: "",
  },
}));

// Silence header hook
vi.mock("@/app/admin/_lib/header", () => ({ useHeader: () => {} }));

// Mock toast at test-level to avoid touching production code
vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));
import { toast } from "sonner";

// Convex hooks: configurable per-test
import * as convexReact from "convex/react";
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Import component under test
import Page from "./page";

describe("AdminSetsEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastSetProp = undefined;
  });

  it("shows loading when query returns undefined", () => {
    (convexReact.useQuery as unknown as any).mockImplementation(() => undefined);
    (convexReact.useMutation as unknown as any)
      .mockImplementationOnce(() => vi.fn())
      .mockImplementationOnce(() => vi.fn());

    render(<Page />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows not found when query returns null", () => {
    (convexReact.useQuery as unknown as any).mockImplementation(() => null);
    (convexReact.useMutation as unknown as any)
      .mockImplementationOnce(() => vi.fn())
      .mockImplementationOnce(() => vi.fn());

    render(<Page />);
    expect(screen.getByText(/record not found/i)).toBeInTheDocument();
  });

  it("submits edits, toasts success, and redirects", async () => {
    const setDoc = {
      _id: paramsId,
      _creationTime: Date.now(),
      name: "Original",
      mandatoryNumber: 1,
      uniqueNumber: 10,
      optionalNumber: undefined,
      optionalPositiveNumber: undefined,
    };
    (convexReact.useQuery as unknown as any).mockImplementation(() => setDoc);

    const updateMock = vi.fn().mockResolvedValue({ ok: true, id: paramsId });
    const removeMock = vi.fn();
    (convexReact.useMutation as unknown as any)
      .mockImplementationOnce(() => updateMock)
      .mockImplementationOnce(() => removeMock);

    render(<Page />);

    fireEvent.click(screen.getByText(/^submit$/i));

    await waitFor(() => expect(updateMock).toHaveBeenCalled());
    expect(updateMock).toHaveBeenCalledWith({
      id: paramsId,
      name: "Edited",
      mandatoryNumber: 1,
      uniqueNumber: 10,
      optionalNumber: null,
      optionalPositiveNumber: null,
    });
    expect((toast as any).success).toHaveBeenCalledWith("Set updated", { description: '"Edited" was updated.' });
    expect(routerMock.push).toHaveBeenCalledWith("/admin/sets");
    expect(lastSetProp).toBeDefined();
  });

  it("deletes the set and redirects with toast", async () => {
    (convexReact.useQuery as unknown as any).mockImplementation(() => ({
      _id: paramsId,
      _creationTime: Date.now(),
      name: "A",
      mandatoryNumber: 1,
      uniqueNumber: 10,
    }));
    const updateMock = vi.fn();
    const removeMock = vi.fn().mockResolvedValue(undefined);
    (convexReact.useMutation as unknown as any)
      .mockImplementationOnce(() => updateMock)
      .mockImplementationOnce(() => removeMock);

    render(<Page />);

    fireEvent.click(screen.getByText(/^delete$/i));
    await waitFor(() => expect(removeMock).toHaveBeenCalledWith({ id: paramsId }));
    expect((toast as any).success).toHaveBeenCalledWith("Set deleted");
    expect(routerMock.push).toHaveBeenCalledWith("/admin/sets");
  });

  it("cancels and navigates back to list", async () => {
    (convexReact.useQuery as unknown as any).mockImplementation(() => ({
      _id: paramsId,
      _creationTime: Date.now(),
      name: "A",
      mandatoryNumber: 1,
      uniqueNumber: 10,
    }));
    (convexReact.useMutation as unknown as any)
      .mockImplementationOnce(() => vi.fn())
      .mockImplementationOnce(() => vi.fn());

    render(<Page />);
    fireEvent.click(screen.getByText(/^cancel$/i));
    expect(routerMock.push).toHaveBeenCalledWith("/admin/sets");
  });
});
