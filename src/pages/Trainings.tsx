import { useState } from "react";
import { useTrainings, useCreateTraining, useUpdateTraining } from "../hooks/use-trainings";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Tag, Paperclip, Search, Filter, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrainingSchema, type InsertTraining, type Training } from "../lib/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { useToast } from "../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";


const CATEGORIES = [
  { value: "secourisme", label: "Secourisme" },
  { value: "opérations diverses", label: "Opérations diverses" },
  { value: "incendie", label: "Incendie" },
  { value: "autre", label: "Autre" },
];

export default function Trainings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: trainings, isLoading } = useTrainings();
  const createTraining = useCreateTraining();
  const updateTraining = useUpdateTraining();
  const { toast } = useToast();

  const form = useForm<InsertTraining>({
    resolver: zodResolver(insertTrainingSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      category: "autre",
      documents: [],
    },
  });

  const onSubmit = async (data: InsertTraining) => {
    try {
      if (editingTraining) {
        await updateTraining.mutateAsync({ id: editingTraining.id, ...data });
        toast({ title: "Succès", description: "Formation mise à jour avec succès." });
      } else {
        await createTraining.mutateAsync(data);
        toast({ title: "Succès", description: "Formation créée avec succès." });
      }
      setIsDialogOpen(false);
      setEditingTraining(null);
      form.reset({
        code: "",
        title: "",
        description: "",
        category: "autre",
        documents: [],
      });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    form.reset({
      code: training.code,
      title: training.title,
      description: training.description || "",
      category: training.category as any,
      documents: (training.documents as string[]) || [],
    });
    setIsDialogOpen(true);
  };

  const filteredTrainings = trainings?.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Catalogue des Formations</h1>
          <p className="text-muted-foreground mt-2">Liste des actions de formations.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTraining(null);
            form.reset({
              code: "",
              title: "",
              description: "",
              category: "autre",
              documents: [],
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-orange-200">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTraining ? "Modifier la formation" : "Créer une formation"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code de la formation</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre de la formation</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[100px] resize-none" 
                          {...field} 
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Documents relatifs</FormLabel>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50/50">
                    <Paperclip className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Cliquez pour ajouter des documents (PDF, Images...)</p>
                    <Input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      id="doc-upload"
                      onChange={(e) => {
                        toast({ title: "Info", description: "Le téléchargement de fichiers sera bientôt disponible." });
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => document.getElementById('doc-upload')?.click()}
                    >
                      Parcourir
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createTraining.isPending || updateTraining.isPending} className="w-full sm:w-auto">
                    {editingTraining ? (updateTraining.isPending ? "Mise à jour..." : "Modifier") : (createTraining.isPending ? "Création..." : "Créer la session")}
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
            placeholder="Rechercher une formation..." 
            className="pl-10 border-0 bg-slate-50 focus-visible:ring-1 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="border-0 bg-slate-50 focus:ring-1 focus:ring-primary/20">
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : (
          filteredTrainings?.map((training) => (
            <Card
              key={training.id}
              className="hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
              onClick={() => handleEdit(training)}
            >
              <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 font-mono text-[9px] uppercase tracking-wider h-5 flex items-center shrink-0"
                  >
                    {training.code}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize text-[9px] font-bold h-5 flex items-center shrink-0">
                      <Tag className="w-2.5 h-2.5 mr-1" />
                      {training.category}
                    </Badge>
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <CardTitle className="text-sm font-bold line-clamp-2 leading-tight">{training.title}</CardTitle>
              </CardHeader>
              {training.description && (
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                    {training.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
        {!isLoading && filteredTrainings?.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucune formation trouvée correspondant à vos critères.
          </div>
        )}
      </div>
    </div>
  );
}
