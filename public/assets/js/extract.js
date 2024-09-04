document.addEventListener('DOMContentLoaded', ()=>{
  const modalElement = document.getElementById('staticBackdrop')
  const modalInstance = new bootstrap.Modal(modalElement)
  const messageConfirm = document.querySelector('.modal-body')
  const btnsRevert = document.querySelectorAll('button.revert')
  
  for (btn of btnsRevert){
    btn.addEventListener('click', (e) => {
      const formRevert = document.getElementById('formRevert')
      formRevert.action = `/wallet/revert/${encodeURIComponent(e.target.getAttribute('data-id-moviment'))}`
      modalInstance.show()
    })
  }
})