import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssistenteIA } from "@/hooks/useAssistenteIA";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AssistenteDialogProps {
  contexto: any;
  trigger?: React.ReactNode;
}

export function AssistenteDialog({ contexto, trigger }: AssistenteDialogProps) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<'cronograma' | 'custo' | 'eficiencia'>('cronograma');
  const [resposta, setResposta] = useState('');
  const { gerarSugestao, carregando } = useAssistenteIA();

  const handleGerar = async () => {
    const resultado = await gerarSugestao(tipo, contexto);
    setResposta(resultado);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Assistente IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistente Inteligente
          </DialogTitle>
          <DialogDescription>
            Obtenha sugestões e análises para otimizar sua obra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Análise</label>
            <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cronograma">🕒 Otimização de Cronograma</SelectItem>
                <SelectItem value="custo">💰 Redução de Custos</SelectItem>
                <SelectItem value="eficiencia">⚡ Aumento de Eficiência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGerar}
            disabled={carregando}
            className="w-full gradient-primary"
          >
            {carregando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Sugestões
              </>
            )}
          </Button>

          {resposta && (
            <Card className="bg-muted/50 animate-fade-in">
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans">{resposta}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

