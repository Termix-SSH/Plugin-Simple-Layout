import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@termix-ssh/plugin-sdk/frontend", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));

vi.mock("@termix-ssh/plugin-sdk/ui", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  resolveHostDefaults: () => new Promise(() => {}),
}));

import { HostForm } from "../../../src/frontend/manage/HostForm";
import type { Host } from "@termix-ssh/plugin-sdk/ui";

afterEach(cleanup);

const saved = {
  id: "1",
  name: "nas",
  ip: "10.0.0.1",
  port: 22,
  sshPort: 22,
  username: "root",
  authType: "password",
  hasPassword: true,
  enableSsh: true,
  folder: "",
  tags: [],
} as unknown as Host;

function renderForm(host: Host | null) {
  render(
    <HostForm
      host={host}
      credentials={[]}
      folders={[]}
      onBack={() => {}}
      onSaved={() => {}}
    />,
  );
  return document.querySelector<HTMLInputElement>('input[type="password"]')!;
}

describe("HostForm", () => {
  it("never shows the saved password marker as text", () => {
    const input = renderForm(saved);
    expect(input.value).toBe("");
    expect(input.placeholder).toBe("hostForm.keySaved");
  });

  it("keeps the saved password when the field is emptied", () => {
    const input = renderForm(saved);
    fireEvent.change(input, { target: { value: "new" } });
    expect(input.value).toBe("new");
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
    expect(input.placeholder).toBe("hostForm.keySaved");
  });

  it("starts a new host with an empty password", () => {
    const input = renderForm(null);
    expect(input.value).toBe("");
    expect(input.placeholder).toBe("");
    expect(screen.getByText("hostForm.add")).toBeTruthy();
  });
});
