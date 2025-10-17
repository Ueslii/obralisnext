import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Membro, NewMembro } from "@/hooks/useEquipes";

interface MembroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (dados: NewMembro | (Partial<Membro> & { id: string })) => void;
  membro?: Membro;
}

export function MembroDialog({
  open,
  onOpenChange,
  onSave,
  membro,
}: MembroDialogProps) {
  const [formData, setFormData] = useState<Partial<Membro>>({});

  useEffect(() => {
    if (membro) {
      setFormData(membro);
    } else {
      setFormData({
        nome: "",
        funcao: "",
        valor_hora: 0,
        telefone: "",
        email: "",
        status: "ativo",
      });
    }
  }, [membro, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    onSave(formData as NewMembro | (Partial<Membro> & { id: string }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {membro ? "Editar Membro" : "Adicionar Membro"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do membro da equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input
              id="nome"
              value={formData.nome || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="funcao" className="text-right">
              Função
            </Label>
            <Input
              id="funcao"
              value={formData.funcao || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valor_hora" className="text-right">
              Valor/Hora
            </Label>
            <Input
              id="valor_hora"
              type="number"
              value={formData.valor_hora || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              onValueChange={(value) => handleSelectChange("status", value)}
              value={formData.status}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="ferias">Férias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
