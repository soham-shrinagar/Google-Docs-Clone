export declare const PermissionRole: {
    readonly OWNER: "OWNER";
    readonly EDITOR: "EDITOR";
    readonly COMMENTER: "COMMENTER";
    readonly VIEWER: "VIEWER";
};
export type PermissionRole = (typeof PermissionRole)[keyof typeof PermissionRole];
export declare const ActivityType: {
    readonly CREATED: "CREATED";
    readonly EDITED: "EDITED";
    readonly RENAMED: "RENAMED";
    readonly SHARED: "SHARED";
    readonly DELETED: "DELETED";
    readonly RESTORED: "RESTORED";
    readonly JOINED: "JOINED";
    readonly LEFT: "LEFT";
    readonly COMMENTED: "COMMENTED";
};
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];
export declare const NotificationType: {
    readonly USER_JOINED: "USER_JOINED";
    readonly USER_LEFT: "USER_LEFT";
    readonly DOCUMENT_SHARED: "DOCUMENT_SHARED";
    readonly VERSION_RESTORED: "VERSION_RESTORED";
    readonly CONNECTION_LOST: "CONNECTION_LOST";
    readonly CONNECTION_RESTORED: "CONNECTION_RESTORED";
    readonly CONFLICT_RESOLVED: "CONFLICT_RESOLVED";
    readonly DOCUMENT_SAVED: "DOCUMENT_SAVED";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
//# sourceMappingURL=enums.d.ts.map