// script.js

function obterDataHora() {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = String(agora.getFullYear()).slice(-2);
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
}

function exibirData() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dataFormatada = `${dia}/${mes}`;
  const dataElemento = document.getElementById('data')?.querySelector('p');
  if (dataElemento) dataElemento.textContent = dataFormatada;
}
exibirData();

const btnSaida = document.getElementById('btnSaida');
const btnChegada = document.getElementById('btnChegada');
const tabela = document.querySelector('.tabela tbody');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const form = document.getElementById('modal-form');
const cancelar = document.getElementById('cancelar');

const atendenteInput = document.getElementById('atendente');
const movelInput = document.getElementById('movel');
const destinosInput = document.getElementById('destinos');
const kmSaidaInput = document.getElementById('kmSaida');
const kmChegadaInput = document.getElementById('kmChegada');
const obsInput = document.getElementById('obs');
const tecnicoToggle = document.getElementById('tecnicoToggle');

let modo = '';
let linhaSelecionada = null;
const historicoMovel = JSON.parse(localStorage.getItem('historicoMovel')) || {};

// Função para formatar número do móvel com 2 dígitos
function formatarNumeroMovel(numero) {
  const apenasNumeros = numero.replace(/\D/g, '');

  if (apenasNumeros === '') return '';

  const doisDigitos = apenasNumeros.slice(0, 2);

  return doisDigitos.padStart(2, '0');
}


// Aplicar formatação enquanto digita
movelInput.addEventListener('input', function() {
  this.value = formatarNumeroMovel(this.value);
});

function preencherKmAutomatico() {
  const movel = formatarNumeroMovel(movelInput.value);
  if (movel && historicoMovel[movel]) {
    if (confirm(`Preencher automaticamente o KM de saída com ${historicoMovel[movel]}KM (último registro do móvel ${movel})?`)) {
      kmSaidaInput.value = historicoMovel[movel];
    }
  }
}

function abrirModal(tipo, linha = null) {
  modo = tipo;
  linhaSelecionada = linha;
  modal.style.display = 'flex';
  form.reset();

  if (tipo === 'saida') {
    modalTitle.innerText = 'Registrar Saída';
    mostrarCampos(['atendente', 'movel', 'destinos', 'kmSaida', 'tecnicoToggle']);
    ocultarCampos(['kmChegada', 'obs']);
    tecnicoToggle.checked = false;
    
    movelInput.removeEventListener('change', preencherKmAutomatico);
    movelInput.addEventListener('change', preencherKmAutomatico);
  }

  if (tipo === 'chegada') {
    if (!linha) {
      mostrarAlerta('⚠️ Clique em uma linha para fechar ocorrência.');
      fecharModal();
      return;
    }
    modalTitle.innerText = 'Fechar Ocorrência';
    mostrarCampos(['kmChegada', 'obs']);
    ocultarCampos(['atendente', 'movel', 'destinos', 'kmSaida', 'tecnicoToggle']);
    
    kmChegadaInput.value = linha.cells[5].innerText || '';
    obsInput.value = linha.cells[7].innerText || linha.getAttribute('data-observacao') || '';
  }

  if (tipo === 'editar') {
    if (!linha) {
      mostrarAlerta('⚠️ Selecione uma célula válida.');
      fecharModal();
      return;
    }
    
    const coluna = linha.coluna;
    const celula = linha.celula;
    const textoAtual = celula.innerText;
    
    if (coluna === 2) {
      modalTitle.innerText = 'Editar Destinos';
      mostrarCampos(['destinos']);
      ocultarCampos(['atendente', 'movel', 'kmSaida', 'kmChegada', 'obs', 'tecnicoToggle']);
      destinosInput.value = textoAtual;
    } 
    else if (coluna === 7) {
      modalTitle.innerText = 'Editar Observações';
      mostrarCampos(['obs']);
      ocultarCampos(['atendente', 'movel', 'destinos', 'kmSaida', 'kmChegada', 'tecnicoToggle']);
      obsInput.value = textoAtual || linhaSelecionada.getAttribute('data-observacao') || '';
    }
  }
}

