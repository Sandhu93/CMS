export function isVisibleOnStatusList(
  item: any,
  showUnregistered = false
): boolean {
  if (item?.device?.Current_Status === "Inactive") return false;

  const isAssigned = Boolean(item?.branch?.Code);
  return showUnregistered ? !isAssigned : isAssigned;
}
