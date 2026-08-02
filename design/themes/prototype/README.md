Prototype Theme (HUD V1)

Objetivo

O Prototype Theme é o primeiro HUD visual do projeto Score_BeyX.

Ele não pretende copiar fielmente o anime Beyblade X. Seu objetivo éservir como uma interpretação própria, priorizando impacto visual,legibilidade e animações cinematográficas para gravações e transmissões.

No futuro existirão outros temas (Anime, Official, Minimal, etc.), todosutilizando exatamente a mesma arquitetura do projeto.

Filosofia

O HUD deve parecer uma cena de um anime e não apenas um placar.

Cada elemento visual deve existir para comunicar um acontecimento dabatalha.

Nenhuma animação será adicionada apenas por ser bonita.

Toda animação precisa transmitir informação.

Princípios

O Bey é o protagonista da interface.

O placar deve ser sempre legível.

A interface deve permanecer viva mesmo sem eventos.

O foco visual deve mudar conforme o estado da batalha.

O HUD nunca altera regras da batalha.

Inspirações

Beyblade X

Interfaces futuristas

HUDs tecnológicos

Transmissões de eSports

Estrutura visual

Fundo

Gradiente azul tecnológico

Retângulos e quadrados translúcidos

Movimento constante

Pequenas partículas

Linhas luminosas discretas

Leve vinheta

O fundo nunca deve ficar completamente parado.

Beys

Os Beys ocupam a maior parte da tela.

Eles representam os competidores, sendo mais importantes visualmente doque os nomes.

Animação contínua

Mesmo durante momentos sem ação:

breathing extremamente suave

pequena variação de escala

movimento quase imperceptível

A intenção é transmitir que o HUD está vivo.

Placar

Posicionado no centro.

Exemplo:

2 - 0

O placar é o elemento com maior peso visual.

Quando a pontuação muda:

animação de flip inspirada no anime

transição rápida

atualização sincronizada com o evento

Finish Banner

Eventos:

Spin Finish

Over Finish

Burst Finish

Xtreme Finish

Fluxo:

Fundo escurece.

Fundo recebe blur.

Banner entra lateralmente.

Nome do Finish aparece.

Banner desaparece.

Placar atualiza.

Estado do vencedor

Durante a batalha:

líder recebe destaque visual

derrotado perde um pouco de opacidade

Ao final:

tela Winner

Bey vencedor em destaque

versão ampliada do Bey ao fundo

nome do Bey

animação cinematográfica

Paleta inicial

Azul

Ciano

Verde translúcido

Branco

Preto para o placar

Responsabilidades

O tema apenas representa informações.

Ele nunca:

calcula pontos

decide vencedor

altera regras

conversa diretamente com a Battle

Ele apenas reage aos eventos recebidos.

Eventos utilizados

battle

battle

battle

finish

battle

battle

Ideias futuras

temas alternativos

HUD fiel ao anime

HUD oficial para campeonatos

HUD minimalista

animações específicas por Bey

efeitos exclusivos para Xtreme Finish

sons próprios de cada tema

AssetLoader para pré-carregar imagens, vídeos, fontes e áudios

Lembrete

Sempre que surgir uma nova ideia, responder antes:

Ela comunica melhor a batalha?

Ela melhora a experiência do espectador?

Ela combina com a identidade do Prototype?

Ela pertence ao tema ou ao backend?