function fecharModal() {
  modal.style.display = 'none';
  linhaSelecionada = null;
  document.querySelectorAll('.tabela tbody tr').forEach(tr => tr.classList.remove('selecionada'));
}

function mostrarCampos(campos) {
  campos.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.parentElement.style.display = 'block';
    }
  });
}

function ocultarCampos(campos) {
  campos.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.parentElement.style.display = 'none';
    }
  });
}

if (btnSaida) {
  btnSaida.addEventListener('click', () => abrirModal('saida'));
}

if (btnChegada) {
  btnChegada.addEventListener('click', () => {
    mostrarAlerta('👆 Clique na linha que deseja fechar ocorrência.');
    modo = 'fechar';
  });
}

cancelar.addEventListener('click', fecharModal);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (modo === 'saida') {
    const numeroMovel = formatarNumeroMovel(movelInput.value);
    const novaLinha = tabela.insertRow();
    const isTecnico = tecnicoToggle.checked;
    
    if (isTecnico) {
      novaLinha.classList.add('tecnico');
    }
    
    novaLinha.insertCell(0).innerText = atendenteInput.value;
    novaLinha.insertCell(1).innerText = numeroMovel;
    novaLinha.insertCell(2).innerText = destinosInput.value;
    novaLinha.insertCell(3).innerText = kmSaidaInput.value;
    novaLinha.insertCell(4).innerText = obterDataHora();
    novaLinha.insertCell(5).innerText = '';
    novaLinha.insertCell(6).innerText = '';
    novaLinha.insertCell(7).innerText = '';
    aplicarTooltips(novaLinha);
    salvarDadosPainel();
  }

  if (modo === 'chegada') {
    const kmSaida = parseFloat(linhaSelecionada.cells[3].innerText);
    const kmChegada = parseFloat(kmChegadaInput.value);
    const movel = formatarNumeroMovel(linhaSelecionada.cells[1].innerText);
    
    if (isNaN(kmChegada) || kmChegada < kmSaida) {
      mostrarAlerta("❌ O KM de chegada não pode ser menor que o KM de saída.");
      return;
    }

    historicoMovel[movel] = kmChegada;
    localStorage.setItem('historicoMovel', JSON.stringify(historicoMovel));

    linhaSelecionada.cells[5].innerText = kmChegada;
    linhaSelecionada.cells[6].innerText = obterDataHora();
    linhaSelecionada.cells[7].innerText = obsInput.value || '';
    linhaSelecionada.setAttribute('data-observacao', obsInput.value || '');
    salvarDadosPainel();

    const novaOcorrencia = [];
    for (let i = 0; i < 8; i++) {
      novaOcorrencia.push(linhaSelecionada.cells[i].innerText);
    }

    if (linhaSelecionada.classList.contains('tecnico')) {
      novaOcorrencia.push('Técnico');
    } else {
      novaOcorrencia.push('');
    }

    const ocorrenciasAntigas = JSON.parse(localStorage.getItem('tabelaBackup')) || [];
    ocorrenciasAntigas.push(novaOcorrencia);
    localStorage.setItem('tabelaBackup', JSON.stringify(ocorrenciasAntigas));
  }

  if (modo === 'editar') {
    const coluna = linhaSelecionada.coluna;
    const celula = linhaSelecionada.celula;
    
    if (coluna === 2) {
      celula.innerText = destinosInput.value;
    } else if (coluna === 7) {
      celula.innerText = obsInput.value;
      linhaSelecionada.setAttribute('data-observacao', obsInput.value || '');
    }
    
    salvarDadosPainel();
  }

  fecharModal();
});

function aplicarTooltips(linha) {
  linha.cells[2].setAttribute('title', 'Clique para editar destinos');
  linha.cells[7].setAttribute('title', 'Clique para editar observações');
  
  // Adicionar tooltip para duplo clique nas outras células
  for (let i = 0; i < linha.cells.length; i++) {
    if (i !== 2 && i !== 7) {
      linha.cells[i].setAttribute('title', 'Duplo clique para apagar');
    }
  }
}

