# Beyblade Overlay Engine
## Architecture Document

> Versão: V2 (Refatoração)
>
> Status: Em desenvolvimento

---

# Visão Geral

O **Beyblade Overlay Engine** é uma aplicação desenvolvida para auxiliar gravações, transmissões e campeonatos de Beyblade X.

Seu principal objetivo é permitir que um operador controle um overlay em tempo real através de um celular, enquanto uma segunda tela (TV, monitor ou tablet) exibe o placar e as animações da batalha.

O projeto foi pensado para crescer de forma modular, permitindo adicionar novas funcionalidades sem necessidade de alterar a arquitetura principal.

---

# Objetivos

O projeto possui cinco objetivos principais.

## 1. Controle remoto

O sistema deve permitir que qualquer celular conectado à mesma rede controle o placar.

O Controller nunca desenha informações.

Ele apenas envia comandos.

---

## 2. Overlay em tempo real

O Overlay é responsável apenas pela exibição.

Ele nunca calcula regras do jogo.

Nunca soma pontos.

Nunca decide vencedores.

Toda a lógica pertence à Engine.

---

## 3. Modularidade

Cada módulo possui apenas uma responsabilidade.

Exemplos:

- calcular pontos
- detectar vencedor
- tocar animações
- controlar sockets
- exibir interface

Nenhum módulo deve realizar mais de uma dessas funções.

---

## 4. Escalabilidade

O projeto deve permitir adicionar facilmente:

- novos Beys
- novas animações
- novos tipos de finalização
- novos modos de jogo
- novos overlays

sem necessidade de alterar a Engine principal.

---

## 5. Facilidade de desenvolvimento

Todo desenvolvedor deve conseguir localizar rapidamente onde uma funcionalidade pertence.

A estrutura do projeto deve ser previsível.

---

# Filosofia

Este projeto segue alguns princípios fundamentais.

## Uma responsabilidade por arquivo

Cada arquivo deve possuir apenas uma função.

Errado:

Servidor
↓

Socket
↓

Pontuação
↓

Vitória
↓

Animação

Correto:

Servidor

↓

SocketManager

↓

Engine

↓

ScoreSystem

↓

VictorySystem

↓

AnimationSystem

---

## Engine central

Toda decisão passa pela Engine.

Nenhum componente toma decisões sozinho.

---

## Comunicação por eventos

Os sistemas nunca chamam diretamente outros sistemas.

Sempre utilizam eventos.

Exemplo:

Controller

↓

Engine

↓

EventBus

↓

Todos os sistemas interessados

---

## Separação entre Backend e Frontend

Backend

- regras
- lógica
- comunicação
- estado da batalha

Frontend

- interface
- animações
- efeitos
- renderização

---

# Arquitetura

```
Controller
      │
      │ Socket.IO
      ▼
SocketManager
      │
      ▼
Engine
      │
      ▼
EventBus
      │
      ├───────────────┐
      │               │
      ▼               ▼
ScoreSystem     VictorySystem
      │               │
      └───────┬───────┘
              ▼
        Battle State
              │
              ▼
      SocketManager
              │
              ▼
 Overlay / OBS / Controller
```

---

# Estrutura de Pastas

```
beyblade-overlay-engine/

server.js

package.json

src/

    core/

        Engine.js

        EventBus.js

    battle/

        Battle.js

        Player.js

        Bey.js

        Match.js

        Finish.js

    systems/

        ScoreSystem.js

        VictorySystem.js

        AnimationSystem.js

        TournamentSystem.js

    socket/

        SocketManager.js

    network/

        NetworkManager.js

    shared/

        FinishTypes.js

        Events.js

        Points.js

        Colors.js

public/

    scoreboard/

    controller/

    assets/

        images/

        sounds/

        videos/

    js/

docs/
```

---

# Componentes

## Engine

É o cérebro do projeto.

Responsável por receber eventos e distribuí-los.

Nunca desenha interface.

Nunca toca animações.

Nunca envia HTML.

---

## EventBus

Sistema responsável pela comunicação entre módulos.

Todos os eventos passam por ele.

---

## Battle

Representa uma batalha.

Contém:

- jogadores
- estado
- rodada
- histórico

---

## Player

Representa um blader.

Contém:

- nome
- bey
- pontuação
- vitórias

---

## Bey

Representa um Beyblade.

Contém:

- nome
- imagem
- cor
- sons
- animações

---

## ScoreSystem

Calcula a pontuação.

Regras atuais:

Spin Finish → 1

Over Finish → 2

Burst Finish → 2

Xtreme Finish → 3

---

## VictorySystem

Responsável apenas por responder:

Existe vencedor?

Quem venceu?

---

## AnimationSystem

Decide qual animação deverá ser executada.

Exemplo:

Burst Finish

↓

Dran Sword

↓

Animacao A

---

# Fluxo de uma batalha

1.

Controller envia:

Burst Finish

↓

2.

Socket recebe.

↓

3.

Engine processa.

↓

4.

ScoreSystem calcula.

↓

5.

VictorySystem verifica.

↓

6.

Battle atualiza estado.

↓

7.

Socket envia atualização.

↓

8.

Overlay atualiza interface.

---

# Princípios de Código

- Um arquivo = uma responsabilidade.
- Nenhum número mágico.
- Nenhuma string repetida.
- Sempre utilizar constantes.
- Métodos devem possuir nomes claros.
- Evitar grandes blocos de if.
- Preferir composição ao invés de repetição.

---

# Roadmap

## V2

- Refatoração completa
- Nova arquitetura
- Novo placar
- Novo Controller

---

## V3

- Sistema de Beys
- Sons
- Vídeos
- Animações exclusivas

---

## V4

- Sistema de Torneios
- Ranking
- Histórico

---

## V5

- Integração OBS
- Replay
- Estatísticas

---

## V6

- Banco de dados (SQLite)
- Perfis
- Configurações

---

## Gerenciamento de batalhas

Na versão inicial, a aplicação trabalha com apenas uma batalha ativa por instância da Engine.

A entidade `Battle`, entretanto, não utiliza estado global nem o padrão Singleton. Cada batalha é uma instância independente.

Essa decisão mantém a implementação inicial simples, mas permite que versões futuras adicionem múltiplas batalhas simultâneas por meio de salas, torneios ou múltiplas instâncias da Engine, sem exigir a reescrita do domínio.

# Objetivo Final

O objetivo deste projeto não é apenas criar um placar.

O objetivo é construir uma plataforma modular para transmissões e gravações de Beyblade X.

Toda nova funcionalidade deverá ser adicionada como um módulo independente, mantendo a arquitetura organizada, desacoplada e fácil de evoluir.