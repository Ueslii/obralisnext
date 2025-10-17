import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Obra } from "@/hooks/useObrasSupabase"; // CORREÇÃO: Importado do hook correto
import { useState, useEffect } from "react";

export interface ObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  obra: Obra | null;
}

export function ObraDialog({
  open,
  onOpenChange,
  onSave,
  obra,
}: ObraDialogProps) {
  const [dados, setDados] = useState<Partial<Obra>>({});

  useEffect(() => {
    setDados(obra || { status: "planejada", progresso: 0, custo_real: 0 });
  }, [obra]);

  const handleChange = (field: keyof Obra, value: any) => {
    setDados((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(dados);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{obra ? "Editar Obra" : "Criar Nova Obra"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da obra abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input
              id="nome"
              value={dados.nome || ""}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="responsavel" className="text-right">
              Responsável
            </Label>
            <Input
              id="responsavel"
              value={dados.responsavel || ""}
              onChange={(e) => handleChange("responsavel", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custoPrevisto" className="text-right">
              Custo Previsto
            </Label>
            <Input
              id="custoPrevisto"
              type="number"
              value={dados.custo_previsto || ""}
              onChange={(e) =>
                handleChange("custo_previsto", parseFloat(e.target.value) || 0)
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prazo" className="text-right">
              Prazo Final
            </Label>
            <Input
              id="prazo"
              type="date"
              value={dados.prazo || ""}
              onChange={(e) => handleChange("prazo", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              onValueChange={(v) => handleChange("status", v)}
              value={dados.status || "planejada"}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
