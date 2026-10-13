import { normalizeDeviceId } from "./deviceId.js";

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object ?? {}, key);
}

/**
 * Build the registered or unregistered status list using device/branch
 * registries as the source of truth when a panel has a registry record.
 */
export function buildStatusList(
  bufferItems,
  deviceRecords,
  branchRecords,
  showUnregistered = false
) {
  const devicesById = new Map(
    deviceRecords.map((device) => [normalizeDeviceId(device.Device_ID), device])
  );
  const branchesByCode = new Map(
    branchRecords.map((branch) => [String(branch.Code), branch])
  );

  return bufferItems.flatMap((item) => {
    const deviceId = normalizeDeviceId(item.mac_id);
    const registeredDevice = devicesById.get(deviceId);
    const currentStatus = hasOwn(registeredDevice, "Current_Status")
      ? registeredDevice.Current_Status
      : item.device?.Current_Status;

    if (currentStatus === "Inactive") return [];

    // A registry record is authoritative, including an explicit null branch.
    // For unregistered panels, retain the branch information already captured
    // in the live buffer.
    const branchCode = registeredDevice
      ? registeredDevice.Branch_Code
      : item.branch?.Code ?? item.device?.Branch_Code;
    const registeredBranch = branchCode
      ? branchesByCode.get(String(branchCode))
      : undefined;
    const branch = registeredDevice
      ? registeredBranch ?? {}
      : registeredBranch ??
        (item.branch?.Code === branchCode ? item.branch : {});
    const isAssigned = Boolean(branchCode && branch.Code);

    if (showUnregistered === isAssigned) return [];

    const device = { ...(item.device ?? {}) };

    if (registeredDevice) {
      device.Device_ID = registeredDevice.Device_ID;
      device.Branch_Code = registeredDevice.Branch_Code ?? null;
      if (hasOwn(registeredDevice, "Current_Status")) {
        device.Current_Status = registeredDevice.Current_Status;
      }
    }

    return [{ ...item, device, branch }];
  });
}
