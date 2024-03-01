document.addEventListener('DOMContentLoaded', init);

let reserveButton = document.getElementById('reserveButton');
let adminButton = document.getElementById('adminPageBtn');

let currentFilm = '';
let popupTimeout; // Proměnná pro uchování ID timeoutu
let popupHovered = false; // Proměnná pro sledování, zda je kurzor na popupu

function init() {
    document.getElementById('film').addEventListener('change', changeFilm);
    loadAllReservedSeats();
    changeFilm();

    // Přidání události pro sledování pohybu kurzoru nad popupem
    document.getElementById('reservationPopup').addEventListener('mouseenter', function() {
        popupHovered = true;
    });

    // Přidání události pro sledování opuštění popupu kurzorem
    document.getElementById('reservationPopup').addEventListener('mouseleave', function() {
        popupHovered = false;
        planHideReservationPopup();
    });

    // Přidání události pro sledování pohybu kurzoru nad tlačítkem
    document.getElementById('reserveButton').addEventListener('mouseenter', function() {
        clearTimeout(popupTimeout);
    });

    // Přidání události pro sledování opuštění tlačítka kurzorem
    document.getElementById('reserveButton').addEventListener('mouseleave', function(event) {
        if (!event.relatedTarget || (event.relatedTarget && event.relatedTarget.id !== 'reservationPopup')) {
            planHideReservationPopup();
        }
    });
}

function changeFilm() {
    currentFilm = document.getElementById('film').value;
    createSeats(currentFilm);
    loadReservedSeats(currentFilm);
}

function loadReservedSeats(selectedFilm) {
    const output = document.getElementById('reservationBox');
    if (output !== null) {
        output.innerHTML = ''; // Vyčištění obsahu divu před načtením nových rezervací

        const filmsSelect = document.getElementById('film');
        const films = Array.from(filmsSelect.options).map(option => option.value);
        
        films.forEach(film => {
            const filmReservations = JSON.parse(localStorage.getItem(film)) || [];

            filmReservations.forEach(reservationInfo => {
                displayReservation(reservationInfo);
            });
        });

        updateReservedSeats(selectedFilm);
    } else {
        console.error('Kontejner pro zobrazení rezervací nenalezen.');
    }
}


function loadAllReservedSeats() {
    const output = document.getElementById('reservationBox');
    if (output !== null) {
        output.innerHTML = '';

        const films = ['Matrix', 'HarryPotter', 'StarWars'];
        films.forEach(film => {
            const filmReservations = JSON.parse(localStorage.getItem(film)) || [];
            filmReservations.forEach(reservationInfo => {
                displayReservation(reservationInfo);
            });
        });
    } else {
        console.error('Kontejner pro zobrazení rezervací nenalezen.');
    }
}

function createSeats(selectedFilm) {
    const seatsContainer = document.getElementById('seats');
    seatsContainer.innerHTML = '';

    let seatNumber = 1;

    const rows = 7;
    const seatsPerRow = 10;

    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= seatsPerRow; col++) {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            seat.dataset.seatNumber = seatNumber;
            seat.textContent = 'S' + seatNumber;
            seat.addEventListener('click', function() {
                toggleSeat(selectedFilm, seat);
            });
            seat.addEventListener('mouseenter', function() {
                displayReservationOnHover(selectedFilm, seat);
            });
            seat.addEventListener('mouseleave', function() {
                planHideReservationPopup();
            });
            seatsContainer.appendChild(seat);
            seatNumber++;
        }
    }
}

function toggleSeat(selectedFilm, seat) {
    if (!seat.classList.contains('reserved')) {
        seat.classList.toggle('selected');
    }
}

reserveButton.onclick = function() {
    const selectedSeats = document.querySelectorAll('.selected');
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    if (selectedSeats.length === 0 || !firstName || !lastName) {
        alert('Vyberte alespoň jedno místo a vyplňte jméno a příjmení.');
        return;
    }

    selectedSeats.forEach(seat => {
        seat.classList.remove('selected');
        seat.classList.add('reserved');
    });

    const currentDate = new Date().toLocaleDateString();
    const reservedSeats = Array.from(selectedSeats).map(seat => 'S' + seat.dataset.seatNumber);
    const reservationInfo = `${currentDate} - ${firstName} ${lastName}: ${reservedSeats.join(', ')} (${currentFilm})`;

    saveReservation(currentFilm, reservationInfo);
    displayReservation(reservationInfo);
}

function saveReservation(selectedFilm, reservationInfo) {
    const filmReservations = JSON.parse(localStorage.getItem(selectedFilm)) || [];
    filmReservations.push(reservationInfo);
    localStorage.setItem(selectedFilm, JSON.stringify(filmReservations));

    const reservedSeats = JSON.parse(localStorage.getItem(selectedFilm + 'ReservedSeats')) || [];
    const selectedSeats = document.querySelectorAll('.reserved');
    selectedSeats.forEach(seat => {
        const seatNumber = seat.dataset.seatNumber;
        if (!reservedSeats.includes(seatNumber)) {
            reservedSeats.push(seatNumber);
        }
    });
    localStorage.setItem(selectedFilm + 'ReservedSeats', JSON.stringify(reservedSeats));
}

function displayReservation(reservationInfo) {
    const output = document.getElementById('reservationBox');
    if (output !== null) {
        const div = document.createElement('div');
        div.innerText = reservationInfo;
        output.appendChild(div);
    } else {
        console.error('Kontejner pro zobrazení rezervací nenalezen.');
    }
}

function displayReservationPopup(x, y, fullName) {
    const popup = document.getElementById('reservationPopup');
    popup.style.display = 'block';
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.innerText = fullName;
}

function displayReservationOnHover(selectedFilm, seat) {
    if (seat.classList.contains('reserved')) {
        const seatNumber = seat.dataset.seatNumber;
        const reservationInfo = JSON.parse(localStorage.getItem(selectedFilm)).find(reservation => reservation.includes('S' + seatNumber));
        if (reservationInfo) {
            const fullName = reservationInfo.split(' - ')[1].split(': ')[0];
            const rect = seat.getBoundingClientRect();
            const x = rect.left + window.pageXOffset;
            const y = rect.top + window.pageYOffset;
            displayReservationPopup(x, y, fullName);

            clearTimeout(popupTimeout);
        }
    } else {
        clearTimeout(popupTimeout);
    }
}

function planHideReservationPopup() {
    if (!popupHovered) {
        popupTimeout = setTimeout(function() {
            hideReservationPopup();
        }, 0);
    }
}

function hideReservationPopup() {
    const popup = document.getElementById('reservationPopup');
    popup.style.display = 'none';
}

function updateReservedSeats(selectedFilm) {
    const reservedSeats = JSON.parse(localStorage.getItem(selectedFilm + 'ReservedSeats')) || [];
    const allSeats = document.querySelectorAll('.seat');

    allSeats.forEach(seat => {
        const seatNumber = seat.dataset.seatNumber;
        if (reservedSeats.includes(seatNumber)) {
            seat.classList.add('reserved');
        } else {
            seat.classList.remove('reserved');
        }
    });
}

adminButton.onclick = function(){
    const adminPassword = prompt('Zadejte heslo administrátora:');
    
    if (adminPassword === 'heslo') {
        window.location.href = 'admin.html';
    } else {
        alert('Nesprávné heslo.');
    }
}