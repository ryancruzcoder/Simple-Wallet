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
        document.getElementById('cpf-login').disabled = true
        document.getElementById('cnpj-login').hidden = false
        document.getElementById('cnpj-login').disabled = false
        document.getElementById('label-name-register').innerText = 'Nome fantasia:'
        document.getElementById('name-register').value = ''
    } else {
        document.getElementById('labelPerson').innerText = 'CPF:'
        document.getElementById('cnpj-login').value = ""
        document.getElementById('cnpj-login').hidden = true
        document.getElementById('cnpj-login').disabled = true
        document.getElementById('cpf-login').hidden = false
        document.getElementById('cpf-login').disabled = false
        document.getElementById('label-name-register').innerText = 'Nome completo:'
        document.getElementById('name-register').value = ''
    }
}

document.getElementById("formRegister").addEventListener('submit', (e) => {
    e.preventDefault()
    if (e.submitter.textContent === 'Entrar'){
        window.location.href = '/login'
    } else {
        e.target.submit()
    }
})

const iptConfirmPassword = document.getElementById('confirm-password-register')
iptConfirmPassword.addEventListener('input', function() {
    const inputPassword = document.getElementById('password-register')
    
    if (iptConfirmPassword.value !== inputPassword.value) {
        iptConfirmPassword.setCustomValidity('As senhas não são iguais.')
    } else {
        iptConfirmPassword.setCustomValidity('') // Reseta a mensagem de erro
    }
})

document.getElementById("password-register").addEventListener('input', (e) => {
    const iptPassword = e.target
    const password = iptPassword.value

    let validityMessage = ''

    if (password.length >= 8) {
        document.getElementById('carac-8digits').classList.remove('text-danger')
        document.getElementById('carac-8digits').classList.add('text-success')
    } else {
        document.getElementById('carac-8digits').classList.add('text-danger')
        document.getElementById('carac-8digits').classList.remove('text-success')
        validityMessage = 'A senha deve conter pelo menos 8 dígitos.'
    }

    if (/[A-Z]/.test(password)) {
        document.getElementById('carac-uppercase').classList.remove('text-danger')
        document.getElementById('carac-uppercase').classList.add('text-success')
        iptPassword.setCustomValidity('')
    } else {
        document.getElementById('carac-uppercase').classList.remove('text-success')
        document.getElementById('carac-uppercase').classList.add('text-danger')
        validityMessage = 'A senha deve conter pelo menos uma letra maiúscula.'
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        document.getElementById('carac-special').classList.remove('text-danger')
        document.getElementById('carac-special').classList.add('text-success')
    } else {
        document.getElementById('carac-special').classList.remove('text-success')
        document.getElementById('carac-special').classList.add('text-danger')
        validityMessage = 'A senha deve conter pelo menos um caractere especial.'
    }

    if (/\d/.test(password)) {
        document.getElementById('carac-number').classList.add('text-success')
        document.getElementById('carac-number').classList.remove('text-danger')
    } else {
        document.getElementById('carac-number').classList.remove('text-success')
        document.getElementById('carac-number').classList.add('text-danger')
        validityMessage = 'A senha deve conter pelo menos um número.'
    }

    iptPassword.setCustomValidity(validityMessage)
    
})

document.getElementById("name-register").addEventListener('input', (e) => {
    let validityMessage = ''
    const iptNameComplet = e.target
    console.log(iptNameComplet)
    const nameComplet = iptNameComplet.value
    console.log(nameComplet.split(' ').length)
    if(nameComplet.split(' ').length <= 1){
        console.log('nome nao é completo')
        validityMessage = 'Informe seu nome completo.'
    }
    iptNameComplet.setCustomValidity(validityMessage)
})