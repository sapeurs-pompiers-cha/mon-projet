import { User, MapPin, Award, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import type { AgentWithStats } from "../lib/schema";
import { Link } from "wouter";
import { Progress } from "../components/ui/progress";


interface AgentCardProps {
  agent: AgentWithStats;
}

const RANK_COLORS: Record<string, string> = {
  "Sapeur 2ème classe": "bg-slate-100 text-slate-700 border-slate-200",
  "Sapeur": "bg-red-100 text-red-700 border-red-200",
  "Caporal": "bg-red-100 text-red-700 border-red-200",
  "Caporal-chef": "bg-red-100 text-red-700 border-red-200",
  "Sergent": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Sergent-chef": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Adjudant": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Adjudant-chef": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Lieutenant": "bg-white text-slate-900 border-slate-200 shadow-sm",
  "Capitaine": "bg-white text-slate-900 border-slate-200 shadow-sm",
  "Commandant": "bg-white text-slate-900 border-slate-200 shadow-sm",
  "Lieutenant-colonel": "bg-white text-slate-900 border-slate-200 shadow-sm",
  "Colonel": "bg-white text-slate-900 border-slate-200 shadow-sm",
};

export function AgentCard({ agent }: AgentCardProps) {
  const rankStyle = RANK_COLORS[agent.rank] || "bg-gray-100 text-gray-700 border-gray-200";
  const initials = `${agent.firstName[0]}${agent.lastName[0]}`;
  
  // Progress calculation based on 40 hours goal
  const progressValue = Math.min((agent.totalHours / 40) * 100, 100);

  return (
    <Link href={`/agents/${agent.id}`} className="block h-full">
      <div className="group h-full bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 transition-transform group-hover:scale-150 duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-primary font-display font-bold text-xl flex items-center justify-center border-2 border-white shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              {initials}
            </div>
            <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider", rankStyle)}>
              {agent.rank}
            </span>
          </div>

          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {agent.firstName} {agent.lastName}
          </h3>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">{agent.matricule}</p>

          <div className="mt-4 pt-4 border-t border-dashed border-border flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  <span>Progression</span>
                </div>
                <span className="font-bold text-foreground">{agent.totalHours}/40h</span>
              </div>
              <Progress value={progressValue} className="h-2 bg-slate-100" />
            </div>

            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-foreground">{agent.trainingCount} formations</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
