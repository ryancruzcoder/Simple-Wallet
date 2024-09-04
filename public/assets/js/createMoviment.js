const h2 = document.querySelector('h2')
const iptValueConfirm = document.getElementById('number-transfer-confirm')
const iptValue = document.getElementById('number-transfer')
const iptKey = document.getElementById('key-ben')
const divKeyBen = document.getElementById("key-ben-box")
const iptKeyConfirm = document.getElementById('key-ben-confirm')
const messageConfirm = document.querySelector('.modal-body')
const alertContainer = document.getElementById("alertContainer")
const modalElement = document.getElementById('staticBackdrop');
const modalInstance = new bootstrap.Modal(modalElement);

if (h2.textContent === 'Depósito'){
    divKeyBen.remove()
    iptKeyConfirm.remove()
} else if (h2.textContent !== 'Transferência') {
    window.location.href = '/error'
}

async function makeTextConfirm() {
    if (h2.textContent === 'Depósito') {
        iptKeyConfirm.value = iptKey.value
        let valueFormatString = iptValue.value
        let valueFormat = iptValue.value.replace(' ', '')
        valueFormat = valueFormat.replace('R$', '')
        valueFormat = valueFormat.replace('.', '')
        valueFormat = valueFormat.replace(',', '.')
        iptValueConfirm.value = parseFloat(valueFormat)
        if (iptValueConfirm.value < 1 || isNaN(iptValueConfirm.value)) {  // Verifica se o valor é válido
            alertaAmarelo('Valor mínimo por depósito é de R$ 1,00.');
        } else {
            messageConfirm.innerHTML = `Deseja fazer um depósito de <b>${valueFormatString}</b> na sua conta?`;
            modalInstance.show();
        }
    } else if (h2.textContent === 'Transferência') {
        let formatKey;
        if (/[A-Za-z]/.test(iptKey.value[0])){
            if (!iptKey.value.includes('@')){
                alertaAmarelo('E-mail informado com formato inválido.')
                return null
            } else if (!iptKey.value.includes('.com') && !iptKey.value.includes('.br')){
                alertaAmarelo('E-mail informado com formato inválido.')
                return null
            }
            formatKey = 'email'
        } else {
            if (iptKey.value.length !== 14 && iptKey.value.length !== 18) {
                alertaAmarelo('CPF/CNPJ informado com formato inválido.')
                return null
            }
            formatKey = 'document'
        }
        iptKeyConfirm.value = iptKey.value
        let valueFormatString = iptValue.value
        let valueFormat = iptValue.value.replace(' ', '')
        valueFormat = valueFormat.replace('R$', '')
        valueFormat = valueFormat.replace('.', '')
        valueFormat = valueFormat.replace(',', '.')
        iptValueConfirm.value = parseFloat(valueFormat)
        if (iptValueConfirm.value < 1 || isNaN(iptValueConfirm.value)) {  // Verifica se o valor é válido
            alertaAmarelo('Valor mínimo por depósito é de R$ 1,00.');
        } else {
            try {
                const response = await fetch(`/user/api/findNameKeyBen/${encodeURIComponent(iptKeyConfirm.value)}`)
                const nameBene = await response.text()
                if (nameBene.includes(`"message":`)) {
                    let err = JSON.parse(nameBene)
                    throw new TypeError(err.message)
                }
                messageConfirm.innerHTML = `Deseja fazer uma transferência no valor de <b>${valueFormatString}</b> para <b>${nameBene}</b>`
                modalInstance.show();
            } catch(err) {
                alertaAmarelo(err.message)
            }
        }
    } else {
        window.location.href = '/error';
    }
}

iptValue.addEventListener("input", (e) => {
    let value = iptValue.value.replace(/\D/g, ''); // Remove tudo que não for número

    // Adiciona zeros à esquerda se o valor for menor que 100 (para garantir 2 casas decimais)
    value = (value / 100).toFixed(2).split('.');

    // Adiciona os pontos de milhar
    value[0] = value[0].split(/(?=(?:\d{3})+(?!\d))/).join('.');

    // Junta a parte inteira e a parte decimal
    iptValue.value = `R$ ${value.join(',')}`;
});

iptKey.addEventListener("input", (e) => {
    iptKey.value = iptKey.value.replace(' ', '')
    if (iptKey.value) {
        if (!/[A-Za-z]/.test(iptKey.value[0])) {
            let cpf = iptKey.value.replace(/\D/g, ""); // Remove tudo que não for dígito
            cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
            cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
            cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            iptKey.value = cpf;
            if (iptKey.value.length > 14) {
                let cnpj= iptKey.value.replace(/\D/g, ""); // Remove tudo que não for dígito
                cnpj = cnpj.replace(/(\d{2})(\d)/, "$1.$2");
                cnpj = cnpj.replace(/(\d{3})(\d)/, "$1.$2");
                cnpj = cnpj.replace(/(\d{3})(\d)/, "$1/$2");
                cnpj = cnpj.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                iptKey.value = cnpj;
                iptKey.maxLength = 18
            }
        }
    }
})

function formatCPF(input) {
    let cpf = input.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    input.value = cpf;
}

function formatCNPJ(input) {
    let cnpj= input.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    cnpj = cnpj.replace(/(\d{2})(\d)/, "$1.$2");
    cnpj = cnpj.replace(/(\d{3})(\d)/, "$1.$2");
    cnpj = cnpj.replace(/(\d{3})(\d)/, "$1/$2");
    cnpj = cnpj.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    input.value = cnpj;
}


function alertaAmarelo(mensagem){
    alertContainer.innerHTML = `
    <div class="alert alert-warning alert-dismissible fade show mb-2" role="alert" style="width: 100%;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill mx-1" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
      </svg>
    ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
  }

  function alertaVermelho(mensagem){
    alertContainer.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show mb-2" role="alert" style="width: 100%;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill mx-1" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
      </svg>
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`
  }

  function alertaVerde(mensagem){
    alertContainer.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show mb-2" role="alert" style="width: 100%;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill-check mx-1" viewBox="0 0 16 16">
      <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
      <path d="M2 13c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
    </svg>
    ${mensagem}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`
}

