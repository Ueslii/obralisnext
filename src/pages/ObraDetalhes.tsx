import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Image, Package, DollarSign, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useObras } from '@/hooks/useObras';
import { useObraDetalhes } from '@/hooks/useObraDetalhes';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function ObraDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getObra } = useObras();
  const obra = getObra(id || '');
  
  const { comentarios, insumos, imprevistos, addComentario, addInsumo, updateInsumo, addImprevisto, getTotalImprevistos } = useObraDetalhes(id || '');
  const { lancamentos } = useFinanceiro();
  
  const [novoComentario, setNovoComentario] = useState('');
  const [novoInsumo, setNovoInsumo] = useState({ nome: '', quantidade: 0, unidade: '', fornecedor: '', dataEntrega: '' });
  const [novoImprevisto, setNovoImprevisto] = useState({ descricao: '', valor: 0, categoria: 'material' });

  if (!obra) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Obra não encontrada</h2>
        <Button onClick={() => navigate('/obras')}>Voltar para Obras</Button>
      </div>
    );
  }

  const lancamentosObra = lancamentos.filter(l => l.obraId === id);
  const totalReceitas = lancamentosObra.filter(l => l.tipo === 'receita').reduce((sum, l) => sum + l.valor, 0);
  const totalDespesas = lancamentosObra.filter(l => l.tipo === 'despesa').reduce((sum, l) => sum + l.valor, 0);
  const saldoObra = totalReceitas - totalDespesas - getTotalImprevistos();

  const handleAddComentario = () => {
    if (novoComentario.trim()) {
      addComentario({
        obraId: id || '',
        autor: 'Usuário Atual',
        conteudo: novoComentario,
        tipo: 'comentario',
      });
      setNovoComentario('');
    }
  };

  const handleAddInsumo = () => {
    if (novoInsumo.nome && novoInsumo.quantidade > 0) {
      addInsumo({
        obraId: id || '',
        ...novoInsumo,
        quantidadeUsada: 0,
      });
      setNovoInsumo({ nome: '', quantidade: 0, unidade: '', fornecedor: '', dataEntrega: '' });
    }
  };

  const handleAddImprevisto = () => {
    if (novoImprevisto.descricao && novoImprevisto.valor > 0) {
      addImprevisto({
        obraId: id || '',
        ...novoImprevisto,
      });
      setNovoImprevisto({ descricao: '', valor: 0, categoria: 'material' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/obras')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">🏗️ {obra.nome}</h1>
          <p className="text-muted-foreground">{obra.endereco}</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {obra.status === 'em_andamento' ? 'Em Andamento' : 
           obra.status === 'concluida' ? 'Concluída' : 
           obra.status === 'atrasada' ? 'Atrasada' : 'Planejada'}
        </Badge>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{obra.progresso}%</div>
            <Progress value={obra.progresso} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              Saldo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${saldoObra >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {saldoObra.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Imprevistos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">
              R$ {getTotalImprevistos().toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Prazo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(obra.prazo).toLocaleDateString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="comentarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comentarios">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentários
          </TabsTrigger>
          <TabsTrigger value="insumos">
            <Package className="h-4 w-4 mr-2" />
            Insumos
          </TabsTrigger>
          <TabsTrigger value="imprevistos">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Imprevistos
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comentarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo Comentário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Adicione observações, atualizações ou fotos..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComentario}>Adicionar Comentário</Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {comentarios.map((com) => (
              <Card key={com.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{com.autor}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(com.data).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{com.conteudo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insumos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Insumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Material</Label>
                  <Input
                    value={novoInsumo.nome}
                    onChange={(e) => setNovoInsumo({ ...novoInsumo, nome: e.target.value })}
                    placeholder="Ex: Cimento, Areia, Tijolo..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    value={novoInsumo.fornecedor}
                    onChange={(e) => setNovoInsumo({ ...novoInsumo, fornecedor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={novoInsumo.quantidade}
                    onChange={(e) => setNovoInsumo({ ...novoInsumo, quantidade: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Input
                    value={novoInsumo.unidade}
                    onChange={(e) => setNovoInsumo({ ...novoInsumo, unidade: e.target.value })}
                    placeholder="Ex: kg, m³, unidade..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Entrega</Label>
                  <Input
                    type="date"
                    value={novoInsumo.dataEntrega}
                    onChange={(e) => setNovoInsumo({ ...novoInsumo, dataEntrega: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddInsumo}>Adicionar Insumo</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insumos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insumos.map((ins) => (
                  <div key={ins.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{ins.nome}</span>
                      <Badge variant="outline">{ins.fornecedor}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Total: {ins.quantidade} {ins.unidade}</span>
                      <span>Usado: {ins.quantidadeUsada} {ins.unidade}</span>
                      <span>Restante: {ins.quantidade - ins.quantidadeUsada} {ins.unidade}</span>
                    </div>
                    <Progress value={(ins.quantidadeUsada / ins.quantidade) * 100} className="h-2" />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Atualizar quantidade usada"
                        className="flex-1"
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val > 0) updateInsumo(ins.id, val);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imprevistos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Imprevisto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={novoImprevisto.descricao}
                    onChange={(e) => setNovoImprevisto({ ...novoImprevisto, descricao: e.target.value })}
                    placeholder="Descreva o imprevisto..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={novoImprevisto.valor}
                    onChange={(e) => setNovoImprevisto({ ...novoImprevisto, valor: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={novoImprevisto.categoria} onValueChange={(v) => setNovoImprevisto({ ...novoImprevisto, categoria: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="mao_obra">Mão de Obra</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddImprevisto}>Registrar Imprevisto</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Imprevistos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {imprevistos.map((imp) => (
                  <div key={imp.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{imp.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {imp.categoria} • {new Date(imp.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-destructive">
                      R$ {imp.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Custo Previsto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  R$ {obra.custoPrevisto.toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Custo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-destructive">
                  R$ {(totalDespesas + getTotalImprevistos()).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diferença</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold font-mono ${
                  obra.custoPrevisto - (totalDespesas + getTotalImprevistos()) >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  R$ {(obra.custoPrevisto - (totalDespesas + getTotalImprevistos())).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lançamentos da Obra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lancamentosObra.map((lanc) => (
                  <div key={lanc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{lanc.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {lanc.categoria} • {new Date(lanc.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`font-mono font-bold ${lanc.tipo === 'receita' ? 'text-success' : 'text-destructive'}`}>
                      {lanc.tipo === 'receita' ? '+' : '-'} R$ {lanc.valor.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
