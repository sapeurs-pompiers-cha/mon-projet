import { useState } from "react";
import { useAgents, useCreateAgent } from "../hooks/use-agents";
import { AgentCard } from "../components/AgentCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema, type InsertAgent } from "../lib/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { useToast } from "../hooks/use-toast";

const RANKS = [
  "Sapeur 2ème classe",
  "Sapeur",
  "Caporal",
  "Caporal-chef",
  "Sergent",
  "Sergent-chef",
  "Adjudant",
  "Adjudant-chef",
  "Lieutenant",
  "Capitaine",
  "Commandant",
  "Lieutenant-colonel",
  "Colonel"
];

export default function Agents() {
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: agents, isLoading } = useAgents({ 
    search: search || undefined, 
    rank: rankFilter !== "all" ? rankFilter : undefined 
  });

  const createAgent = useCreateAgent();

  const form = useForm<InsertAgent>({
    resolver: zodResolver(insertAgentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      matricule: "",
      rank: "Sapeur",
      phone: "",
      photoUrl: "",
    },
  });

  const onSubmit = async (data: InsertAgent) => {
    try {
      await createAgent.mutateAsync(data);
      toast({ title: "Succès", description: "Agent créé avec succès." });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive"
      });
    }
  };

  const sortedAgents = agents
    ? [...agents].sort((a, b) => a.lastName.localeCompare(b.lastName, 'fr', { sensitivity: 'base' }))
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Agents</h1>
          <p className="text-muted-foreground mt-2">Gérez l'effectif de la caserne et suivez leur progression.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-orange-200">
              <Plus className="w-5 h-5 mr-2" />
              Nouvel Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel agent</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="matricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matricule</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selectionner un grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RANKS.map(rank => (
                              <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createAgent.isPending}>
                    {createAgent.isPending ? "Création..." : "Créer l'agent"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un agent..." 
            className="pl-10 border-0 bg-slate-50 focus-visible:ring-1 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={rankFilter} onValueChange={setRankFilter}>
            <SelectTrigger className="border-0 bg-slate-50 focus:ring-1 focus:ring-primary/20">
              <SelectValue placeholder="Filtrer par grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les grades</SelectItem>
              {RANKS.map(rank => (
                <SelectItem key={rank} value={rank}>{rank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent as any} />
          ))}
          {sortedAgents.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              Aucun agent trouvé correspondant à vos critères.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
