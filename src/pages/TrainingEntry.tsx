import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAgents } from "../hooks/use-agents";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { GraduationCap, Users, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Search, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "../lib/utils";
import type { Training, Agent } from "../lib/schema";


const VALIDATORS = [
  "L'HOSPITAL G.",
  "TREPOUT C.",
  "ROUSSEL T.",
  "CHIQUARD M.",
  "AYRAULT J.",
  "CARTAUX P.",
  "PIGNATELLI G."
];

export default function TrainingEntry() {
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]);
  const [trainingDate, setTrainingDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customHours, setCustomHours] = useState("");
  const [selectedValidator, setSelectedValidator] = useState<string>("");
  const [searchAgent, setSearchAgent] = useState("");
  const { toast } = useToast();

  const { data: agents } = useAgents();
  const { data: trainings } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
  });

  const mutation = useMutation({
    mutationFn: async (data: { agentIds: number[]; trainingId: number; completionDate: string; customHours: number; validator: string }) => {
      const promises = data.agentIds.map(agentId => 
        apiRequest("POST", "/api/participations", {
          agentId,
          trainingId: data.trainingId,
          completionDate: data.completionDate,
          customHours: data.customHours,
          status: "Validé",
          validator: data.validator
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Succès",
        description: `${selectedAgentIds.length} participation(s) enregistrée(s).`,
      });
      setSelectedAgentIds([]);
    },
  });

  const selectedTraining = trainings?.find(t => t.id === parseInt(selectedTrainingId));

  const filteredAgents = agents?.filter(agent => 
    `${agent.firstName} ${agent.lastName} ${agent.matricule}`.toLowerCase().includes(searchAgent.toLowerCase())
  ).sort((a, b) => a.lastName.localeCompare(b.lastName, "fr")) || [];

  const handleToggleAgent = (agentId: number) => {
    setSelectedAgentIds(prev => 
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAgentIds.length === filteredAgents.length) {
      setSelectedAgentIds([]);
    } else {
      setSelectedAgentIds(filteredAgents.map(a => a.id));
    }
  };

  const handleSubmit = () => {
    if (!selectedTrainingId || selectedAgentIds.length === 0 || !trainingDate || !customHours || !selectedValidator) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs, sélectionner l'encadrant et au moins un agent.",
      });
      return;
    }

    mutation.mutate({
      agentIds: selectedAgentIds,
      trainingId: parseInt(selectedTrainingId),
      completionDate: trainingDate,
      customHours: parseFloat(customHours),
      validator: selectedValidator,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Saisie Formations</h1>
        <p className="text-muted-foreground mt-2">Enregistrez la participation de plusieurs agents à une formation cataloguée.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Training Selection */}
        <Card className="lg:col-span-1 rounded-3xl shadow-sm border-border flex flex-col">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              1. Détails de la formation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sélectionner la formation</label>
              <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
                <SelectTrigger className="rounded-xl h-11 bg-white border-slate-200">
                  <SelectValue placeholder="Choisir une formation..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {trainings?.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()} className="py-3">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm">{t.code}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{t.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTraining && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-200">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Formation sélectionnée</div>
                <div className="font-bold text-slate-900">{selectedTraining.title}</div>
                <div className="text-sm text-slate-500 mt-1">Code: {selectedTraining.code}</div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date de la formation</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="date" 
                  value={trainingDate} 
                  onChange={(e) => setTrainingDate(e.target.value)}
                  className="pl-10 rounded-xl h-11 bg-white border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nombre d'heures</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="number" 
                  step="0.5"
                  placeholder="Ex: 4"
                  value={customHours} 
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="pl-10 rounded-xl h-11 bg-white border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Encadrant / Validateur</label>
              <Select value={selectedValidator} onValueChange={setSelectedValidator}>
                <SelectTrigger className="rounded-xl h-11 bg-white border-slate-200">
                  <SelectValue placeholder="Sélectionner un encadrant..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {VALIDATORS.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Agent Selection */}
        <Card className="lg:col-span-2 rounded-3xl shadow-sm border-border flex flex-col h-[700px]">
          <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              2. Sélection des agents ({selectedAgentIds.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 rounded-lg text-xs font-bold uppercase tracking-wider">
              {selectedAgentIds.length === filteredAgents.length ? "Tout désélectionner" : "Tout sélectionner"}
            </Button>
          </CardHeader>
          <div className="px-6 py-4 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Rechercher un agent par nom ou matricule..."
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 h-10"
              />
            </div>
          </div>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="divide-y divide-slate-100">
              {filteredAgents.map((agent) => {
                const isSelected = selectedAgentIds.includes(agent.id);
                return (
                  <div 
                    key={agent.id} 
                    onClick={() => handleToggleAgent(agent.id)}
                    className={cn(
                      "flex items-center p-4 gap-4 cursor-pointer transition-colors hover:bg-slate-50",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => handleToggleAgent(agent.id)}
                      className="w-5 h-5 rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{agent.lastName} {agent.firstName}</div>
                      <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                        <span>{agent.matricule}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{agent.rank}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in duration-300" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
          <div className="p-6 border-t bg-slate-50/50">
            <Button 
              className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/20"
              disabled={!selectedTrainingId || selectedAgentIds.length === 0 || mutation.isPending}
              onClick={handleSubmit}
            >
              {mutation.isPending ? "Enregistrement..." : `Valider pour ${selectedAgentIds.length} agent(s)`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
