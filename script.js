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

function preencherKmAutomatico() {
  const movel = movelInput.value.trim();
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
    const novaLinha = tabela.insertRow();
    const movel = movelInput.value.trim();
    const isTecnico = tecnicoToggle.checked;
    
    if (isTecnico) {
      novaLinha.classList.add('tecnico');
    }
    
    novaLinha.insertCell(0).innerText = atendenteInput.value;
    novaLinha.insertCell(1).innerText = movel;
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
    const movel = linhaSelecionada.cells[1].innerText.trim();
    
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

    // Adiciona informação de técnico
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
}

tabela.addEventListener('click', function (e) {
  const alvo = e.target;

  if (alvo.tagName !== 'TD') return;

  const linha = alvo.closest('tr');
  if (!linha) return;

  if (modo === 'fechar') {
    document.querySelectorAll('.tabela tbody tr').forEach(tr => tr.classList.remove('selecionada'));
    linha.classList.add('selecionada');
    abrirModal('chegada', linha);
    return;
  }

  const coluna = alvo.cellIndex;
  if (coluna === 2 || coluna === 7) {
    abrirModal('editar', { celula: alvo, coluna, linha });
  } else if (confirm("Deseja excluir esta linha?")) {
    linha.remove();
    salvarDadosPainel();
  }
});

function salvarDadosPainel() {
  const dados = [];
  for (let linha of tabela.rows) {
    const row = [];
    for (let cell of linha.cells) {
      row.push(cell.innerText);
    }
    // Adiciona informação de técnico
    row.push(linha.classList.contains('tecnico') ? 'Técnico' : '');
    dados.push(row);
  }
  localStorage.setItem('tabelaKM', JSON.stringify(dados));
  
  // Adicionar nome do plantão ao salvar
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
        celula.innerText = row[i] || '';
      }
      // Verifica se é técnico (nona posição)
      if (row.length > 8 && row[8] === 'Técnico') {
        novaLinha.classList.add('tecnico');
      }
      aplicarTooltips(novaLinha);
    });
  }
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