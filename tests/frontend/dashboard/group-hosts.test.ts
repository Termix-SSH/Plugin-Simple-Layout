import { describe, expect, it } from "vitest";
import type { Host } from "@termix-ssh/plugin-sdk/ui";
import { groupHosts } from "../../../src/frontend/dashboard/group-hosts";

const host = (over: Partial<Host>): Host =>
  ({
    id: "1",
    name: "",
    ip: "10.0.0.1",
    port: 22,
    username: "root",
    folder: "",
    tags: [],
    pin: false,
    ...over,
  }) as Host;

describe("groupHosts", () => {
  it("puts hosts without a folder first, then folders by name", () => {
    const groups = groupHosts(
      [
        host({ id: "1", name: "nas", folder: "Storage" }),
        host({ id: "2", name: "pi" }),
        host({ id: "3", name: "web", folder: "Apps" }),
      ],
      "",
    );
    expect(groups.map((group) => group.folder)).toEqual([
      "",
      "Apps",
      "Storage",
    ]);
  });

  it("lists pinned hosts first, then by name", () => {
    const [group] = groupHosts(
      [
        host({ id: "1", name: "b" }),
        host({ id: "2", name: "c", pin: true }),
        host({ id: "3", name: "a" }),
      ],
      "",
    );
    expect(group.hosts.map((h) => h.name)).toEqual(["c", "a", "b"]);
  });

  it("filters by name, address, folder and tag", () => {
    const hosts = [
      host({ id: "1", name: "plex", ip: "10.0.0.5", tags: ["media"] }),
      host({ id: "2", name: "router", ip: "192.168.1.1", folder: "Network" }),
    ];
    expect(groupHosts(hosts, "plex")[0].hosts).toHaveLength(1);
    expect(groupHosts(hosts, "192.168")[0].hosts[0].name).toBe("router");
    expect(groupHosts(hosts, "media")[0].hosts[0].name).toBe("plex");
    expect(groupHosts(hosts, "network")[0].hosts[0].name).toBe("router");
    expect(groupHosts(hosts, "zzz")).toEqual([]);
  });
});
