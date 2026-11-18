import { describe, expect, it } from "vitest";
import { pageId } from "../../../src/frontend/settings/SettingsTab";

describe("pageId", () => {
  it("maps a plugin:<id> link to this layout's page", () => {
    expect(pageId("plugin:snippets")).toBe("feature:snippets");
  });

  it("keeps other page ids as they are", () => {
    expect(pageId("account")).toBe("account");
    expect(pageId(undefined)).toBeUndefined();
  });
});
