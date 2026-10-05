import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  ShieldCheck,
  Settings,
} from "lucide-react";
function SidebarIcon({ type }) {
  const icons = {
    dashboard: LayoutDashboard,
    quotation: FileText,
    bill: Receipt,
    risk: ShieldCheck,
    settings: Settings,
  };

  const Icon = icons[type];

return (
  <span className={`sidebar-icon-box ${type}-icon`}>
    <Icon size={16} strokeWidth={2} />
  </span>
);
}
export default function Sidebar({ isOpen, setIsOpen }) {
  return (
  <aside
  className={`sidebar ${isOpen ? "show" : "hide"}`}
  onClick={() => {
    if (!isOpen) setIsOpen(true);
  }}
>
   <div className="company">
  <h2>C.Gomathinayagam</h2>
  <p>Contractor office</p>
</div>
      <nav>
        <NavLink to="/" className="nav-item">
          <SidebarIcon type="dashboard" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/quotations" className="nav-item">
          <SidebarIcon type="quotation" />
          <span>Quotations</span>
        </NavLink>
        <NavLink to="/bills" className="nav-item">
          <SidebarIcon type="bill" />
          <span>Bills</span>
        </NavLink>
        <NavLink to="/risk-assessments" className="nav-item">
          <SidebarIcon type="risk" />
          <span>Risk assessments</span>
        </NavLink>
      </nav>
      <div className="settings">
        <NavLink to="/settings" className="nav-item">
          <SidebarIcon type="settings" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
