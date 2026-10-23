import ProtectedRoutes from "@/lib/ProtectedRoutes";
import SidebarNav from "@/app/Components/portal-ui/SidebarNav";
import LeadsView from "./LeadsView";

export const metadata = {
  title: "Leads | Nurturely CRM",
};

export default function LeadsPage() {
  return (
    <ProtectedRoutes>
      <SidebarNav>
        <LeadsView />
      </SidebarNav>
    </ProtectedRoutes>
  );
}
