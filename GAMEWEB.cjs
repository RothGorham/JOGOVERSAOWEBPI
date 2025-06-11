const express = require('express'); 
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf'); 
// Removendo a importação do módulo Pergunta que não existe
// const Pergunta = require('./models/Pergunta'); 


const app = express();
const port = 3000;

// Configuração do Telegram com Telegraf
const TELEGRAM_TOKEN = '7924764671:AAF0-GAy21U1yLIG7fVJoMODMrz9LrkmRgk';
const CHAT_ID = '694857164';
const bot = new Telegraf(TELEGRAM_TOKEN);

// Função melhorada para enviar mensagens ao Telegram com garantia de entrega
const sendTelegramMessage = async (chatId, message) => {
  return new Promise((resolve, reject) => {
    try {
      bot.telegram.sendMessage(chatId, message)
        .then(() => {
          console.log(`✅ Mensagem enviada para Telegram: ${message}`);
          resolve(true);
        })
        .catch(error => {
          console.error(`❌ Erro ao enviar mensagem para Telegram: ${error.message}`);
          reject(error);
        });
    } catch (error) {
      console.error(`❌ Erro ao tentar enviar mensagem para Telegram: ${error.message}`);
      reject(error);
    }
  });
};

// Middleware
app.use(cors());
app.use(express.json());

// Variáveis de controle
let perguntas = [];
let perguntasUsadas = [];
let serverStartTime = new Date();
let isServerHealthy = true;

// Contador de resets de perguntas usadas
let resetCounter = 0;

const OPENROUTER_API_KEY = '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';

// Configuração global para requisições ao OpenRouter
const openRouterConfig = {
  model: 'meta-llama/llama-4-maverick',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost',
    'X-Title': 'SeuProjetoRoblox'
  },
  timeout: 60000 // 60 segundos para dar chance à IA responder
};

// Verificar se a chave da API está definida e válida
const isValidOpenRouterKey = () => {
  return OPENROUTER_API_KEY && OPENROUTER_API_KEY.startsWith('sk-or-') && OPENROUTER_API_KEY.length > 30;
};

