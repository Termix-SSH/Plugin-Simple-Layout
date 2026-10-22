import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
