import { useAgent } from "../hooks/use-agents";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Phone, MapPin, Award, Calendar, CheckCircle2, XCircle, Plus, Clock, UserCheck, GraduationCap } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useTrainings, useCreateParticipation } from "../hooks/use-trainings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";


const SUPERVISORS = [
  "L'HOSPITAL G.",
  "TREPOUT C.",
  "ROUSSEL T.",
  "CHIQUARD M.",
  "AYRAULT J.",
  "CARTAUX P.",
  "PIGNATELLI G."
];

export default function AgentDetails() {
  const [, params] = useRoute("/agents/:id");
  const id = parseInt(params?.id || "0");
  const { data: agent, isLoading } = useAgent(id);
  const { data: trainings } = useTrainings();
  const createParticipation = useCreateParticipation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [selectedValidation, setSelectedValidation] = useState<string>("validated");
  const [customHours, setCustomHours] = useState<string>("");
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [validator, setValidator] = useState<string>("");

  useEffect(() => {
    if (selectedTrainingId && trainings) {
      const training = trainings.find(t => t.id.toString() === selectedTrainingId);
      if (training) {
        setCustomHours("2"); // Default to 2 hours
        setCompletionDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [selectedTrainingId, trainings]);

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  if (!agent) return <div className="p-8 text-center">Agent non trouvé</div>;

  const initials = `${agent.firstName[0]}${agent.lastName[0]}`;
  const totalHours = agent.participations.reduce((sum, p) => sum + (p.customHours ?? 0), 0);
  const totalTrainings = agent.participations.length;

  const handleAddTraining = async () => {
    if (!selectedTrainingId || !validator) {
      toast({ 
        title: "Champs manquants", 
        description: "Veuillez sélectionner une formation et un encadrant.",
        variant: "destructive"
      });
      return;
    }
    try {
      await createParticipation.mutateAsync({
        agentId: id,
        trainingId: parseInt(selectedTrainingId),
        status: "present",
        validationStatus: selectedValidation,
        customHours: customHours ? parseFloat(customHours) : null,
        completionDate: completionDate || null,
        supervisor: validator,
      });
      toast({ title: "Succès", description: "Formation ajoutée à l'historique." });
      setIsDialogOpen(false);
      setSelectedTrainingId("");
      setValidator("");
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout.",
        variant: "destructive"
      });
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'validated': return "bg-green-500";
      case 'pending': return "bg-orange-500";
      case 'failed': return "bg-red-500";
      default: return "bg-slate-300";
    }
  };

  const getValidationLabel = (status: string) => {
    switch (status) {
      case 'validated': return "validé";
      case 'pending': return "à revoir";
      case 'failed': return "non validé";
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <Link href="/agents" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour à la liste
        </Link>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shadow-orange-200">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une formation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter une formation à l'historique</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sélectionner la formation</label>
                <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
                  <SelectTrigger className="bg-slate-50 border-0 focus:ring-1 focus:ring-primary/20">
                    <SelectValue placeholder="Choisir une formation" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {trainings?.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.code} - {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Heures effectuées</label>
                  <Input 
                    type="number" 
                    step="0.5"
                    value={customHours} 
                    onChange={(e) => setCustomHours(e.target.value)} 
                    className="bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date de réalisation</label>
                  <Input 
                    type="date" 
                    value={completionDate} 
                    onChange={(e) => setCompletionDate(e.target.value)} 
                    className="bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Encadrant (Validation par)</label>
                <Select value={validator} onValueChange={setValidator}>
                  <SelectTrigger className="bg-slate-50 border-0 focus:ring-1 focus:ring-primary/20">
                    <SelectValue placeholder="Sélectionner un encadrant" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {SUPERVISORS.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Statut de validation</label>
                <Select value={selectedValidation} onValueChange={setSelectedValidation}>
                  <SelectTrigger className="bg-slate-50 border-0 focus:ring-1 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="validated">Validé</SelectItem>
                    <SelectItem value="pending">A revoir</SelectItem>
                    <SelectItem value="failed">Non validé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full mt-4 h-11 text-base font-semibold shadow-lg shadow-primary/20" 
                onClick={handleAddTraining}
                disabled={!selectedTrainingId || !validator || createParticipation.isPending}
              >
                {createParticipation.isPending ? "Ajout..." : "Enregistrer dans l'historique"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-sm overflow-hidden p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-950/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-orange-600 text-white font-display font-bold text-3xl flex items-center justify-center shadow-lg shadow-primary/20">
            {initials}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{agent.firstName} {agent.lastName}</h1>
                <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold border-primary/20 text-primary bg-primary/5 dark:bg-primary/10">
                  {agent.rank}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono mt-1">{agent.matricule}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                {agent.phone || "Non renseigné"}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 min-w-[100px]">
              <div className="text-2xl font-bold text-foreground">{totalTrainings}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Formations</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-100 dark:border-orange-900/50 min-w-[100px]">
              <div className="text-2xl font-bold text-primary">{totalHours}h</div>
              <div className="text-xs text-primary/70 font-medium uppercase tracking-wide">Heures</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" />
        Historique des formations
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {agent.participations.length > 0 ? (
          agent.participations.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow border-border/60 overflow-hidden group rounded-2xl bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className={cn("w-full sm:w-1.5 self-stretch", getValidationColor(p.validationStatus))} />
                  <div className="p-5 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                            {p.training.title}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {p.training.code} {p.supervisor ? `• Encadré par: ${p.supervisor}` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn("text-[10px] uppercase tracking-wider font-bold text-white border-0 px-3", getValidationColor(p.validationStatus))}>
                        {getValidationLabel(p.validationStatus)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary/50" />
                        {p.completionDate ? new Date(p.completionDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date non renseignée'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-primary/50" />
                        {p.customHours ?? 0} heures
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-muted-foreground">
            Aucune formation enregistrée pour cet agent.
          </div>
        )}
      </div>
    </div>
  );
}
