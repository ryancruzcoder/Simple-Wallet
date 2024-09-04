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

function tradePerson(input){
    if (input.checked === true){
        document.getElementById('labelPerson').innerText = 'CNPJ:'
        document.getElementById('cpf-login').value = ""
        document.getElementById('cpf-login').hidden = true
        document.getElementById('cpf-login').required = false
        document.getElementById('cpf-login').disabled = true
        document.getElementById('cnpj-login').required = true
        document.getElementById('cnpj-login').hidden = false
        document.getElementById('cnpj-login').disabled = false
    } else {
        document.getElementById('labelPerson').innerText = 'CPF:'
        document.getElementById('cnpj-login').value = ""
        document.getElementById('cnpj-login').hidden = true
        document.getElementById('cnpj-login').required = false
        document.getElementById('cnpj-login').disabled = true
        document.getElementById('cpf-login').required = true
        document.getElementById('cpf-login').hidden = false
        document.getElementById('cpf-login').disabled = false
    }
}

document.getElementById("formLogin").addEventListener('submit', (e) => {
    e.preventDefault()
    if (e.submitter.textContent === 'Criar conta'){
        window.location.href = '/register'
    } else {
        e.target.submit()
    }
})

document.getElementById('cpf-login').addEventListener('input', function() {
    const inputField = this;
    const minLength = inputField.minLength;
    
    if (inputField.value.length < minLength) {
      inputField.setCustomValidity('CPF deve ter pelo menos ' + minLength + ' caracteres.');
    } else {
      inputField.setCustomValidity(''); // Reseta a mensagem de erro
    }
  });

  document.getElementById('cnpj-login').addEventListener('input', function() {
    const inputField = this;
    const minLength = inputField.minLength;
    
    if (inputField.value.length < minLength) {
      inputField.setCustomValidity('CNPJ deve ter pelo menos ' + minLength + ' caracteres.');
    } else {
      inputField.setCustomValidity(''); // Reseta a mensagem de erro
    }
  });