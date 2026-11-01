-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");

