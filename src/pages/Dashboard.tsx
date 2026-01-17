import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar as CalendarIcon } from "lucide-react";

// Composants UI
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

// Hooks
import { useAgents } from "../hooks/use-agents";

export default function Dashboard() {
  const { data: agents, isLoading: agentsLoading } = useAgents();

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const activeAgents = agents?.length || 0;

  // Calcul du premier dimanche du mois prochain
  const getFirstSundayNextMonth = () => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    if (month > 11) {
      month = 0;
      year++;
    }
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    return new Date(year, month, 1 + diff);
  };

  const nextManeuverDate = getFirstSundayNextMonth();

  return (
    <div className="space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-500 mt-2">Vue d'ensemble de l'activité de la caserne.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center"
        >
          <div className="p-3 rounded-full bg-orange-50 text-orange-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold">{activeAgents}</h2>
          <p className="text-sm font-medium text-gray-500">Agents Actifs</p>
        </motion.div>

        {/* Prochaine Manœuvre */}
        <Card className="rounded-2xl border shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-orange-50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
              <CalendarIcon className="w-5 h-5" /> Prochaine Manœuvre
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-4xl font-black">{nextManeuverDate.getDate()}</p>
            <p className="text-xl font-bold text-primary capitalize">
              {nextManeuverDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
            <div className="inline-flex items-center px-3 py-1 mt-4 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
              Premier Dimanche
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
