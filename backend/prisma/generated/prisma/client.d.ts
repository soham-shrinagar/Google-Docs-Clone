import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.js";
import * as Prisma from "./internal/prismaNamespace.js";
export * as $Enums from './enums.js';
export * from "./enums.js";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model Document
 *
 */
export type Document = Prisma.DocumentModel;
/**
 * Model DocumentPermission
 *
 */
export type DocumentPermission = Prisma.DocumentPermissionModel;
/**
 * Model DocumentVersion
 *
 */
export type DocumentVersion = Prisma.DocumentVersionModel;
/**
 * Model DocumentSnapshot
 *
 */
export type DocumentSnapshot = Prisma.DocumentSnapshotModel;
/**
 * Model DocumentOperation
 *
 */
export type DocumentOperation = Prisma.DocumentOperationModel;
/**
 * Model ActiveSession
 *
 */
export type ActiveSession = Prisma.ActiveSessionModel;
/**
 * Model UserPresence
 *
 */
export type UserPresence = Prisma.UserPresenceModel;
/**
 * Model ActivityLog
 *
 */
export type ActivityLog = Prisma.ActivityLogModel;
/**
 * Model Notification
 *
 */
export type Notification = Prisma.NotificationModel;
/**
 * Model AuditLog
 *
 */
export type AuditLog = Prisma.AuditLogModel;
/**
 * Model PinnedDocument
 *
 */
export type PinnedDocument = Prisma.PinnedDocumentModel;
/**
 * Model RecentlyOpened
 *
 */
export type RecentlyOpened = Prisma.RecentlyOpenedModel;
//# sourceMappingURL=client.d.ts.map