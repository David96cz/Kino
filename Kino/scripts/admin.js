let resetButton = document.getElementById('deleteButton');
let backButton = document.getElementById('backBtnIndex');

resetButton.onclick = function() {
    const adminPassword = prompt('Pro potvrzení smazání, zadej heslo admine.');
    
    if (adminPassword === 'heslo') 
    {
        localStorage.clear();
        location.reload();
        alert("Úspěšně smazáno");
    } 
    else if(adminPassword === null)
    {

    } 
    else
    {
        alert('Nesprávné heslo. Záznamy nebyly smazány.');
    }
}

backButton.onclick = function() {
    window.location.href = 'index.html';
}