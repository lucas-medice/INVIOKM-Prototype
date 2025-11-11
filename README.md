# 🚗 INVIOKM - Sistema de Controle de Quilometragem

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

## 📁 Estrutura do Projeto
