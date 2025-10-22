"use client";

import { useState } from 'react';

export const useAssistenteIA = () => {
    const [carregando, setCarregando] = useState(false);

    const gerarSugestao = async (tipo: 'cronograma' | 'custo' | 'eficiencia', contexto: any): Promise<string> => {
        setCarregando(true);

        // Simulação de delay de IA
        await new Promise((resolve) => setTimeout(resolve, 1500));

        let resposta = '';

        switch (tipo) {
            case 'cronograma':
                resposta = `📅 Análise de Cronograma:\n\nCom base nos dados da obra "${contexto.nomeObra}", recomendo:\n\n1. Priorizar a conclusão da fundação em 3 semanas\n2. Iniciar estrutura imediatamente após fundação\n3. Considerar trabalho em turnos para acelerar o acabamento\n4. Prazo estimado total: ${contexto.prazo || '6 meses'}\n\n⚠️ Atenção: Considere margem de 15% para imprevistos climáticos.`;
                break;

            case 'custo':
                const economia = (contexto.custoPrevisto * 0.12).toLocaleString('pt-BR');
                resposta = `💰 Otimização de Custos:\n\nAnálise para "${contexto.nomeObra}":\n\n• Custo previsto: R$ ${contexto.custoPrevisto?.toLocaleString('pt-BR')}\n• Custo atual: R$ ${contexto.custoReal?.toLocaleString('pt-BR')}\n\n📊 Sugestões:\n1. Negociar compra de materiais em atacado (economia estimada: R$ ${economia})\n2. Otimizar logística de transporte\n3. Revisar contratos com fornecedores\n4. Considerar materiais alternativos com melhor custo-benefício`;
                break;

            case 'eficiencia':
                resposta = `⚡ Aumento de Eficiência:\n\nPara "${contexto.nomeObra}" (${contexto.progresso}% concluída):\n\n✅ Pontos fortes:\n• Equipe bem dimensionada\n• Materiais disponíveis\n\n⚠️ Melhorias sugeridas:\n1. Implementar sistema de check-in digital para equipes\n2. Criar cronograma semanal detalhado\n3. Realizar reuniões de alinhamento diárias (15min)\n4. Automatizar controle de estoque\n\n📈 Ganho estimado de produtividade: 18-25%`;
                break;
        }

        setCarregando(false);
        return resposta;
    };

    return { gerarSugestao, carregando };
};
