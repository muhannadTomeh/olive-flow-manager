
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCheck,
  ShoppingCart,
  Sprout,
  Receipt,
  Settings,
  Bell,
  Clock,
  Leaf
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

const items = [
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard },
  { title: "الطابور", url: "/queue", icon: Clock },
  { title: "حساب الرد", url: "/invoices", icon: Receipt },
  { title: "الزبائن", url: "/customers", icon: Users },
  { title: "العمال", url: "/workers", icon: UserCheck },
  { title: "بيع/شراء الزيت", url: "/oil-trading", icon: ShoppingCart },
  { title: "المصاريف", url: "/expenses", icon: Sprout },
  { title: "التقارير", url: "/reports", icon: FileText },
]

const settingsItems = [
  { title: "الإعدادات", url: "/settings", icon: Settings },
  { title: "الإشعارات", url: "/notifications", icon: Bell },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      side="right"
      className={isCollapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 olive-gradient rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-primary">معصرة الزيتون</h2>
              <p className="text-sm text-sidebar-foreground/70">نظام الإدارة</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 olive-gradient rounded-lg flex items-center justify-center mx-auto">
            <Leaf className="h-5 w-5 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-sm font-medium px-2 mb-2">
            {!isCollapsed && "القائمة الرئيسية"}
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
                        isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-5 w-5 me-3" />
                      {!isCollapsed && <span className="text-right">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-sm font-medium px-2 mb-2">
            {!isCollapsed && "إعدادات"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-5 w-5 me-3" />
                      {!isCollapsed && <span className="text-right">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="text-center text-xs text-sidebar-foreground/50">
            نظام إدارة معاصر الزيتون v1.0
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
