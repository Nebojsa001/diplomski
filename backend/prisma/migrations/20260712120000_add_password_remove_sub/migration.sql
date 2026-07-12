-- DropIndex (uklanjamo jedinstveni indeks nad "sub")
DROP INDEX IF EXISTS "User_sub_key";

-- AlterTable: uklanjamo "sub", dodajemo opciono polje "password"
ALTER TABLE "User" DROP COLUMN IF EXISTS "sub";
ALTER TABLE "User" ADD COLUMN "password" TEXT;
