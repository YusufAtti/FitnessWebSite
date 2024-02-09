
let alert = document.querySelector(".teknaAlert");
document.addEventListener("DOMContentLoaded", () => {
    //* Sayfa yüklendiğinde alert öğesinin boş olup olmadığını kontrol ettim
    //* boş olmadığı taktirde alertClose düğmesine tıklanma olayı verildi!
    if (alert.textContent.trim() != "") {
        document.querySelector(".alertClose").addEventListener("click", (e) => {
            $(".teknaAlert").slideUp("slow");
        })
        //*alert açıldığında 3 saniye sonra alert kaybolur
        setTimeout(() => {
            $(".teknaAlert").slideUp("slow");
        }, 5000)
    }
})


//*email ve şifrenin boş olma durumunda alert fırlatılır
document.querySelector(".loginForm").addEventListener("submit",(e) => {
    let loginEmail = document.querySelector(".loginEmail").value
    let pass = document.querySelector(".pass").value
    if(!loginEmail || !pass){
        let teknaAlert = document.querySelector(".teknaAlert")
        teknaAlert.style.display="flex"
        teknaAlert.style.justifyContent="space-between"
        teknaAlert.style.padding="1rem"
        let alertContent = `
        <div class="teknaAlertContent">
            <div clas="alertMessage">
                Lütfen Boş Alan Bırakmayınız!
            </div>
        </div>
        `
        teknaAlert.innerHTML=alertContent
        e.preventDefault()
    }
})