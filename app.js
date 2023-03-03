

// -------------------------
// global variables
// -------------------------
let employees = [];
let filterIndexArray = [];
const urlAPI = 'https://randomuser.me/api/?results=12&inc=name,picture,email,location,phone,dob&noinfo&nat=US';
const gridContainer = document.querySelector('.gallery');
const searchContainer = document.querySelector('.search-container');
const allCards = document.querySelectorAll('.card');

//append no results header
function insertNoResults() {
    const html = `<h1 class="no-results"></h1>`;
    gridContainer.insertAdjacentHTML('afterbegin', html);
}

insertNoResults();

const noResults = document.querySelector('.no-results');

// -------------------------
// data calls
// -------------------------
fetchData(urlAPI)
    .then((res) => {
        employees = res.results;
        displayEmployees(employees);
        filterAndDisplay();
    })
// -------------------------
// helper functions
// -------------------------
function fetchData(url) {
    return fetch(url)
              .then(checkStatus)
              .then(res => res.json())
              .catch(error => console.log('Looks like there was a problem', error))
}

function checkStatus(response) {
    if (response.ok) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(new Error(response.statusText));
    }
}

//append search bar
function insertSearchBar() {
    const html =
    `
        <form action="#" method="get">
            <input type="search" id="search-input" class="search-input" placeholder="Search...">
            <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
        </form>
    `;
    searchContainer.insertAdjacentHTML('beforeend', html)
}

//append modal
function insertModal() {
    const html =
    `
     
            <div class="modal-container overlay hidden">
                <div class="modal">
                    <span id="modal-close-btn" class="modal-close-btn"><strong>X</strong></span>
                    <span id="modal-prev" class="fa-solid fa-circle-arrow-left fa-2xl"></span>
                    <span id="modal-next" class="fa-solid fa-circle-arrow-right fa-2xl"></span>
                    <div class="modal-info-container">
                    </div>
                </div>
            </div>

    `;
    document.body.insertAdjacentHTML('afterbegin', html)
}

function displayEmployees (list) {
    list.forEach((list, index) => {
        let name = list.name;
        let email = list.email;
        let city = list.location.city;
        let state = list.location.state;
        let picture = list.picture;

        const employeeHTML = `
            <div class="card" data-index="${index}">
                <div class="card-img-container">
                    <img class="card-img" src="${picture.large}" />
                </div>
                <div class="card-info-container">
                    <h3 id="${name.first} ${name.last}" class="card-name cap">${name.first} ${name.last}</h2>
                    <p class="card-text">${email}</p>
                    <p class="card-text cap">${city}, ${state}</p>
                </div>
            </div>
        `;

        gridContainer.insertAdjacentHTML('beforeend', employeeHTML)
    });
}

//receive a number and convert to 2 digits if necessary
function twoDigits (date) {
    return String(date + 1).padStart(2, '0');
}

function displayModal (index) {
    const overlay = document.querySelector('.overlay');
    const modalInfo = document.querySelector('.modal-info-container');
    //deconstruct array to more simply write the HTML template
    let { name, dob, phone, email, location: { city, street, state, postcode}, picture } = employees[index];

    let date = new Date(dob.date);
    modalInfo.innerHTML = '';
    //template for overlay information
    const modalHTML =`
        <img class="modal-img" src="${picture.large}" alt="${name.first} profile pic" />
        <div class="text-container modal-info-container">
            <h3 id="name" class="modal-name cap name">${name.first} ${name.last}</h2>
            <p class="modal-text email">${email}</p>
            <p class="modal-text address">${city}</p>
            <hr />
            <p class="modal-text">${fixPhoneNum(phone)}</p>
            <p class="modal-text address">${street.number} ${street.name}, ${state} ${postcode}</p>
            <p class="modal-text">Birthday: ${twoDigits(date.getMonth())} / ${twoDigits(date.getDate())} / ${date.getFullYear()}</p>
        </div>
    `;

    overlay.classList.remove('hidden');
    modalInfo.insertAdjacentHTML('beforeend', modalHTML);
}

