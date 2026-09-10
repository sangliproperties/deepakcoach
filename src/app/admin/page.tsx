import { requireUser } from "@/lib/auth";
import AdminConsole from "@/components/admin-console";

export default function AdminPage() {
  requireUser("ADMIN", "/admin");
  return <AdminConsole />;
}
