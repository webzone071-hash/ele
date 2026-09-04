import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminDashboardOverview } from "./AdminDashboardOverview";
import { AdminSectionsManager } from "./AdminSectionsManager";
import { AdminServicesManager } from "./AdminServicesManager";
import { AdminPortfolioManager } from "./AdminPortfolioManager";
import { AdminFiverrManager } from "./AdminFiverrManager";
import { AdminLeadsManager } from "./AdminLeadsManager";
import { AdminTeamManager } from "./AdminTeamManager";
import { AdminProcessManager } from "./AdminProcessManager";
import { AdminTestimonialsManager } from "./AdminTestimonialsManager";
import { AdminSettingsManager } from "./AdminSettingsManager";
import { AdminVisitorsManager } from "./AdminVisitorsManager";
import { AdminDdosManager } from "./AdminDdosManager";

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminDashboardOverview setActiveTab={setActiveTab} />;
      case "visitors":
        return <AdminVisitorsManager />;
      case "security":
        return <AdminDdosManager />;
      case "sections":
        return <AdminSectionsManager />;
      case "services":
        return <AdminServicesManager />;
      case "portfolio":
        return <AdminPortfolioManager />;
      case "fiverr":
        return <AdminFiverrManager />;
      case "leads":
        return <AdminLeadsManager />;
      case "team":
        return <AdminTeamManager />;
      case "process":
        return <AdminProcessManager />;
      case "testimonials":
        return <AdminTestimonialsManager />;
      case "settings":
        return <AdminSettingsManager />;
      default:
        return <AdminDashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};
