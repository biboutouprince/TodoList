/*
  Warnings:

  - You are about to drop the column `priority` on the `Tache` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Tache` table. All the data in the column will be lost.
  - Added the required column `titre` to the `Tache` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME NOT NULL,
    "priorite" TEXT NOT NULL DEFAULT 'Moyen',
    "status" TEXT NOT NULL DEFAULT 'Attente',
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tache" ("createdAt", "description", "dueDate", "id", "status", "updatedAt", "userId") SELECT "createdAt", "description", "dueDate", "id", "status", "updatedAt", "userId" FROM "Tache";
DROP TABLE "Tache";
ALTER TABLE "new_Tache" RENAME TO "Tache";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
