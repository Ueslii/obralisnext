import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlertas } from "@/hooks/useAlertas";

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf())
    ? value
    : parsed.toLocaleString("pt-BR");
};

const severidadeBadge = {
  alta: "destructive",
  media: "secondary",
  baixa: "outline",
} as const;

export default function Alertas() {
  const {
    alertas,
    alertasNaoLidos,
    isLoading,
    marcarComoLido,
    marcarTodosComoLidos,
    deleteAlerta,
  } = useAlertas();

  const severidadeIcons = {
    alta: <AlertTriangle className="h-5 w-5 text-destructive" />,
    media: <Info className="h-5 w-5 text-yellow-500" />,
    baixa: <CheckCircle2 className="h-5 w-5 text-success" />,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">🚨 Alertas Inteligentes</h1>
          <p className="text-muted-foreground">
            Sistema de notificações e alertas automáticos
          </p>
        </div>
        {alertasNaoLidos.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              void marcarTodosComoLidos();
            }}
          >
            Marcar todos como lidos
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidos</CardTitle>
            <Info className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {alertasNaoLidos.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Severidade</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {alertas.filter((a) => a.severidade === "alta").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Carregando alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Buscando alertas cadastrados...
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Histórico de Alertas
          </CardTitle>
          <CardDescription>
            Todos os alertas e notificações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-lg border transition-all ${
                  alerta.lido
                    ? "border-border hover:bg-muted/30"
                    : "bg-muted/50 border-primary"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      alerta.severidade === "alta"
                        ? "bg-destructive/10"
                        : alerta.severidade === "media"
                        ? "bg-yellow-500/10"
                        : "bg-success/10"
                    }`}
                  >
                    {severidadeIcons[alerta.severidade]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{alerta.titulo}</h3>
                        <Badge variant={severidadeBadge[alerta.severidade]}>
                          {alerta.severidade === "alta"
                            ? "Alta"
                            : alerta.severidade === "media"
                            ? "Média"
                            : "Baixa"}
                        </Badge>
                        {!alerta.lido && <Badge variant="default">Novo</Badge>}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          void deleteAlerta(alerta.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {alerta.descricao}
                    </p>

                    {alerta.nomeObra && (
                      <p className="text-xs text-muted-foreground mb-2">
                        🏗️ Obra: {alerta.nomeObra}
                      </p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(alerta.data)}
                      </span>

                      {alerta.acao && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          {alerta.acao}
                        </Button>
                      )}

                      {!alerta.lido && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            void marcarComoLido(alerta.id);
                          }}
                        >
                          Marcar como lido
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {alertas.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-lg font-medium mb-1">Nenhum alerta ativo</p>
                <p className="text-sm text-muted-foreground">
                  O sistema está monitorando suas obras e notificará sobre qualquer
                  situação relevante.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
