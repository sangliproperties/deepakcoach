-- Add the dedicated coach role without changing existing customer/admin users.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COACH';