// Evento de clique simples
tabela.addEventListener('click', function (e) {
  const alvo = e.target;

  if (alvo.tagName !== 'TD') return;

  const linha = alvo.closest('tr');
  if (!linha) return;

  // Adiciona efeito de pulso
  linha.classList.add('efeito-clique');
  setTimeout(() => linha.classList.remove('efeito-clique'), 500);

  // Remove seleção anterior
  document.querySelectorAll('.tabela tbody tr').forEach(tr => {
    tr.classList.remove('selecionada');
  });

  // Adiciona nova seleção
  linha.classList.add('selecionada');

  if (modo === 'fechar') {
    abrirModal('chegada', linha);
    return;
  }

  const coluna = alvo.cellIndex;
  if (coluna === 2 || coluna === 7) {
    abrirModal('editar', { celula: alvo, coluna, linha });
  }
});

// Evento de duplo clique para apagar
tabela.addEventListener('dblclick', function (e) {
  const alvo = e.target;
  
  if (alvo.tagName !== 'TD') return;
  
  const linha = alvo.closest('tr');
  if (!linha) return;
  
  
  // Confirmação antes de apagar
  if (confirm('Tem certeza que deseja apagar esta ocorrência?')) {
    linha.remove();
    salvarDadosPainel();
    mostrarAlerta('Ocorrência removida com sucesso!');
  }
});

function salvarDadosPainel() {
  const dados = [];
  for (let linha of tabela.rows) {
    const row = [];
    for (let i = 0; i < linha.cells.length; i++) {
      // Formatar o número do móvel (célula 1) antes de salvar
      row.push(i === 1 ? formatarNumeroMovel(linha.cells[i].innerText) : linha.cells[i].innerText);
    }
    row.push(linha.classList.contains('tecnico') ? 'Técnico' : '');
    dados.push(row);
  }
  localStorage.setItem('tabelaKM', JSON.stringify(dados));
  
  const plantao = localStorage.getItem('plantao') || '';
  localStorage.setItem('plantaoAtual', plantao);
}

function carregarDados() {
  const dados = JSON.parse(localStorage.getItem('tabelaKM'));
  const historico = JSON.parse(localStorage.getItem('historicoMovel')) || {};
  
  Object.assign(historicoMovel, historico);

  if (dados) {
    dados.forEach(row => {
      const novaLinha = tabela.insertRow();
      for (let i = 0; i < 8; i++) {
        const celula = novaLinha.insertCell();
        // Formatar o número do móvel (célula 1) se existir
        celula.innerText = i === 1 && row[i] ? formatarNumeroMovel(row[i]) : (row[i] || '');
      }
      if (row.length > 8 && row[8] === 'Técnico') {
        novaLinha.classList.add('tecnico');
      }
      aplicarTooltips(novaLinha);
    });
  }
  
  // Atualizar tooltips para duplo clique
  atualizarTooltips();
}
carregarDados();

function mostrarAlerta(mensagem) {
  const alerta = document.getElementById('alerta');
  if (!alerta) return;
  alerta.innerText = mensagem;
  alerta.style.display = 'block';
  setTimeout(() => {
    alerta.style.display = 'none';
  }, 3000);
}

window.addEventListener("beforeunload", function (e) {
  const modalAberto = modal.style.display === 'flex';
  const registrosExistem = tabela.rows.length > 0;

  if (modalAberto || registrosExistem) {
    e.preventDefault();
    e.returnValue = "Tem certeza que deseja sair? As alterações podem não estar salvas.";
  }
});

function limparDadosTabela() {
  if (confirm('Deseja realmente apagar todos os dados da tabela?')) {
    if (confirm('Isso também limpará o histórico de KMs dos móveis. Continuar?')) {
      localStorage.clear();
      location.reload();
    }
  }
}

// ========== SISTEMA DE IMPORTACAO/EXPORTACAO ========== //

