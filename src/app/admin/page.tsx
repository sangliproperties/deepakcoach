import { requireUser } from "@/lib/auth";
import AdminConsole from "@/components/admin-console";

export default async function AdminPage() {
  await requireUser("ADMIN", "/admin");

  return <AdminConsole />;
}
