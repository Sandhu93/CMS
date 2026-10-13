import test from "node:test";
import assert from "node:assert/strict";
import { buildStatusList } from "../utils/statusVisibility.js";

const panel = (mac_id, device = {}, branch = {}) => ({
  mac_id,
  device,
  branch,
  CMS_status: "online",
});

test("registered status excludes an inactive device even when its buffer is stale", () => {
  const items = [panel("AA:BB:CC:DD:EE:01", { Current_Status: "Active" }, { Code: "B001" })];
  const devices = [{ Device_ID: "aa-bb-cc-dd-ee-01", Current_Status: "Inactive", Branch_Code: "B001" }];
  const branches = [{ Code: "B001", Branch_Name: "Branch 1" }];

  assert.deepEqual(buildStatusList(items, devices, branches), []);
});

test("unregistered view excludes inactive panels but retains active unassigned panels", () => {
  const items = [
    panel("AA:BB:CC:DD:EE:01", { Current_Status: "Active" }, { Code: "B001" }),
    panel("AA:BB:CC:DD:EE:02", { Current_Status: "Active" }, {}),
  ];
  const devices = [
    { Device_ID: "AA:BB:CC:DD:EE:01", Current_Status: "Active", Branch_Code: "B001" },
    { Device_ID: "AA:BB:CC:DD:EE:02", Current_Status: "Inactive", Branch_Code: null },
  ];

  assert.deepEqual(buildStatusList(items, devices, [{ Code: "B001" }], true), []);

  devices[1].Current_Status = "Active";
  const result = buildStatusList(items, devices, [{ Code: "B001" }], true);
  assert.deepEqual(result.map((item) => item.mac_id), ["AA:BB:CC:DD:EE:02"]);
  assert.deepEqual(result[0].branch, {});
});

test("unassigned registry state overrides stale branch data in the live buffer", () => {
  const items = [panel("AA:BB:CC:DD:EE:01", { Current_Status: "Active", Branch_Code: "B001" }, { Code: "B001", Branch_Name: "Old Branch" })];
  const devices = [{ Device_ID: "AA:BB:CC:DD:EE:01", Current_Status: "Active", Branch_Code: null }];
  const branches = [{ Code: "B001", Branch_Name: "Old Branch" }];

  const result = buildStatusList(items, devices, branches, true);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].branch, {});
  assert.equal(result[0].device.Branch_Code, null);
});

test("a missing branch record cannot make a stale buffer assignment look registered", () => {
  const items = [panel("AA:BB:CC:DD:EE:01", { Current_Status: "Active" }, { Code: "OLD", Branch_Name: "Deleted Branch" })];
  const devices = [{ Device_ID: "AA:BB:CC:DD:EE:01", Current_Status: "Active", Branch_Code: "OLD" }];

  const result = buildStatusList(items, devices, [], true);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].branch, {});
});

test("devices without a status field remain visible for legacy compatibility", () => {
  const items = [panel("AA:BB:CC:DD:EE:01", {}, { Code: "B001" })];
  const branches = [{ Code: "B001", Branch_Name: "Branch 1" }];

  assert.equal(buildStatusList(items, [], branches).length, 1);
});

test("unregistered view continues to show active unknown MQTT panels", () => {
  const items = [panel("AA:BB:CC:DD:EE:03", {}, {})];

  const result = buildStatusList(items, [], [], true);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].branch, {});
});
