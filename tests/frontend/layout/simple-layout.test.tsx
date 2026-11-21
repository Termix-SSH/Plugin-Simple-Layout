import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  ServerStatusProvider,
  ShellControllerProvider,
  TabPortals,
  setPermissionsForTesting,
} from "@termix-ssh/plugin-sdk/testing-host";

vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { SimpleLayout } from "../../../src/frontend/layout/SimpleLayout";
import { isZenShortcut, resetZen } from "../../../src/frontend/shell/zen";

beforeEach(() => setPermissionsForTesting([], true));
afterEach(cleanup);

describe("SimpleLayout", () => {
  it("draws the top bar with search and settings around the stage", async () => {
    render(
      <ServerStatusProvider isAuthenticated>
        <ShellControllerProvider username="admin" onLogout={() => {}}>
          <SimpleLayout />
          <TabPortals />
        </ShellControllerProvider>
      </ServerStatusProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByRole("button").length).toBeGreaterThan(2),
    );
    expect(document.body.textContent).toContain("nav.search");
    expect(document.body.textContent).toContain("nav.hosts");
  });
});

describe("zen mode", () => {
  afterEach(() => {
    localStorage.clear();
    resetZen();
  });

  const draw = () =>
    render(
      <ServerStatusProvider isAuthenticated>
        <ShellControllerProvider username="admin" onLogout={() => {}}>
          <SimpleLayout />
          <TabPortals />
        </ShellControllerProvider>
      </ServerStatusProvider>,
    );

  it("swaps the bar for a bare one with the shortcut and keeps it", async () => {
    draw();
    await waitFor(() =>
      expect(document.body.textContent).toContain("nav.hosts"),
    );
    fireEvent.keyDown(window, { code: "KeyZ", ctrlKey: true, altKey: true });
    await waitFor(() =>
      expect(document.body.textContent).not.toContain("nav.hosts"),
    );
    expect(screen.getByLabelText("zen.exit")).toBeTruthy();
    expect(localStorage.getItem("simple-layout.zen")).toBe("1");

    fireEvent.click(screen.getByLabelText("zen.exit"));
    await waitFor(() =>
      expect(document.body.textContent).toContain("nav.hosts"),
    );
    expect(localStorage.getItem("simple-layout.zen")).toBe("0");
  });

  it("only reacts to Ctrl Alt Z", () => {
    const key = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);
    expect(
      isZenShortcut(key({ code: "KeyZ", ctrlKey: true, altKey: true })),
    ).toBe(true);
    expect(isZenShortcut(key({ code: "KeyZ", ctrlKey: true }))).toBe(false);
    expect(
      isZenShortcut(
        key({ code: "KeyZ", ctrlKey: true, altKey: true, shiftKey: true }),
      ),
    ).toBe(false);
  });
});
