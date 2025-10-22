"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Orcamento, Insumo, MaoDeObra, DespesaExtra, Transporte } from '@/hooks/useOrcamentos';

interface OrcamentoDialogProps {
    orcamento?: Orcamento;
    onSave: (dados: any) => void;
    trigger?: React.ReactNode;
    custoPorM2Padrao: Record<string, number>;
}

export function OrcamentoDialog({ orcamento, onSave, trigger, custoPorM2Padrao }: OrcamentoDialogProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('geral');

    const [formData, setFormData] = useState({
        nomeObra: orcamento?.nomeObra || '',
        tipoObra: orcamento?.tipoObra || 'residencial' as const,
        area: orcamento?.area || 0,
        localizacao: orcamento?.localizacao || '',
        status: orcamento?.status || 'rascunho' as const,
        responsavelTecnico: orcamento?.responsavelTecnico || '',
        dataEmissao: orcamento?.dataEmissao || new Date().toISOString().split('T')[0],
        custoPorM2: orcamento?.custoPorM2 || custoPorM2Padrao.residencial,
        insumos: orcamento?.insumos || [] as Insumo[],
        maoDeObra: orcamento?.maoDeObra || [] as MaoDeObra[],
        transporte: orcamento?.transporte || {
            distancia: 0,
            consumo: 10,
            precoGasolina: 5.5,
            viagensSemana: 5,
            duracaoSemanas: 12,
            pedagios: 0,
        } as Transporte,
        despesasExtras: orcamento?.despesasExtras || [] as DespesaExtra[],
        encargosMaoObra: orcamento?.encargosMaoObra || 80,
        margemAdministrativa: orcamento?.margemAdministrativa || 15,
        contingencia: orcamento?.contingencia || 10,
        margemLucro: orcamento?.margemLucro || 15,
        impostos: orcamento?.impostos || 12,
        observacoesTecnicas: orcamento?.observacoesTecnicas || '',
    });

    const handleTipoChange = (tipo: string) => {
        setFormData({
            ...formData,
            tipoObra: tipo as any,
            custoPorM2: custoPorM2Padrao[tipo as keyof typeof custoPorM2Padrao],
        });
    };

    const addInsumo = () => {
        setFormData({
            ...formData,
            insumos: [...formData.insumos, {
                id: Date.now().toString(),
                descricao: '',
                unidade: 'un',
                quantidade: 0,
                valorUnitario: 0,
            }],
        });
    };

    const removeInsumo = (id: string) => {
        setFormData({
            ...formData,
            insumos: formData.insumos.filter(i => i.id !== id),
        });
    };

    const updateInsumo = (id: string, field: keyof Insumo, value: any) => {
        setFormData({
            ...formData,
            insumos: formData.insumos.map(i =>
                i.id === id ? { ...i, [field]: value } : i
            ),
        });
    };

    const addMaoDeObra = () => {
        setFormData({
            ...formData,
            maoDeObra: [...formData.maoDeObra, {
                id: Date.now().toString(),
                funcao: '',
                quantidade: 0,
                custoDiario: 0,
                duracao: 0,
            }],
        });
    };

    const removeMaoDeObra = (id: string) => {
        setFormData({
            ...formData,
            maoDeObra: formData.maoDeObra.filter(m => m.id !== id),
        });
    };

    const updateMaoDeObra = (id: string, field: keyof MaoDeObra, value: any) => {
        setFormData({
            ...formData,
            maoDeObra: formData.maoDeObra.map(m =>
                m.id === id ? { ...m, [field]: value } : m
            ),
        });
    };

    const addDespesa = () => {
        setFormData({
            ...formData,
            despesasExtras: [...formData.despesasExtras, {
                id: Date.now().toString(),
                categoria: '',
                valor: 0,
            }],
        });
    };

    const removeDespesa = (id: string) => {
        setFormData({
            ...formData,
            despesasExtras: formData.despesasExtras.filter(d => d.id !== id),
        });
    };

    const updateDespesa = (id: string, field: keyof DespesaExtra, value: any) => {
        setFormData({
            ...formData,
            despesasExtras: formData.despesasExtras.map(d =>
                d.id === id ? { ...d, [field]: value } : d
            ),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>{"Novo Orçamento"}</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {orcamento ? "Editar Orçamento" : "Novo Orçamento"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="geral">Geral</TabsTrigger>
                            <TabsTrigger value="insumos">Insumos</TabsTrigger>
                            <TabsTrigger value="maoObra">{"Mão de Obra"}</TabsTrigger>
                            <TabsTrigger value="transporte">Transporte</TabsTrigger>
                            <TabsTrigger value="extras">Extras</TabsTrigger>
                            <TabsTrigger value="resumo">Resumo</TabsTrigger>
                        </TabsList>

                        <TabsContent value="geral" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nomeObra">Nome da Obra</Label>
                                    <Input
                                        id="nomeObra"
                                        value={formData.nomeObra}
                                        onChange={(e) => setFormData({ ...formData, nomeObra: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tipoObra">Tipo de Obra</Label>
                                    <Select value={formData.tipoObra} onValueChange={handleTipoChange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="residencial">Residencial</SelectItem>
                                            <SelectItem value="comercial">Comercial</SelectItem>
                                            <SelectItem value="industrial">Industrial</SelectItem>
                                            <SelectItem value="reforma">Reforma</SelectItem>
                                            <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="area">{"Área (m²)"}</Label>
                                    <Input
                                        id="area"
                                        type="number"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="custoPorM2">{"Custo por m²"}</Label>
                                    <Input
                                        id="custoPorM2"
                                        type="number"
                                        value={formData.custoPorM2}
                                        onChange={(e) => setFormData({ ...formData, custoPorM2: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="localizacao">{"Localização"}</Label>
                                    <Input
                                        id="localizacao"
                                        value={formData.localizacao}
                                        onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="responsavelTecnico">{"Responsável Técnico"}</Label>
                                    <Input
                                        id="responsavelTecnico"
                                        value={formData.responsavelTecnico}
                                        onChange={(e) => setFormData({ ...formData, responsavelTecnico: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rascunho">Rascunho</SelectItem>
                                            <SelectItem value="aprovado">Aprovado</SelectItem>
                                            <SelectItem value="revisao">{"Em Revisão"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="dataEmissao">{"Data de Emissão"}</Label>
                                    <Input
                                        id="dataEmissao"
                                        type="date"
                                        value={formData.dataEmissao}
                                        onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="insumos" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Insumos</h3>
                                <Button type="button" onClick={addInsumo} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Insumo
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {formData.insumos.map((insumo) => (
                                    <div key={insumo.id} className="grid grid-cols-6 gap-2 p-3 border rounded-lg">
                                        <Input
                                            placeholder="Descrição"
                                            value={insumo.descricao}
                                            onChange={(e) => updateInsumo(insumo.id, 'descricao', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Unidade"
                                            value={insumo.unidade}
                                            onChange={(e) => updateInsumo(insumo.id, 'unidade', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Qtd"
                                            value={insumo.quantidade}
                                            onChange={(e) => updateInsumo(insumo.id, 'quantidade', parseFloat(e.target.value))}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Valor Unit."
                                            value={insumo.valorUnitario}
                                            onChange={(e) => updateInsumo(insumo.id, 'valorUnitario', parseFloat(e.target.value))}
                                        />
                                        <Input
                                            placeholder="Fornecedor"
                                            value={insumo.fornecedor || ''}
                                            onChange={(e) => updateInsumo(insumo.id, 'fornecedor', e.target.value)}
                                        />
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeInsumo(insumo.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="maoObra" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">{"Mão de Obra"}</h3>
                                <Button type="button" onClick={addMaoDeObra} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {"Adicionar Função"}
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {formData.maoDeObra.map((mao) => (
                                    <div key={mao.id} className="grid grid-cols-5 gap-2 p-3 border rounded-lg">
                                        <Input
                                            placeholder="Função"
                                            value={mao.funcao}
                                            onChange={(e) => updateMaoDeObra(mao.id, 'funcao', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Qtd"
                                            value={mao.quantidade}
                                            onChange={(e) => updateMaoDeObra(mao.id, 'quantidade', parseFloat(e.target.value))}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Custo/Dia"
                                            value={mao.custoDiario}
                                            onChange={(e) => updateMaoDeObra(mao.id, 'custoDiario', parseFloat(e.target.value))}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Dias"
                                            value={mao.duracao}
                                            onChange={(e) => updateMaoDeObra(mao.id, 'duracao', parseFloat(e.target.value))}
                                        />
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeMaoDeObra(mao.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                <div>
                                    <Label htmlFor="encargosMaoObra">Encargos (%)</Label>
                                    <Input
                                        id="encargosMaoObra"
                                        type="number"
                                        value={formData.encargosMaoObra}
                                        onChange={(e) => setFormData({ ...formData, encargosMaoObra: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="margemAdministrativa">Margem Administrativa (%)</Label>
                                    <Input
                                        id="margemAdministrativa"
                                        type="number"
                                        value={formData.margemAdministrativa}
                                        onChange={(e) => setFormData({ ...formData, margemAdministrativa: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="transporte" className="space-y-4">
                            <h3 className="text-lg font-semibold">Transporte</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="distancia">{"Distância (km)"}</Label>
                                    <Input
                                        id="distancia"
                                        type="number"
                                        value={formData.transporte.distancia}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            transporte: { ...formData.transporte, distancia: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="consumo">Consumo (km/l)</Label>
                                    <Input
                                        id="consumo"
                                        type="number"
                                        value={formData.transporte.consumo}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            transporte: { ...formData.transporte, consumo: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="precoGasolina">{"Preço Gasolina (R$/l)"}</Label>
                                    <Input
                                        id="precoGasolina"
                                        type="number"
                                        value={formData.transporte.precoGasolina}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            transporte: { ...formData.transporte, precoGasolina: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="viagensSemana">Viagens/Semana</Label>
                                    <Input
                                        id="viagensSemana"
                                        type="number"
                                        value={formData.transporte.viagensSemana}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            transporte: { ...formData.transporte, viagensSemana: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="duracaoSemanas">{"Duração (semanas)"}</Label>
                                    <Input
                                        id="duracaoSemanas"
                                        type="number"
                                        value={formData.transporte.duracaoSemanas}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            transporte: { ...formData.transporte, duracaoSemanas: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="pedagios">{"Pedágios (R$)"}</Label>
                                    <Input
                                        id="pedagios"
                                        type="number"
                                        value={formData.transporte.pedagios}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            transporte: { ...formData.transporte, pedagios: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="extras" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Despesas Extras</h3>
                                <Button type="button" onClick={addDespesa} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Despesa
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {formData.despesasExtras.map((despesa) => (
                                    <div key={despesa.id} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                                        <Input
                                            placeholder="Categoria"
                                            value={despesa.categoria}
                                            onChange={(e) => updateDespesa(despesa.id, 'categoria', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Valor"
                                            value={despesa.valor}
                                            onChange={(e) => updateDespesa(despesa.id, 'valor', parseFloat(e.target.value))}
                                        />
                                        <Input
                                            placeholder="Observações"
                                            value={despesa.observacoes || ''}
                                            onChange={(e) => updateDespesa(despesa.id, 'observacoes', e.target.value)}
                                        />
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeDespesa(despesa.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                <div>
                                    <Label htmlFor="contingencia">{"Contingência (%)"}</Label>
                                    <Input
                                        id="contingencia"
                                        type="number"
                                        value={formData.contingencia}
                                        onChange={(e) => setFormData({ ...formData, contingencia: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
                                    <Input
                                        id="margemLucro"
                                        type="number"
                                        value={formData.margemLucro}
                                        onChange={(e) => setFormData({ ...formData, margemLucro: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="impostos">Impostos (%)</Label>
                                    <Input
                                        id="impostos"
                                        type="number"
                                        value={formData.impostos}
                                        onChange={(e) => setFormData({ ...formData, impostos: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="resumo" className="space-y-4">
                            <h3 className="text-lg font-semibold">Resumo</h3>
                            <div>
                                <Label htmlFor="observacoesTecnicas">{"Observações Técnicas"}</Label>
                                <Textarea
                                    id="observacoesTecnicas"
                                    rows={4}
                                    value={formData.observacoesTecnicas}
                                    onChange={(e) => setFormData({ ...formData, observacoesTecnicas: e.target.value })}
                                    placeholder="Informações adicionais sobre o orçamento..."
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {"O orçamento será calculado automaticamente com base nos dados inseridos. "}
                                {"Você poderá visualizar os totais e exportar em PDF após salvar."}
                            </p>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">{"Salvar Orçamento"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
