const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const os = require('os');

// Serve os arquivos da pasta public
app.use(express.static('public'));

// Estado do jogo
let gameState = {
    score1: 0,
    score2: 0,
    player1Name: 'Vex',
    player2Name: 'Knight'
};

// Quando alguém conecta
io.on('connection', (socket) => {
    console.log('📱 Dispositivo conectado:', socket.id);
    
    // Envia o estado atual para quem conectou
    socket.emit('estado-inicial', gameState);
    
    // Recebe comandos do celular
    socket.on('comando', (dados) => {
        console.log('⚡ Comando recebido:', dados);
        
        // Processa o comando
        if (dados.type === 'burst') {
            // Atualiza o placar
            if (dados.winner === 'player1') {
                gameState.score1++;
            } else if (dados.winner === 'player2') {
                gameState.score2++;
            }
        }
        
        // Envia para TODOS os dispositivos (tablet e celular)
        io.emit('atualizacao', {
            ...dados,
            score1: gameState.score1,
            score2: gameState.score2
        });
    });
    
    // Quando desconecta
    socket.on('disconnect', () => {
        console.log('📱 Dispositivo desconectado');
    });
});

// Função para pegar IPs da rede
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (let name in interfaces) {
        for (let iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

// Inicia o servidor
const PORT = 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 SERVIDOR INICIADO!\n');
    console.log('📺 Tablet (Interface):');
    console.log(`   http://localhost:${PORT}`);
    console.log('\n📱 Celular (Controle):');
    const ips = getLocalIPs();
    ips.forEach(ip => {
        console.log(`   http://${ip}:${PORT}/controller.html`);
    });
    console.log('\n⚠️  ATENÇÃO:');
    console.log('   - O tablet DEVE estar na mesma rede Wi-Fi que o PC');
    console.log('   - O celular DEVE estar na mesma rede Wi-Fi que o PC');
    console.log('   - Use o IP que aparece acima para acessar no celular\n');
});