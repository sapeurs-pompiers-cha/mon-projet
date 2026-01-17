import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, GraduationCap, Flame, Menu, X, CalendarDays, UserCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";


const NAV_ITEMS = [
  { label: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { label: "Agents", href: "/agents", icon: Users },
  { label: "Formations", href: "/trainings", icon: GraduationCap },
  { label: "Saisie Formations", href: "/training-entry", icon: UserCheck },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
      </button>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-border shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-400 shadow-lg shadow-primary/25">
              <Flame className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-none text-foreground">
                Pompiers de Champenoux
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">Gestion Formation</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "text-primary-foreground bg-primary shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "stroke-[2.5px]" : "stroke-2"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
