import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));

const icon = () => null;
const actions = [
  {
    id: "ssh",
    titleKey: "ssh",
    kind: "connect",
    priority: 10,
    icon,
    when: () => true,
  },
  { id: "rdp", titleKey: "rdp", kind: "connect", icon, when: () => true },
  { id: "files", titleKey: "files", kind: "open", icon, when: () => true },
  {
    id: "hidden",
    titleKey: "hidden",
    kind: "open",
    tray: false,
    icon,
    when: () => true,
  },
  {
    id: "web",
    titleKey: "web",
    kind: "open",
    icon,
    when: () => true,
    items: () => [
      { id: "a", label: "Admin", run: () => {} },
      { id: "b", label: "Grafana", run: () => {} },
    ],
  },
];

vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useShellController: () => ({
    hosts: {
      loaded: true,
      list: [
        {
          id: "1",
          name: "nas",
          ip: "10.0.0.1",
          port: 22,
          username: "root",
          folder: "",
          tags: [],
          pin: false,
        },
      ],
    },
    tabs: { connectHost: vi.fn() },
    callbacks: {},
  }),
  useHostActions: () => actions,
  useHostStatus: () => "online",
}));

import { HomeTab } from "../../../src/frontend/dashboard/HomeTab";

afterEach(cleanup);

describe("HomeTab", () => {
  it("renders host cards with their tool tooltips", () => {
    render(<HomeTab />);
    expect(screen.getByText("nas")).toBeTruthy();
    // Other protocols and every tool show, the default connect is the main button.
    expect(screen.getByLabelText("rdp")).toBeTruthy();
    expect(screen.getByLabelText("files")).toBeTruthy();
    expect(screen.getByLabelText("web")).toBeTruthy();
    expect(screen.queryByLabelText("ssh")).toBeNull();
    expect(screen.queryByLabelText("hidden")).toBeNull();
  });
});
