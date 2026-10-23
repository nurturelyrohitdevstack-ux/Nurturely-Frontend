import ProtectedRoutes from "@/lib/ProtectedRoutes";
import SidebarNav from "@/app/Components/portal-ui/SidebarNav";
import PipelineView from "./PipelineView";

export const metadata = {
  title: "Sales Pipeline | Nurturely CRM",
};

export default function PipelinePage() {
  return (
    <ProtectedRoutes>
      <SidebarNav>
        <PipelineView />
      </SidebarNav>
    </ProtectedRoutes>
  );
}