function fixPhoneNum (num) {
    if (num.charAt(5) === '-') {
        num = num.replace(num.charAt(5), ' ');
    }
    return num;
}

//finds index of employees[] based on email address
function getIndex(email) {
    let employeeIndex = 0;
    employees.forEach( (employee, index) => {
        if (employee.email === email) {
            employeeIndex = index;
        }
    });
    return employeeIndex;
}

//displays only matches to search results
function filterAndDisplay () {
    const search = document.getElementById('search-input');
    noResults.style.display = 'none'
    filterIndexArray = [];
    employees.forEach(employee => {
            if ( `${employee.name.first.toLowerCase()} ${employee.name.last.toLowerCase()}`
                .includes(search.value
                    .toLowerCase()) || search.value === '' ) {
                document.querySelector(`div[data-index="${getIndex(employee.email)}"`).style.display = "flex";
                filterIndexArray.push(getIndex(employee.email));
            } else {
                document.querySelector(`div[data-index="${getIndex(employee.email)}"`).style.display = "none";
            }
        }
    )
    if (filterIndexArray.length === 0) {
        allCards.forEach(card => card.style.display = 'none');
        noResults.innerText = `Your search for "${search.value}" returned no results. Please try again`;
        noResults.style.display = 'flex';
    }
}


// -------------------------
// event listeners
// -------------------------

//default load settings
// this listener displays all the custom loaded html and adds relevant event listeners
window.addEventListener('load', () => {
    // append custom html
    insertSearchBar();
    insertModal();

    // declare variables after custom html has been added
    const search = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-submit');
    const modalClose = document.querySelector('.modal-close-btn');
    const overlay = document.querySelector('.overlay');
    const leftArrow = document.getElementById('modal-prev');
    const rightArrow = document.getElementById('modal-next');

    // add event listeners to custom html
    search.addEventListener('input', filterAndDisplay);
    searchBtn.addEventListener('click', filterAndDisplay);
    search.value = '';
    modalClose.addEventListener('click', closeModal);
    modalClose.addEventListener('click', (e) => {
        e.stopPropagation();
    });
        //navigation buttons
    leftArrow.addEventListener('click', () => {
        const email = document.querySelector('.modal .email').innerText;
        if (getIndex(email) > filterIndexArray[0]) {
            const filterIndex = filterIndexArray.indexOf(getIndex(email));
            displayModal(filterIndexArray[filterIndex - 1]);
        } else displayModal(filterIndexArray[filterIndexArray.length - 1]);
    })

    rightArrow.addEventListener('click', () => {
        const email = document.querySelector('.modal .email').innerText;
        if (getIndex(email) < filterIndexArray[filterIndexArray.length - 1]) {
            const filterIndex = filterIndexArray.indexOf(getIndex(email));
            displayModal(filterIndexArray[filterIndex + 1]);
        } else displayModal(filterIndexArray[0]);
    });
        //click outside of modal to close modal
    overlay.addEventListener('click', (e) => {
    if (!overlay.classList.contains('hidden') && e.target.classList.contains('overlay')) {
        console.log(e.target);
        closeModal();
    }
})
})

//display details of student
gridContainer.addEventListener('click', e => {
    const overlay = document.querySelector('.overlay');
    if (e.target !== gridContainer && e.target !== overlay) {
        if (e.target.closest('.card') !== null) {
            const card = e.target.closest('.card');
            const index = card.getAttribute('data-index');
            displayModal(index);
        }
    }
})

//close detail window
const closeModal = () => {
    const modalContainer = document.querySelector('.modal-info-container');
    const overlay = document.querySelector('.overlay');
    overlay.classList.add('hidden');
    modalContainer.innerHTML = '';
}



//press escape key to close modal
window.addEventListener('keyup', (e) => {
    const overlay = document.querySelector('.overlay');
    console.log(e.key);
    if (e.key === "Escape" && !overlay.classList.contains('hidden')) {
        closeModal();
    }
})

//search each time input changes value
