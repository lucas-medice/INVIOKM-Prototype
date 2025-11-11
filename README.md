# INVIOKM - Sistema de Controle de Quilometragem

Sistema web para controle e gestão de quilometragem de veículos, desenvolvido para otimizar o registro de saídas e chegadas de móveis durante plantões.

## ✨ Funcionalidades Principais

### 📋 Registro de Ocorrências
- **Registro de Saída**: Cadastro completo de veículos em serviço
- **Fechamento de Ocorrências**: Registro de retorno com quilometragem final
- **Edição em Tempo Real**: Clique para editar destinos e observações
- **Controle de Técnicos**: Diferenciação entre veículos comuns e técnicos

### 📊 Gestão de Dados
- **Armazenamento Local**: Dados salvos no navegador (localStorage)
- **Exportação Excel**: Geração automática de planilhas formatadas
- **Backup & Restore**: Sistema de importação/exportação de dados
- **Logs do Sistema**: Registro detalhado de todas as ações

### 🔐 Segurança e Controle
- **Login por Plantão**: Autenticação simples por nome do plantão
- **Logout Seguro**: Proteção com senha administrativa
- **Histórico por Móvel**: KM automático baseado no último registro
- **Validações**: Prevenção de erros e dados inconsistentes

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Armazenamento**: localStorage
- **Exportação**: SheetJS (xlsx)
- **Fontes**: Google Fonts (Aldrich, IBM Plex)
- **Ícones**: SVG e Emojis nativos

## 🚀 Como Usar

### Primeiro Acesso
1. Acesse `login.html`
2. Registre o nome do plantão (ex: "João e Maria")
3. Clique em "Entrar"

### Registrando uma Saída
1. Clique em **"➕ Registrar Saída"**
2. Preencha os campos:
   - Atendente responsável
   - Número do móvel (2 dígitos)
   - Destinos da ocorrência
   - KM de saída atual
3. Ative "Saída de Técnicos" se aplicável
4. Confirme para salvar

### Fechando uma Ocorrência
1. Clique em **"🔒 Fechar Ocorrência"**
2. Selecione a linha correspondente na tabela
3. Informe o KM de chegada (não pode ser menor que o de saída)
4. Adicione observações se necessário
5. Confirme para finalizar

### Exportando Dados
- **📤 Exportar**: Botão circular no footer para backup em JSON
- **📄 Ver Tabela**: Página completa com todas as ocorrências
- **Excel**: Exportação formatada com data e nome do plantão


## ⚙️ Recursos Avançados

### 🎯 Edição Rápida
- **Clique simples** em "Destinos" ou "OBS" para editar
- **Duplo clique** em outras células para apagar ocorrência

### 🔄 Sistema de Importação
- **Mesclar**: Combina dados importados com existentes
- **Sobrescrever**: Substitui todos os dados atuais

### 📈 Controle de Armazenamento
- Barra de progresso no footer
- Alertas quando o armazenamento estiver cheio
- Limpeza segura de dados

## 🛡️ Recursos de Segurança

- **Senha de Logout**: "BATMAN" (em maiúsculo)
- **Backup Automático**: Exportação em Excel antes do logout
- **Bloqueio por Tentativas**: 3 tentativas erradas bloqueiam temporariamente
- **Prevenção de Perda**: Alertas ao fechar a página com dados não salvos

## 💡 Dicas Importantes

### ✅ Boas Práticas
- Exporte dados regularmente para backup
- Feche ocorrências assim que os veículos retornarem
- Use observações para informações relevantes
- Verifique o KM de saída antes de registrar

### ❌ O Que Evitar
- Não apague dados do navegador sem exportar antes
- Não feche o navegador sem fazer logout adequado
- Não registre KM de chegada menor que o de saída

## 🔄 Atualizações Futuras

- [ ] Sincronização em nuvem
- [ ] Relatórios estatísticos
- [ ] Controle de usuários com níveis de acesso
- [ ] Integração com outros sistemas

## 👨‍💻 Desenvolvimento

**Desenvolvedor**: Lucas Medice  
**Versão**: Beta v1.6.6  
**LinkedIn**: [lucas-medice](https://www.linkedin.com/in/lucas-medice)  
**Portfólio**: [lucas-medice.github.io/portifolio-v2](https://lucas-medice.github.io/portifolio-v2)

**⚠️ Aviso**: Este sistema armazena dados localmente no navegador. Exporte regularmente para evitar perda de informações.
