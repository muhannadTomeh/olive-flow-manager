import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCheck,
  ShoppingCart,
  Sprout,
  Receipt,
  Settings,
  Clock,
  Leaf,
  Calendar,
  BarChart3,
  TrendingUp,
  Wallet,
  Cog
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "الرئيسية", url: "/dashboard", icon: LayoutDashboard },
  { title: "الطابور", url: "/queue", icon: Clock },
  { title: "حساب الرد", url: "/invoices", icon: Receipt },
  { title: "الزبائن", url: "/customers", icon: Users },
  { title: "العمال", url: "/workers", icon: UserCheck },
]

const operationsItems = [
  { title: "بيع/شراء الزيت", url: "/oil-trading", icon: ShoppingCart },
  { title: "المصاريف", url: "/expenses", icon: Wallet },
]

const analyticsItems = [
  { title: "التقارير", url: "/reports", icon: BarChart3 },
]

const systemItems = [
  { title: "المواسم", url: "/seasons", icon: Calendar },
  { title: "الإعدادات", url: "/settings", icon: Cog },
]

function MenuGroup({ label, items, isCollapsed }: { label: string; items: typeof mainItems; isCollapsed: boolean }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
        {!isCollapsed && label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink 
                  to={item.url} 
                  end 
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      side="right"
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-border/50">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl olive-gradient flex items-center justify-center shadow-sm">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">Smart Mill</h2>
              <p className="text-[11px] text-muted-foreground">إدارة المعصرة</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl olive-gradient flex items-center justify-center mx-auto shadow-sm">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 space-y-4">
        <MenuGroup label="الرئيسية" items={mainItems} isCollapsed={isCollapsed} />
        <MenuGroup label="العمليات" items={operationsItems} isCollapsed={isCollapsed} />
        <MenuGroup label="التحليلات" items={analyticsItems} isCollapsed={isCollapsed} />
        <MenuGroup label="النظام" items={systemItems} isCollapsed={isCollapsed} />
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/50">
        {!isCollapsed && (
          <p className="text-center text-[10px] text-muted-foreground/60">
            Smart Mill v2.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
