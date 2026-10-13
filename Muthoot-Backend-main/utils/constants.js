export const zone = [
    "Main Entrance Shutter",
    "Entrance PIR",
    "Strong Room PIR",
    "Vibration Sensor",
    "Windows",
    "Safe Magnet",
    "Panic Switch",
    "Hooter",
];

export const zone16 = [
    ...zone,
    "Manager Door",
    "Safe Room Door",
    "Safe Room Panic",
    "Vibration Sensor 2",
    "Main Door",
    "Panic Switch 2",
    "Spare 15",
    "Spare 16",
];

export const PermissionFlags = {
    Administrator: 1n << 0n,
    ViewStatus: 1n << 1n,
    ViewStatusDetailed: 1n << 2n,
    ChangeMode: 1n << 3n,
    AccessCode: 1n << 4n,
    ReverseAlarm: 1n << 5n,
    ResetAlarm: 1n << 6n,
    NetworkPassword: 1n << 7n,
    ViewUsers: 1n << 8n,
    EditUser: 1n << 9n,
    ViewRoles: 1n << 10n,
    EditRole: 1n << 11n,
    EditDevice: 1n << 12n,
    ViewHistory: 1n << 13n,
    ViewAttendance: 1n << 14n,
};

export class PermissionField {
    static Flags = PermissionFlags;
    static All = Object.values(PermissionFlags).reduce((a, b) => a | b, 0n);
}
