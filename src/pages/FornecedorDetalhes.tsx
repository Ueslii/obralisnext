import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFornecedores } from '@/hooks/useFornecedores';

export default function FornecedorDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fornecedores, getEntregasPorFornecedor } = useFornecedores();
  
  const fornecedor = fornecedores.find(f => f.id === id);
  const entregas = getEntregasPorFornecedor(id || '');

  if (!fornecedor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Fornecedor não encontrado</h2>
        <Button onClick={() => navigate('/fornecedores')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/fornecedores')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">🚚 {fornecedor.nome}</h1>
          <p className="text-muted-foreground">{fornecedor.categoria}</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedor.totalEntregas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              R$ {fornecedor.totalPago.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prazo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedor.prazoMedio} dias</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedor.avaliacaoQualidade}/5 ⭐</div>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Responsável</p>
            <p className="font-semibold">{fornecedor.contato}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">CNPJ</p>
            <p className="font-semibold font-mono">{fornecedor.cnpj}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Telefone</p>
            <p className="font-semibold">{fornecedor.telefone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">E-mail</p>
            <p className="font-semibold">{fornecedor.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Entregas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Histórico de Entregas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entregas.map((entrega) => (
              <div key={entrega.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{entrega.material}</h4>
                      <Badge variant={
                        entrega.status === 'entregue' ? 'default' :
                        entrega.status === 'atrasado' ? 'destructive' : 'secondary'
                      }>
                        {entrega.status === 'entregue' ? 'Entregue' :
                         entrega.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entrega.quantidade} {entrega.unidade}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-lg">
                      R$ {entrega.valorTotal.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{entrega.nomeObra}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(entrega.dataEntrega).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Prazo: {entrega.prazoEntrega} dias</span>
                  </div>
                </div>
              </div>
            ))}

            {entregas.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma entrega registrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
