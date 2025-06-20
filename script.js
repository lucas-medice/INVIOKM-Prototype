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
const destinosInput = document.getElementById('destinos');
const kmSaidaInput = document.getElementById('kmSaida');
const kmChegadaInput = document.getElementById('kmChegada');
const obsInput = document.getElementById('obs');

let modo = '';
let linhaSelecionada = null;

function abrirModal(tipo, linha = null) {
  modo = tipo;
  linhaSelecionada = linha;
  modal.style.display = 'flex';
  form.reset();

  if (tipo === 'saida') {
    modalTitle.innerText = 'Registrar Saída';
    mostrarCampos(['atendente', 'destinos', 'kmSaida']);
    ocultarCampos(['kmChegada', 'obs']);
  }

  if (tipo === 'chegada') {
    if (!linha) {
      mostrarAlerta('⚠️ Clique em uma linha para fechar ocorrência.');
      fecharModal();
      return;
    }
    modalTitle.innerText = 'Fechar Ocorrência';
    mostrarCampos(['kmChegada', 'obs']);
    ocultarCampos(['atendente', 'destinos', 'kmSaida']);
  }

  if (tipo === 'editar') {
    if (!linha) {
      mostrarAlerta('⚠️ Selecione uma célula válida.');
      fecharModal();
      return;
    }
    const coluna = linha.coluna;
    const textoAtual = linha.celula.innerText;
    modalTitle.innerText = `Editar ${coluna === 1 ? 'Destinos' : 'Observações'}`;
    mostrarCampos(['obs']);
    ocultarCampos(['atendente', 'destinos', 'kmSaida', 'kmChegada']);
    
        obsInput.value = linhaSelecionada.getAttribute('data-observacao') || textoAtual;
        
  }
}

function fecharModal() {
  modal.style.display = 'none';
  linhaSelecionada = null;
  document.querySelectorAll('.tabela tbody tr').forEach(tr => tr.classList.remove('selecionada'));
}

function mostrarCampos(campos) {
  campos.forEach(id => document.getElementById(id).parentElement.style.display = 'block');
}

function ocultarCampos(campos) {
  campos.forEach(id => document.getElementById(id).parentElement.style.display = 'none');
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
    novaLinha.insertCell(0).innerText = atendenteInput.value;
    novaLinha.insertCell(1).innerText = destinosInput.value;
    novaLinha.insertCell(2).innerText = kmSaidaInput.value;
    novaLinha.insertCell(3).innerText = obterDataHora();
    novaLinha.insertCell(4).innerText = '';
    novaLinha.insertCell(5).innerText = '';
    novaLinha.insertCell(6).innerText = '';
    aplicarTooltips(novaLinha);
    salvarDadosPainel();
    // não salva no backup ainda
  }

  if (modo === 'chegada') {
    const kmSaida = parseFloat(linhaSelecionada.cells[2].innerText);
    const kmChegada = parseFloat(kmChegadaInput.value);
    if (isNaN(kmChegada) || kmChegada < kmSaida) {
      mostrarAlerta("❌ O KM de chegada não pode ser menor que o KM de saída.");
      return;
    }

    // Atualiza painel
    linhaSelecionada.cells[4].innerText = kmChegada;
    linhaSelecionada.cells[5].innerText = obterDataHora();
    
        linhaSelecionada.cells[6].innerText = obsInput.value || '';
        linhaSelecionada.setAttribute('data-observacao', obsInput.value || '');
        
    salvarDadosPainel();

    // Adiciona nova linha ao backup (como histórico)
    const novaOcorrencia = [];
    for (let i = 0; i < 7; i++) {
      novaOcorrencia.push(linhaSelecionada.cells[i].innerText);
    }

    const ocorrenciasAntigas = JSON.parse(localStorage.getItem('tabelaBackup')) || [];
    ocorrenciasAntigas.push(novaOcorrencia);
    localStorage.setItem('tabelaBackup', JSON.stringify(ocorrenciasAntigas));
  }

  if (modo === 'editar') {
    linhaSelecionada.celula.innerText = obsInput.value;
    salvarDadosPainel(); // edição apenas no painel
  }

  fecharModal();
});

function aplicarTooltips(linha) {
  linha.cells[1].setAttribute('title', 'Clique para editar destinos');
  linha.cells[6].setAttribute('title', 'Clique para editar observações');
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
  if (coluna === 1 || coluna === 6) {
    abrirModal('editar', { celula: alvo, coluna });
  } else if (confirm("Deseja excluir esta linha?")) {
    linha.remove();
    salvarDadosPainel(); // apenas painel
  }
});

function salvarDadosPainel() {
  const dados = [];
  for (let linha of tabela.rows) {
    const row = [];
    for (let cell of linha.cells) {
      row.push(cell.innerText);
    }
    dados.push(row);
  }
  localStorage.setItem('tabelaKM', JSON.stringify(dados));
}

function carregarDados() {
  const dados = JSON.parse(localStorage.getItem('tabelaKM'));
  if (dados) {
    dados.forEach(row => {
      const novaLinha = tabela.insertRow();
      row.forEach(texto => {
        const celula = novaLinha.insertCell();
        celula.innerText = texto;
      });
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

// Prevenir fechamento acidental da aba
window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = '';
});

// Função para limpar dados armazenados da tabela
function limparDadosTabela() {
  if (confirm('Deseja realmente apagar todos os dados da tabela?')) {
    localStorage.clear();
    location.reload();
  }
}