// Definir o schema para estatísticas
const estatSub = new mongoose.Schema({
    saldo: Number,
    acertos: Number,
    erros: Number,
    ajudas: Number,
    pulos: Number,
    universitarios: Number, // NOVO: Adicionado campo para universitários
    totalGanho: Number,
    gastoErro: Number,
    gastoAjuda: Number,
    gastoPulo: Number,
    gastoUniversitarios: Number, // NOVO: Adicionado campo para gasto com universitários
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Definir o schema para usuários
const usuarioSchema = new mongoose.Schema({
    nome: String,
    cpf: String,
    senha: String,
    estatisticas: [estatSub],
    dataCadastro: Date
}, { collection: "usuarios" });

// Definir o schema para perguntas
const perguntaSchema = new mongoose.Schema({
    pergunta: String,
    correta: String,
    alternativas: { type: [String], default: [] }, // Array de alternativas
    nivel: { type: String, enum: ['facil', 'medio', 'dificil'], default: 'facil' },
    materia: { type: String, default: 'matematica' },
    modo: { type: String, default: 'normal' },
    __v: { type: Number, default: 0 }
}, { collection: "GAME" });

// Conexões com MongoDB - IMPORTANTE: Usar conexões separadas
const alunosConnection = mongoose.createConnection('mongodb+srv://24950092:W7e3HGBYuh1X5jps@game.c3vnt2d.mongodb.net/ALUNOS?retryWrites=true&w=majority&appName=GAME', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const perguntasConnection = mongoose.createConnection('mongodb+srv://24950092:W7e3HGBYuh1X5jps@game.c3vnt2d.mongodb.net/PERGUNTAS?retryWrites=true&w=majority&appName=GAME', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Definir o modelo Pergunta
const Pergunta = perguntasConnection.model('Pergunta', perguntaSchema);

// Modelos com as conexões corretas
// Não redefinir Pergunta pois já foi importado
const Usuario = alunosConnection.model('Usuario', usuarioSchema);
// Não redefinir Aluno pois já foi importado
const Aluno = alunosConnection.model('Aluno', usuarioSchema);

// Tratamento de erros global
process.on('uncaughtException', async (error) => {
  isServerHealthy = false;
  const errorMsg = `⚠️ ERRO CRÍTICO: O servidor encontrou um erro não tratado: ${error.message}`;
  console.error(errorMsg, error.stack);
  
  try {
    await sendTelegramMessage(CHAT_ID, errorMsg);
    console.log("Notificação de erro crítico enviada.");
  } catch (err) {
    console.error("Falha ao enviar notificação de erro crítico:", err);
  }
  
  // Aguarda 5 segundos para garantir que a mensagem seja enviada antes de encerrar
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

process.on('unhandledRejection', async (reason, promise) => {
  const errorMsg = `⚠️ AVISO: Promessa rejeitada não tratada: ${reason}`;
  console.error(errorMsg);
  
  try {
    await sendTelegramMessage(CHAT_ID, errorMsg);
  } catch (err) {
    console.error("Falha ao enviar notificação de promessa rejeitada:", err);
  }
});

// Verificação de saúde do servidor a cada 5 minutos
const monitorServerHealth = () => {
  setInterval(async () => {
    try {
      // Verificar conexão com MongoDB
      const isMongoConnected = mongoose.connection.readyState === 1;
      if (!isMongoConnected && isServerHealthy) {
        isServerHealthy = false;
        await sendTelegramMessage(CHAT_ID, "❌ ALERTA: Conexão com MongoDB perdida!");
      } else if (isMongoConnected && !isServerHealthy) {
        isServerHealthy = true;
        await sendTelegramMessage(CHAT_ID, "✅ INFO: Conexão com MongoDB restaurada!");
      }
      
      // Verificar uso de memória
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = Math.round(memoryUsage.rss / 1024 / 1024);
      if (memoryUsageMB > 500) { // Alerta se usar mais de 500MB
        await sendTelegramMessage(CHAT_ID, `⚠️ ALERTA: Uso de memória alto (${memoryUsageMB}MB)!`);
      }
      
      // Calcular tempo de atividade
      const uptime = Math.floor((new Date() - serverStartTime) / 1000 / 60 / 60); // em horas
      if (uptime % 24 === 0 && uptime > 0) { // Notificar a cada 24 horas
        await sendTelegramMessage(CHAT_ID, `📊 INFO: Servidor ativo há ${uptime} horas.`);
      }
    } catch (err) {
      console.error("❌ Erro no monitoramento de saúde:", err);
      try {
        await sendTelegramMessage(CHAT_ID, `❌ Erro no monitor de saúde: ${err.message}`);
      } catch (telegramErr) {
        console.error("Falha ao enviar notificação de erro de monitoramento:", telegramErr);
      }
    }
  }, 300000); // 5 minutos = 300000ms
};

// Conexão com MongoDB
mongoose.connect('mongodb+srv://24950092:W7e3HGBYuh1X5jps@game.c3vnt2d.mongodb.net/PERGUNTAS?retryWrites=true&w=majority&appName=GAME', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("✅ Conectado ao MongoDB com sucesso!");
  try {
    await sendTelegramMessage(CHAT_ID, "✅ Servidor iniciado e conectado ao MongoDB com sucesso!");
    isServerHealthy = true;

    perguntasUsadas = [];
    perguntas = [];

    const todas = await Pergunta.find();
    console.log(`📚 Total de perguntas no banco: ${todas.length}`);
    await sendTelegramMessage(CHAT_ID, `📚 Total de perguntas no banco: ${todas.length}`);
    
    // Contar e enviar o número de alunos no banco de dados
    try {
      const totalAlunos = await Aluno.countDocuments();
      await sendTelegramMessage(CHAT_ID, `👥 Total de alunos no banco: ${totalAlunos}`);
      console.log(`👥 Total de alunos no banco: ${totalAlunos}`);
    } catch (err) {
      console.error("❌ Erro ao contar alunos:", err);
      await sendTelegramMessage(CHAT_ID, `❌ Erro ao contar alunos: ${err.message}`);
    }
    
    console.log("🔁 Perguntas usadas resetadas no início do servidor.");
    
    // Iniciar monitoramento de saúde após conexão bem-sucedida
    monitorServerHealth();
  } catch (err) {
    console.error("❌ Erro ao inicializar servidor:", err);
    console.error("❌ Erro ao buscar perguntas:", err);
    try {
      await sendTelegramMessage(CHAT_ID, `❌ Erro ao buscar perguntas: ${err.message}`);
    } catch (telegramErr) {
      console.error("Falha ao enviar notificação de erro inicial:", telegramErr);
    }
  }
})
.catch(async err => {
  console.error("❌ Erro ao conectar com o MongoDB:", err);
  try {
    await sendTelegramMessage(CHAT_ID, `❌ CRÍTICO: Erro ao conectar com o MongoDB: ${err.message}`);
  } catch (telegramErr) {
    console.error("Falha ao enviar notificação de erro de conexão:", telegramErr);
  }
  isServerHealthy = false;
  
  // Tentar reconectar após 30 segundos
  setTimeout(() => {
    console.log("🔄 Tentando reconectar ao MongoDB...");
    mongoose.connect('mongodb+srv://24950092:W7e3HGBYuh1X5jps@game.c3vnt2d.mongodb.net/PERGUNTAS?retryWrites=true&w=majority&appName=GAME', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(async reconnectErr => {
      console.error("❌ Falha na reconexão:", reconnectErr);
      try {
        await sendTelegramMessage(CHAT_ID, `❌ CRÍTICO: Falha na reconexão: ${reconnectErr.message}`);
      } catch (telegramErr) {
        console.error("Falha ao enviar notificação de erro de reconexão:", telegramErr);
      }
      process.exit(1); // Encerrar após falha na reconexão
    });
  }, 30000);
});

// Middleware para registrar requisições e capturar erros
app.use((req, res, next) => {
  const start = Date.now();
  
  // Quando a resposta terminar
  res.on('finish', () => {
    const duration = Date.now() - start;
    const durationMinutes = (duration / 60000).toFixed(2); // Converter para minutos com 2 casas decimais
    const log = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMinutes} minutos`;
    
    // Registrar requisições lentas (mais de 5 segundos = 0.083 minutos)
    if (duration > 5000) {
      console.warn(`⚠️ Requisição lenta: ${log}`);
      sendTelegramMessage(CHAT_ID, `⚠️ Requisição lenta detectada: ${log}`).catch(console.error);
    }
  });
  
  next();
});

// Sorteia uma pergunta com base no nível e matéria selecionados
app.get('/pergunta', async (req, res) => {
  try {
    const { nivel, materia } = req.query;
    
    // Construir o filtro de busca com base nos parâmetros recebidos
    const filtro = {};
    
    // Adicionar filtro de nível se fornecido
    if (nivel && ['facil', 'medio', 'dificil'].includes(nivel.toString())) {
      filtro.nivel = nivel.toString();
    }
    
    // Adicionar filtro de matéria se fornecido
    if (materia) {
      filtro.materia = materia.toString();
    }
    
    // Buscar perguntas com os filtros aplicados
    const todas = await Pergunta.find(filtro);
    const naoUsadas = todas.filter(p => !perguntasUsadas.includes(p._id.toString()));

    if (!naoUsadas.length) {
      // Se não houver perguntas com os filtros, tentar buscar sem filtros
      if (Object.keys(filtro).length > 0) {
        const todasSemFiltro = await Pergunta.find({});
        const naoUsadasSemFiltro = todasSemFiltro.filter(p => !perguntasUsadas.includes(p._id.toString()));
        
        if (naoUsadasSemFiltro.length > 0) {
          return res.status(404).json({ 
            erro: `Não há mais perguntas disponíveis para ${nivel || 'nível'} e ${materia || 'matéria'}. Tente outras opções.`,
            semFiltro: true
          });
        }
      }
      
      return res.status(404).json({ 
        erro: 'Todas as perguntas já foram usadas. Reinicie a partida.',
        gameOver: true
      });
    }

    const sorteada = naoUsadas[Math.floor(Math.random() * naoUsadas.length)];

    // Gerar alternativas se não existirem no banco de dados
    let alternativas = [];
    
    if (sorteada.alternativas && sorteada.alternativas.length >= 5) {
      // Se já existem pelo menos 5 alternativas no banco, use-as
      alternativas = sorteada.alternativas;
    } else {
      // Caso contrário, gere alternativas baseadas no contexto da pergunta
      // Extrair números da pergunta para criar alternativas mais relevantes
      const numeros = sorteada.pergunta.match(/\d+/g) || [];
      const correta = sorteada.correta;
      
      // Tentar gerar alternativas baseadas em números encontrados na pergunta
      if (numeros.length > 0 && !isNaN(Number(correta))) {
        // Se a pergunta contém números e a resposta correta é um número
        const corretaNum = Number(correta);
        alternativas = [
          correta,
          String(corretaNum + 1),
          String(corretaNum - 1),
          String(corretaNum * 2),
          String(Math.max(1, corretaNum - 2))
        ];
      } else {
        // Alternativas genéricas para outros tipos de perguntas
        alternativas = [
          correta,
          correta === "2" ? "3" : "2", // Alternativa comum para matemática
          correta === "Verdadeiro" ? "Falso" : "Verdadeiro", // Para perguntas de V ou F
          `${correta} + 1`, // Variação da resposta correta
          `Nenhuma das alternativas` // Opção padrão
        ];
      }
      
      // Embaralhar as alternativas para que a correta não esteja sempre na mesma posição
      alternativas = alternativas.sort(() => Math.random() - 0.5);
    }
    
    // Adicionar o ID da pergunta sorteada à lista de perguntas usadas
    perguntasUsadas.push(sorteada._id.toString());
    
    perguntas = [
      {
        id: sorteada._id.toString(),
        pergunta: sorteada.pergunta,
        correta: sorteada.correta,
        alternativas: alternativas,
        nivel: sorteada.nivel || 'facil',
        materia: sorteada.materia || 'matematica',
        modo: sorteada.modo || 'normal'
      }
    ];
    
    console.log(`Pergunta adicionada às usadas. Total de perguntas usadas: ${perguntasUsadas.length}`);

    // Enviar resposta automaticamente para o Telegram
    await sendTelegramMessage(CHAT_ID, `📝 NOVA PERGUNTA (${sorteada.nivel || 'facil'}, ${sorteada.materia || 'matematica'}): "${sorteada.pergunta}"
🔑 RESPOSTA: "${sorteada.correta}"`);

    res.json(perguntas[0]);
  } catch (err) {
    console.error("❌ Erro ao buscar pergunta:", err.message);
    sendTelegramMessage(CHAT_ID, `❌ Erro ao buscar pergunta: ${err.message}`).catch(console.error);
    res.status(500).json({ erro: "Erro ao buscar pergunta." });
  }
});

// Verifica a resposta - Modificado para usar apenas a IA
app.post('/resposta', async (req, res) => {
  const { resposta, id } = req.body;

  if (!perguntas.length) {
    return res.status(404).json({ correta: false, erro: "Nenhuma pergunta ativa." });
  }

  const pergunta = perguntas[0];

// Usar apenas a IA para verificação de respostas
const prompt = `
Pergunta: "${pergunta.pergunta}"
Resposta correta esperada: "${pergunta.correta}"
Resposta do jogador: "${resposta}"

Sua tarefa é verificar se a resposta do jogador está correta.

Regras:
- Se o significado da resposta do jogador for equivalente à resposta correta, mesmo com erros de acentuação ou pontuação, CONSIDERE CORRETO.
- Se a resposta for um palavrão, ofensa, resposta vazia, ou fora de contexto (ex: "fodase", "sei lá", "não sei"), CONSIDERE ERRADO.
- Seja rigoroso: respostas que não demonstrem tentativa real de responder devem ser consideradas ERRADAS.

IMPORTANTE:
Responda apenas com: true (se estiver correta) ou false (se estiver incorreta).
NÃO escreva mais nada além de true ou false.
`;

  // Criar uma flag para notificar lentidão
  let notificadoLentidao = false;

  // Timer para detectar lentidão (40 segundos)
  const lentidaoTimer = setTimeout(() => {
    notificadoLentidao = true;
    // Envia resposta ao cliente avisando sobre a lentidão
    res.json({ 
      aviso: "Estamos processando sua resposta. A IA está demorando mais que o normal, por favor aguarde...",
      processando: true 
    });
    
    // Registra no console e notifica via Telegram
    console.warn("⚠️ IA demorando mais de 40 segundos para processar resposta!");
    sendTelegramMessage(CHAT_ID, `⚠️ ALERTA: IA demorando mais de 40 segundos para processar resposta!`).catch(console.error);
  }, 40000);

  try {
      console.log("🔍 Tentando gerar dica com OpenRouter API...");
      
      const completion = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: openRouterConfig.model,
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: openRouterConfig.headers,
        timeout: openRouterConfig.timeout
      });
    
    // Limpa o timer de lentidão
    clearTimeout(lentidaoTimer);
    
    // Se já enviamos resposta de lentidão, não enviar nova resposta
    if (notificadoLentidao) {
      return;
    }
    
    const dica = completion.data?.choices?.[0]?.message?.content?.trim();
    
    console.log("✅ Dica gerada com sucesso:", dica);
    
    // Enviar dica para o Telegram
    await sendTelegramMessage(CHAT_ID, `💡 DICA SOLICITADA: "${dica}"`);

    // Enviar a resposta para o cliente com cabeçalhos explícitos
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ dica }));
  } catch (error) {
    console.error("❌ Erro ao gerar dica:", error.message);
    sendTelegramMessage(CHAT_ID, `❌ Erro ao gerar dica: ${error.message}`).catch(console.error);
    
    // Definir o tipo de conteúdo como JSON
    res.setHeader('Content-Type', 'application/json');
    // Retornar uma dica genérica em caso de erro como JSON válido
    res.send(JSON.stringify({ 
      dica: "Olha só, não enrola! Analisa essas alternativas direito e elimina as que são obviamente erradas!",
      erro_interno: true
    }));
  }
});

// Gera dica útil usando a IA
app.get('/dica', async (req, res) => {
  if (!perguntas.length) {
    return res.status(404).json({ erro: "Nenhuma pergunta ativa para gerar dica." });
  }

  const pergunta = perguntas[0];
  console.log("🎓 Gerando dica dos universitários para a pergunta:", pergunta.pergunta);

  const prompt = `
A pergunta é: "${pergunta.pergunta}"
A resposta correta é: "${pergunta.correta}"

Crie uma dica que ajude o jogador a encontrar a resposta correta. Porém seja o mais grosso possível, ofenda o jogador, tire sarro da cara dele. A dica deve ter no máximo 2 frases e ser muito grosseira.

Atenção:
- NÃO revele a resposta.
- A dica deve ter no máximo 2 frases.
- Seja Muito Grosso com o jogador.
- Nunca fale a mesma dica duas vezes seguidas.

Responda apenas com a dica.
`;

  try {
    console.log("🔍 Enviando requisição para OpenRouter API...");
    
    const completion = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'SeuProjetoRoblox'
      },
      timeout: 10000 // Timeout de 10 segundos para a requisição
    });

    const dica = completion.data?.choices?.[0]?.message?.content?.trim();
    console.log("✅ Dica gerada com sucesso:", dica);

    // Enviar a dica para o Telegram
    await sendTelegramMessage(CHAT_ID, `💡 DICA SOLICITADA: "${dica}"`);

    // Enviar a resposta para o cliente com cabeçalhos explícitos
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ dica }));
  } catch (error) {
    console.error("❌ Erro ao gerar dica com IA:", error.message);
    
    // Enviar mensagem de erro para o Telegram
    await sendTelegramMessage(CHAT_ID, `❌ Erro ao gerar dica com IA: ${error.message}`);

    // Fornecer uma dica genérica em caso de erro
    const dicaGenerica = "Você é tão burro que nem consegue responder isso? Use esse cérebro de minhoca pelo menos uma vez na vida!";
    
    // Enviar a resposta para o cliente com cabeçalhos explícitos
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ dica: dicaGenerica }));
  }
});

// NOVA ROTA: Gera alternativas para o comando "universitarios!"
app.get('/alternativas', async (req, res) => {
  try {
    const { id } = req.query;
    
    // Verificar se há uma pergunta ativa
    if (!perguntas.length) {
      return res.status(404).json({ 
        erro: "Nenhuma pergunta ativa para gerar alternativas.",
        mensagem: "Pergunta muito simples, pedido negado, tente mais tarde" 
      });
    }

    const pergunta = perguntas[0];
    
    // Verificar se a pergunta é muito simples (menos de 15 caracteres)
    if (pergunta.pergunta.length < 15 || pergunta.correta.length < 3) {
      await sendTelegramMessage(CHAT_ID, `🎓 UNIVERSITÁRIOS: Pergunta muito simples, pedido negado: "${pergunta.pergunta}"`);
      return res.json({ 
        mensagem: "Pergunta muito simples, pedido negado, tente mais tarde" 
      });
    }

    const prompt = `
Pergunta: "${pergunta.pergunta}"
Resposta correta: "${pergunta.correta}"

Gere exatamente 5 alternativas para a pergunta: "${pergunta.pergunta}"

REGRAS OBRIGATÓRIAS:
- A alternativa correta é: "${pergunta.correta}" (ela deve aparecer exatamente como está aqui)
- As 4 alternativas erradas devem ser plausíveis (sem absurdos), mas claramente incorretas
- Todas as alternativas devem ser curtas e diretas (no máximo uma linha cada)
- Todas as alternativas devem ter o mesmo estilo de escrita da correta
- Não numere, não adicione marcadores, não destaque, nem indique qual é a correta
- Embaralhe a ordem, colocando a alternativa correta em uma posição aleatória

⚠️ Atenção:
- Retorne apenas o texto das 5 alternativas, uma por linha, sem explicações ou comentários
- Se ocorrer erro ou não souber gerar corretamente, responda apenas: "Erro: pergunta muito simples, pedido negado, tente novamente mais tarde."

`;

    // Criar uma flag para notificar lentidão
    let notificadoLentidao = false;

    // Timer para detectar lentidão (40 segundos)
    const lentidaoTimer = setTimeout(() => {
      notificadoLentidao = true;
      // Envia resposta ao cliente avisando sobre a lentidão
      res.json({ 
        aviso: "Estamos consultando os universitários. A IA está demorando mais que o normal, por favor aguarde...",
        processando: true 
      });
      
      // Registra no console e notifica via Telegram
      console.warn("⚠️ IA demorando mais de 40 segundos para gerar alternativas!");
      sendTelegramMessage(CHAT_ID, `⚠️ ALERTA: IA demorando mais de 40 segundos para gerar alternativas!`).catch(console.error);
    }, 40000);

    try {
      const completion = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'SeuProjetoRoblox'
        },
        timeout: 60000 // Aumentado para 60 segundos para dar chance à IA responder
      });

      // Limpa o timer de lentidão
      clearTimeout(lentidaoTimer);

      // Se já enviamos resposta de lentidão, não enviar nova resposta
      if (notificadoLentidao) {
        return;
      }

      // Processar a resposta da IA
      const texto = completion.data?.choices?.[0]?.message?.content?.trim() || '';
      
      // Dividir o texto em linhas e limpar
      let alternativas = texto.split('\n')
        .map(alt => alt.trim())
        .filter(alt => alt.length > 0);
      
      // Se a resposta da IA não for adequada, gerar alternativas manualmente
      if (alternativas.length < 5) {
        // Resetar as alternativas e usar o método de geração manual
        alternativas = [pergunta.correta];
        
        // Gerar 4 alternativas adicionais mais realistas baseadas no contexto da pergunta
        let opcoesAdicionais = [];
        
        // Verificar se a pergunta é sobre matemática
        if (pergunta.materia && pergunta.materia.toLowerCase() === 'matematica') {
          opcoesAdicionais = [
            `${parseInt(pergunta.correta) + 2}`,
            `${parseInt(pergunta.correta) - 2}`,
            `${parseInt(pergunta.correta) * 2}`,
            `${parseInt(pergunta.correta) / 2}`,
            `${parseInt(pergunta.correta) + 10}`,
            `${parseInt(pergunta.correta) - 10}`,
            `${parseInt(pergunta.correta) + 5}`,
            `${parseInt(pergunta.correta) - 5}`
          ];
        } else {
          // Para outros tipos de perguntas, usar alternativas genéricas mais realistas
          opcoesAdicionais = [
            pergunta.correta.length > 5 ? pergunta.correta.substring(0, pergunta.correta.length - 3) + '...' : 'Alternativa incorreta 1',
            pergunta.correta + ' (incorreto)',
            'Não é possível determinar',
            'Nenhuma das alternativas',
            'Todas as alternativas',
            pergunta.correta.split('').reverse().join(''),
            pergunta.correta.toUpperCase(),
            pergunta.correta.toLowerCase()
          ];
        }
        
        // Filtrar alternativas que são iguais à resposta correta
        opcoesAdicionais = opcoesAdicionais.filter(opcao => opcao !== pergunta.correta);
        
        // Selecionar 4 alternativas aleatórias das opções adicionais
        while (alternativas.length < 5 && opcoesAdicionais.length > 0) {
          const indiceAleatorio = Math.floor(Math.random() * opcoesAdicionais.length);
          const alternativaAleatoria = opcoesAdicionais.splice(indiceAleatorio, 1)[0];
          alternativas.push(alternativaAleatoria);
        }
      } else if (alternativas.length > 5) {
        // Se temos mais de 5, pegar apenas as primeiras 5
        alternativas = alternativas.slice(0, 5);
      }
      
      // Verificar se a resposta correta está entre as alternativas
      if (!alternativas.some(alt => alt.toLowerCase().includes(pergunta.correta.toLowerCase()))) {
        // Se não estiver, substituir uma das alternativas pela resposta correta
        const randomIndex = Math.floor(Math.random() * 5);
        alternativas[randomIndex] = pergunta.correta;
      }
      
      // Embaralhar as alternativas para que a resposta correta não esteja sempre na mesma posição
      alternativas = alternativas.sort(() => Math.random() - 0.5);
      
      // Enviar alternativas para o Telegram
      await sendTelegramMessage(CHAT_ID, `🎓 UNIVERSITÁRIOS SOLICITADOS:\nPergunta: "${pergunta.pergunta}"\nAlternativas: ${alternativas.join(' | ')}`);
      
      return res.json({ alternativas });

    } catch (error) {
      // Limpa o timer de lentidão
      clearTimeout(lentidaoTimer);
      
      // Se já enviamos resposta de lentidão, não enviar nova resposta de erro
      if (notificadoLentidao) {
        return;
      }
      
      console.error("❌ Erro ao gerar alternativas:", error.message);
      sendTelegramMessage(CHAT_ID, `❌ Erro ao gerar alternativas: ${error.message}`).catch(console.error);
      
      return res.status(500).json({ 
        erro: "Erro ao gerar alternativas.",
        mensagem: "Pergunta muito simples, pedido negado, tente mais tarde" 
      });
    }
  } catch (err) {
    console.error("❌ Erro na rota de alternativas:", err.message);
    sendTelegramMessage(CHAT_ID, `❌ Erro na rota de alternativas: ${err.message}`).catch(console.error);
    
    return res.status(500).json({ 
      erro: "Erro ao processar solicitação.",
      mensagem: "Pergunta muito simples, pedido negado, tente mais tarde" 
    });
  }
});

// Rota protegida por senha para visualizar a resposta atual
app.get('/admin/resposta', async (req, res) => {
  const { senha } = req.query;
  
  // Senha simples para proteger a rota
  if (senha !== 'admin123') {
    return res.status(401).json({ erro: 'Acesso negado. Senha incorreta.' });
  }
  
  if (!perguntas.length) {
    return res.status(404).json({ erro: "Nenhuma pergunta ativa." });
  }
  
  try {
    await sendTelegramMessage(CHAT_ID, `⚠️ ALERTA: Alguém acessou a resposta via painel admin!`);
    
    res.json({
      pergunta: perguntas[0].pergunta,
      resposta: perguntas[0].correta
    });
  } catch (err) {
    console.error("❌ Erro ao acessar resposta:", err.message);
    res.status(500).json({ erro: "Erro ao acessar resposta." });
  }
});

// Reinicia o jogo
app.post('/reiniciar', async (req, res) => {
  perguntasUsadas = [];
  perguntas = [];

  const todas = await Pergunta.find();
  console.log("♻️ Perguntas reiniciadas manualmente.");
  try {
    await sendTelegramMessage(CHAT_ID, `♻️ Jogo reiniciado manualmente. Perguntas disponíveis: ${todas.length}`);
  } catch (err) {
    console.error("Falha ao enviar notificação de reinício manual:", err);
  }

  res.json({ mensagem: 'Partida reiniciada. Perguntas liberadas novamente.' });
});

// Status do jogo
app.get('/status', async (req, res) => {
  try {
    const total = await Pergunta.countDocuments();
    const usadas = perguntasUsadas.length;
    const restantes = total - usadas;
    
    // Adicionar informações de saúde do servidor
    const uptime = Math.floor((new Date() - serverStartTime) / 1000 / 60); // em minutos
    const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024); // em MB

    // Contar alunos no banco de dados
    const totalAlunos = await Aluno.countDocuments();

    try {
      await sendTelegramMessage(CHAT_ID, `📊 STATUS: ${usadas}/${total} perguntas usadas. Restantes: ${restantes}. Total de alunos: ${totalAlunos}`);
    } catch (err) {
      console.error("Falha ao enviar notificação de status:", err);
    }

    res.json({
      totalPerguntas: total,
      perguntasUsadas: usadas,
      perguntasRestantes: restantes,
      totalAlunos: totalAlunos,
      serverHealth: {
        uptime: `${uptime} minutos`,
        memory: `${memoryUsage} MB`,
        mongoConnection: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
      }
    });
  } catch (err) {
    console.error("❌ Erro ao obter status:", err.message);
    sendTelegramMessage(CHAT_ID, `❌ Erro ao obter status: ${err.message}`).catch(console.error);
    res.status(500).json({ erro: "Erro ao obter status." });
  }
});

// Rota simples para verificação de saúde
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  if (mongoStatus === 'connected' && isServerHealthy) {
    res.status(200).json({ 
      status: 'ok',
      uptime: `${Math.floor((new Date() - serverStartTime) / 1000 / 60)} minutos`,
      mongo: mongoStatus,
      perguntasAtivas: perguntas.length,
      perguntasUsadas: perguntasUsadas.length,
      resetCounter: resetCounter
    });
  } else {
    res.status(503).json({ 
      status: 'unhealthy',
      uptime: `${Math.floor((new Date() - serverStartTime) / 1000 / 60)} minutos`,
      mongo: mongoStatus,
      perguntasAtivas: perguntas.length,
      perguntasUsadas: perguntasUsadas.length,
      resetCounter: resetCounter
    });
  }
});

// Rota para resetar a lista de perguntas usadas
app.post('/reset-perguntas-usadas', (req, res) => {
  try {
    // Salvar o tamanho anterior para log
    const tamanhoAnterior = perguntasUsadas.length;
    
    // Limpar a lista de perguntas usadas
    perguntasUsadas = [];
    resetCounter++;
    
    // Enviar mensagem para o Telegram
    sendTelegramMessage(CHAT_ID, `🔄 Lista de perguntas usadas foi resetada. Tamanho anterior: ${tamanhoAnterior}. Reset #${resetCounter}`).catch(console.error);
    
    console.log(`🔄 Lista de perguntas usadas foi resetada. Tamanho anterior: ${tamanhoAnterior}. Reset #${resetCounter}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Lista de perguntas usadas resetada com sucesso',
      tamanhoAnterior: tamanhoAnterior,
      resetCounter: resetCounter
    });
  } catch (err) {
    console.error("❌ Erro ao resetar lista de perguntas usadas:", err.message);
    sendTelegramMessage(CHAT_ID, `❌ Erro ao resetar lista de perguntas usadas: ${err.message}`).catch(console.error);
    res.status(500).json({ erro: "Erro ao resetar lista de perguntas usadas." });
  }
});

// Rota para salvar estatísticas
app.post('/salvar-estatisticas', async (req, res) => {
    try {
        const { cpf, senha, estatisticas } = req.body;
        
        // Validações básicas
        if (!cpf || !senha) {
            return res.status(400).json({ 
                ok: false, 
                msg: "CPF ou senha faltando",
                mensagem: "❌ CPF ou senha faltando" 
            });
        }
        if (!estatisticas) {
            return res.status(400).json({ 
                ok: false, 
                msg: "Sem estatísticas",
                mensagem: "❌ Sem estatísticas para salvar" 
            });
        }

        // Normalizar o CPF (remover caracteres não numéricos)
        const cpfNormalizado = cpf.toString().replace(/\D/g, '');
        
        // Verificar se o CPF tem 11 dígitos
        if (cpfNormalizado.length !== 11) {
            return res.status(400).json({ 
                ok: false, 
                msg: "CPF inválido! Digite apenas os 11 números do CPF.",
                mensagem: "❌ CPF inválido! Digite apenas os 11 números do CPF." 
            });
        }

        // Tentar buscar o usuário em ambos os modelos
        let usuario = null;
        
        // Primeiro tenta no modelo Usuario
        usuario = await Usuario.findOne({ cpf: cpfNormalizado });
        
        // Se não encontrar, tenta no modelo Aluno
        if (!usuario) {
            usuario = await Aluno.findOne({ cpf: cpfNormalizado });
        }
        
        if (!usuario) {
            console.log(`❌ CPF não encontrado: ${cpfNormalizado}`);
            return res.status(401).json({ 
                ok: false, 
                msg: "CPF não encontrado",
                mensagem: "❌ CPF não encontrado" 
            });
        }

        // Verificar senha diretamente (comparação simples)
        if (usuario.senha !== senha) {
            console.log(`❌ Senha inválida para CPF: ${cpfNormalizado}`);
            return res.status(401).json({ 
                ok: false, 
                msg: "Senha inválida",
                mensagem: "❌ Senha inválida" 
            });
        }

        // Adicionar estatísticas com a estrutura correta e valores padrão
        const novaEstatistica = {
            saldo: estatisticas.saldo || 0,
            acertos: estatisticas.acertos || 0,
            erros: estatisticas.erros || 0,
            ajudas: estatisticas.ajudas || 0,
            pulos: estatisticas.pulos || 0,
            universitarios: estatisticas.universitarios || 0, // NOVO: Campo para universitários
            totalGanho: estatisticas.totalGanho || 0,
            gastoErro: estatisticas.gastoErro || 0,
            gastoAjuda: estatisticas.gastoAjuda || 0,
            gastoPulo: estatisticas.gastoPulo || 0,
            gastoUniversitarios: estatisticas.gastoUniversitarios || 0, // NOVO: Campo para gasto com universitários
            createdAt: new Date()
        };

        // Inicializar o array de estatísticas se não existir
        if (!usuario.estatisticas) {
            usuario.estatisticas = [];
        }

        usuario.estatisticas.push(novaEstatistica);
        await usuario.save();
        
        // Notificar via Telegram
        await sendTelegramMessage(CHAT_ID, `📊 Novo registro de estatísticas salvo para ${usuario.nome || 'Usuário'} (CPF: ${cpfNormalizado})`);

        return res.json({ 
            ok: true,
            mensagem: "✅ Estatísticas salvas com sucesso!" 
        });
    } catch (err) {
        console.error("❌ Erro ao salvar estatísticas:", err);
        sendTelegramMessage(CHAT_ID, `❌ Erro ao salvar estatísticas: ${err.message}`).catch(console.error);
        return res.status(500).json({ 
            ok: false, 
            msg: err.message,
            mensagem: "❌ Erro ao salvar estatísticas. Tente novamente." 
        });
    }
});

// Tratamento de erros para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use(async (err, req, res, next) => {
  const errorMsg = `❌ Erro interno do servidor: ${err.message}`;
  console.error(errorMsg);
  
  try {
    await sendTelegramMessage(CHAT_ID, errorMsg);
  } catch (telegramErr) {
    console.error("Falha ao enviar notificação de erro interno:", telegramErr);
  }
  
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Inicia o servidor
const server = app.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  try {
    await sendTelegramMessage(CHAT_ID, `🚀 Servidor rodando em http://localhost:${port}`);
    
    // Contar e enviar o número de alunos no banco de dados
    try {
      const totalAlunos = await Aluno.countDocuments();
      await sendTelegramMessage(CHAT_ID, `👥 Total de alunos no banco: ${totalAlunos}`);
    } catch (err) {
      console.error("Falha ao enviar notificação de inicialização:", err);
    }
  } catch (err) {
    console.error("Falha ao enviar notificação de inicialização:", err);
  }
});

// Flag para evitar envios duplicados na finalização
let isShuttingDown = false;

// Tratamento para desligamento gracioso
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    console.log("Processo de desligamento já em andamento, ignorando sinal repetido.");
    return;
  }
  
  isShuttingDown = true;
  console.log(`⚠️ Sinal ${signal} recebido. Iniciando encerramento...`);
  
  try {
    // Tentar enviar a notificação primeiro
    console.log("Enviando notificação de encerramento para Telegram...");
    await sendTelegramMessage(CHAT_ID, `⚠️ Servidor sendo encerrado (sinal ${signal})`);
    console.log("✅ Notificação de encerramento enviada com sucesso!");
  } catch (err) {
    console.error("❌ Falha ao enviar notificação de encerramento:", err);
  }
  
  // Agora proceder com o encerramento
  console.log("Fechando servidor HTTP...");
  server.close(async () => {
    console.log('Servidor HTTP fechado.');
    
    // Fecha a conexão com MongoDB
    try {
      await mongoose.connection.close();
      console.log('Conexão MongoDB fechada.');
      try {
        await sendTelegramMessage(CHAT_ID, `📴 Servidor encerrado corretamente.`);
        console.log("✅ Notificação final enviada com sucesso!");
      } catch (err) {
        console.error("❌ Falha ao enviar notificação final:", err);
      }
      process.exit(0);
    } catch (err) {
      console.error('Erro ao fechar conexão MongoDB:', err);
      try {
        await sendTelegramMessage(CHAT_ID, `❌ Erro ao encerrar servidor: ${err.message}`);
      } catch (telegramErr) {
        console.error("Falha ao enviar notificação de erro de encerramento:", telegramErr);
      }
      process.exit(1);
    }
  });
  
  // Força o encerramento após 10 segundos se não conseguir desligar corretamente
  setTimeout(() => {
    console.error('Timeout de desligamento gracioso. Forçando encerramento.');
    process.exit(1);
  }, 10000);
}

// Captura sinais de encerramento de forma síncrona primeiro
process.on('SIGTERM', () => {
  console.log("SIGTERM recebido");
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log("SIGINT recebido (Ctrl+C)");
  gracefulShutdown('SIGINT');
});

// Para dar tempo de mandar a msg para o telegram depois do Ctrl+C
process.stdin.resume();