function exportarDados() {
  const btn = document.getElementById('btnExportarMini');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
  btn.disabled = true;
  
  const dadosPainel = JSON.parse(localStorage.getItem('tabelaKM') || []);
  const dadosTabela = JSON.parse(localStorage.getItem('tabelaBackup') || []);
  const historicoMovel = JSON.parse(localStorage.getItem('historicoMovel') || {});
  
  const dadosExportar = {
    plantao: localStorage.getItem('plantao'),
    tabelaKM: dadosPainel,
    tabelaBackup: dadosTabela,
    historicoMovel: historicoMovel,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(dadosExportar, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `INVIOKM_${localStorage.getItem('plantao')}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  setTimeout(() => {
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
    btn.disabled = false;
    mostrarAlerta('Dados exportados com sucesso!');
  }, 1000);
}

function importarDados(jsonData, importMode = 'merge') {
  const btn = document.getElementById('btnImportarMini');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
  btn.disabled = true;
  
  try {
    if (importMode === 'overwrite') {
      // Modo sobrescrever - substitui tudo
      localStorage.setItem('tabelaKM', JSON.stringify(jsonData.tabelaKM || []));
      localStorage.setItem('tabelaBackup', JSON.stringify(jsonData.tabelaBackup || []));
      localStorage.setItem('historicoMovel', JSON.stringify(jsonData.historicoMovel || {}));
      
      if (jsonData.plantao) {
        localStorage.setItem('plantao', jsonData.plantao);
      }
    } else {
      // Modo mesclar (padrão) - combina dados
      const dadosPainelAtual = JSON.parse(localStorage.getItem('tabelaKM') || '[]');
      const dadosPainelNovo = jsonData.tabelaKM || [];
      const dadosPainelCombinados = [...dadosPainelAtual, ...dadosPainelNovo];
      localStorage.setItem('tabelaKM', JSON.stringify(dadosPainelCombinados));
      
      const dadosBackupAtual = JSON.parse(localStorage.getItem('tabelaBackup') || '[]');
      const dadosBackupNovo = jsonData.tabelaBackup || [];
      const dadosBackupCombinados = [...dadosBackupAtual, ...dadosBackupNovo];
      localStorage.setItem('tabelaBackup', JSON.stringify(dadosBackupCombinados));
      
      const historicoAtual = JSON.parse(localStorage.getItem('historicoMovel') || '{}');
      const historicoNovo = jsonData.historicoMovel || {};
      const historicoCombinado = { ...historicoAtual, ...historicoNovo };
      localStorage.setItem('historicoMovel', JSON.stringify(historicoCombinado));
    }
    
    setTimeout(() => {
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
      btn.disabled = false;
      location.reload();
      mostrarAlerta(`Dados importados com sucesso (Modo: ${importMode === 'overwrite' ? 'Sobrescrita' : 'Mesclagem'})`);
    }, 1000);
  } catch (e) {
    console.error('Erro na importação:', e);
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
    btn.disabled = false;
    mostrarAlerta('Erro ao importar dados. Verifique o arquivo.');
  }
}

// Event Listeners para Importação/Exportação
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnExportarMini')?.addEventListener('click', exportarDados);
  
  document.getElementById('btnImportarMini')?.addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  
  document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Mostrar modal de opções de importação
        const importModal = document.getElementById('importModal');
        const importOptions = document.querySelectorAll('.import-option');
        let selectedMode = 'merge';
        
        importOptions.forEach(option => {
          option.addEventListener('click', () => {
            importOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedMode = option.dataset.mode;
            
            // Fechar modal após 1 segundo e processar importação
            setTimeout(() => {
              importModal.style.display = 'none';
              if (confirm(`Confirmar importação no modo ${selectedMode === 'overwrite' ? 'SOBRESCREVER' : 'MESCLAR'}?`)) {
                importarDados(jsonData, selectedMode);
              }
            }, 300);
          });
        });
        
        document.getElementById('cancelImport').addEventListener('click', () => {
          importModal.style.display = 'none';
          document.getElementById('fileInput').value = '';
        });
        
        importModal.style.display = 'flex';
        
      } catch (error) {
        mostrarAlerta('Arquivo inválido. Use um arquivo JSON exportado do INVIOKM.');
      }
    };
    reader.readAsText(file);
  });
});

// ========== ORDENAÇÃO POR HORÁRIO DE SAÍDA ========== //

function ordenarTabelaPorSaida() {
  const tbody = document.querySelector('.tabela tbody');
  const linhas = Array.from(tbody.querySelectorAll('tr'));
  
  linhas.sort((a, b) => {
      const saidaA = a.cells[4].innerText;
      const saidaB = b.cells[4].innerText;
      
      // Converter para objetos Date para comparação
      const dataA = parseDataHora(saidaA);
      const dataB = parseDataHora(saidaB);
      
      return dataA - dataB; // Ordem crescente (mais antigo primeiro)
  });
  
  // Reinserir as linhas ordenadas
  linhas.forEach(linha => tbody.appendChild(linha));
}

// Função auxiliar para converter texto em Date
function parseDataHora(texto) {
  if (!texto) return new Date(0);
  
  try {
      const [dataParte, horaParte] = texto.split(' - ');
      const [dia, mes, ano] = dataParte.split('/');
      const [horas, minutos] = horaParte.split(':');
      
      // Ano 20XX (assumindo século 21)
      const anoCompleto = 2000 + parseInt(ano);
      
      return new Date(anoCompleto, mes - 1, dia, horas, minutos);
  } catch (e) {
      console.error('Erro ao parsear data:', texto, e);
      return new Date(0);
  }
}

// Event listener para o botão refresh
document.getElementById('btnRefresh')?.addEventListener('click', () => {
  ordenarTabelaPorSaida();
  mostrarAlerta('Tabela atualizada e ordenada por horário de saída');
});

// Ordenar ao carregar a página
document.addEventListener('DOMContentLoaded', ordenarTabelaPorSaida);

// Função para atualizar tooltips para duplo clique
function atualizarTooltips() {
  document.querySelectorAll('.tabela tbody tr').forEach(linha => {
    for (let i = 0; i < linha.cells.length; i++) {
      if (i !== 2 && i !== 7) {
        linha.cells[i].setAttribute('title', 'Duplo clique para apagar');
      }
    }
  });
}

// Inicializar tooltips ao carregar
setTimeout(() => {
  atualizarTooltips();
}, 500);

// ========== CONFIGURAÇÕES DE USUÁRIO ========== //

document.addEventListener('DOMContentLoaded', function () {
  const plantao = localStorage.getItem('plantao');
  if (plantao) {
    document.getElementById('plantao-info').textContent = `Plantão: ${plantao}`;
  }

  document.getElementById('btnLogout')?.addEventListener('click', function () {
    // Abrir o modal de logout seguro
    openSecureLogout();
  });
  
  // Botão para voltar ao painel principal na tabela.html
  document.getElementById('btnVoltar')?.addEventListener('click', function() {
    window.location.href = 'index.html';
  });
});

// ========== INDICADOR DE ARMAZENAMENTO ========== //

function updateStorageIndicator() {
  try {
    // Calcular uso do localStorage
    const totalSpace = 5 * 1024 * 1024; // 5MB
    let usedSpace = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedSpace += localStorage[key].length * 2; // Cada caractere = 2 bytes
      }
    }

    const percentage = Math.round((usedSpace / totalSpace) * 100);
    const fillElement = document.getElementById('storage-fill');
    const textElement = document.getElementById('storage-text');

    if (fillElement && textElement) {
      fillElement.style.width = `${percentage}%`;
      textElement.textContent = `${percentage}% usado`;

      // Mudar cor conforme o uso
      if (percentage > 90) {
        fillElement.style.backgroundColor = '#f44336';
      } else if (percentage > 70) {
        fillElement.style.backgroundColor = '#ff9800';
      } else {
        fillElement.style.backgroundColor = '#4caf50';
      }
    }
  } catch (e) {
    console.error("Erro ao calcular armazenamento:", e);
  }
}

// Atualizar a cada 30 segundos
setInterval(updateStorageIndicator, 30000);
updateStorageIndicator();

// Abrir tutorial
document.getElementById('tutorial-btn')?.addEventListener('click', function () {
  window.open('tutorial.html', '_blank', 'width=800,height=600');
});