let currentPage = 1;
const pageSize = 15;
let totalCars = 0;
let carsData = [];
let carId = "";

fetchCarsData("https://myfakeapi.com/api/cars/");

document.getElementById("search-input").addEventListener('input', function () {
    currentPage = 1;
    updateTable();
});

document.getElementById("prev-page-btn").addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
});

document.getElementById("next-page-btn").addEventListener('click', function () {
    if (currentPage < Math.ceil(totalCars / pageSize)) {
        currentPage++;
        updateTable();
    }
});

document.getElementById("add-new-car-btn").addEventListener('click', function () {
    openAddModal();
});

document.querySelector(".save-add-edit-form-btn").addEventListener('click', function () {
    if (document.getElementById("add-edit-modal").classList.contains("add-car")) {
        addCar();
        document.getElementById("add-edit-modal").classList.remove("add-car");
    }
    else editCar();
});

document.querySelector(".confirm-delete-btn").addEventListener('click', function () {
    deleteCar();
});

async function fetchCarsData(url) {
    if (sessionStorage.getItem("sessionCarsData") == null) {
        const response = await fetch(url);
        const data = await response.json();
        sessionStorage.setItem("sessionCarsData", JSON.stringify(data.cars));
        carsData = data.cars;
    }
    else {
        carsData = JSON.parse(sessionStorage.getItem("sessionCarsData"));
    }
    totalCars = carsData.length;
    updateTable();
}

function updateTable() {
    const searchQuery = document.getElementById("search-input").value.toLowerCase();
    const filteredCars = carsData.filter(car => {
        return (
            car.car.toLowerCase().includes(searchQuery) ||
            car.car_model.toLowerCase().includes(searchQuery) ||
            car.car_color.toLowerCase().includes(searchQuery) ||
            car.car_model_year.toString().toLowerCase().includes(searchQuery) ||
            car.car_vin.toLowerCase().includes(searchQuery) ||
            car.price.toLowerCase().includes(searchQuery) ||
            car.availability.toString().toLowerCase().includes(searchQuery)
        );
    });

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const carsToShow = filteredCars.slice(startIndex, endIndex);

    renderTable(carsToShow);
    updatePagination(filteredCars);
}

function updatePagination(filteredCars) {
    const totalPages = Math.ceil(filteredCars.length / pageSize);
    if (totalPages == 0) currentPage = 0;
    document.getElementById("page-number").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-page-btn').disabled = (currentPage <= 1);
    document.getElementById('next-page-btn').disabled = (currentPage === totalPages);
}

function renderTable(carsToShow) {
    let tableData = "";
    carsToShow.map((values) => {
        tableData += `<tr data-car-id="${values.id}">
                <td>${values.car}</td>
                <td>${values.car_model}</td>
                <td>${values.car_vin}</td>
                <td class="center">${values.car_color}</td>
                <td class="center">${values.car_model_year}</td>
                <td>${values.price}</td>
                <td class="center"><input type="checkbox" class="car-availability" ${values.availability == true ? "checked" : ""}></td>
                <td class="center">
                    <button class="dropdown-btn">
                        Action
                            <div class = "dropdown">
                                <a class="edit-btn">Edit</a>
                                <a class="delete-btn">Delete</a>
                            </div>
                    </button>
                </td>
            </tr>`;
    });
    document.getElementById("table-body").innerHTML = tableData;

    const allDropdownButtons = document.querySelectorAll(".dropdown-btn");
    for (const dropdownButton of allDropdownButtons) {
        const menu = dropdownButton.querySelector(".dropdown");

        dropdownButton.addEventListener('click', () => {
            menu.style.visibility = menu.style.visibility == "visible" ? "hidden" : "visible";
            carId = dropdownButton.closest('tr').dataset.carId;
        });

        window.addEventListener('click', (event) => {
            if (event.target == menu.querySelector(".edit-btn")) {
                openEditModal(carId);
            }
            else if (event.target == menu.querySelector(".delete-btn")) {
                openDeleteModal(carId);
            }
            else if (event.target !== dropdownButton) {
                menu.style.visibility = "hidden";
            }
        });
    }
}

function openAddModal() {
    document.getElementById('edit-company').value = "";
    document.getElementById('edit-model').value = "";
    document.getElementById('edit-vin').value = "";
    document.getElementById('edit-color').value = "";
    document.getElementById('edit-year').value = "";
    document.getElementById('edit-price').value = "";
    document.getElementById('edit-availability').checked = false;
    document.getElementById('edit-company').disabled = false;
    document.getElementById('edit-model').disabled = false;
    document.getElementById('edit-vin').disabled = false;
    document.getElementById('edit-year').disabled = false;
    document.getElementById('add-edit-modal').classList.add("add-car");
    document.getElementById('add-edit-modal-name').innerHTML = "Add car";

    openModal("#add-edit-modal");
}

function openEditModal(carId) {
    let carData = carsData.find((cars) => cars.id == carId);
    document.getElementById("add-edit-modal").dataset.carId = carId;
    if (carData) {
        document.getElementById('edit-company').value = carData.car;
        document.getElementById('edit-model').value = carData.car_model;
        document.getElementById('edit-vin').value = carData.car_vin;
        document.getElementById('edit-color').value = carData.car_color;
        document.getElementById('edit-year').value = carData.car_model_year;
        document.getElementById('edit-price').value = parseFloat(carData.price.replace("$", "")).toFixed(2);
        document.getElementById('edit-availability').checked = carData.availability;
        document.getElementById('edit-company').disabled = true;
        document.getElementById('edit-model').disabled = true;
        document.getElementById('edit-vin').disabled = true;
        document.getElementById('edit-year').disabled = true;
        document.getElementById('add-edit-modal-name').innerHTML = "Edit car";

        openModal("#add-edit-modal");
    }
}

function openDeleteModal(carId) {
    let carData = carsData.find((cars) => cars.id == carId);
    document.getElementById("delete-modal").dataset.carId = carId;
    document.getElementById("car-name").innerHTML = `Are you sure you want to delete ${carData.car} ${carData.car_model}?`;
    openModal("#delete-modal");
}

function openModal(modalId) {
    const modal = document.querySelector(modalId);
    modal.style.visibility = "visible";
    window.addEventListener('click', (event) => {
        if (event.target == modal || event.target == document.querySelector(".close-add-edit-form-btn") || event.target == document.querySelector(".close-delete-btn")) {
            document.getElementById("add-edit-modal").classList.remove("add-car");
            modal.style.visibility = "hidden";
        }
    });
}

function addCar() {
    const lastCarId = carsData.at(-1).id;
    const newCarId = lastCarId + 1;
    carsData.push({
        id: newCarId,
        car: document.getElementById("edit-company").value,
        car_model: document.getElementById("edit-model").value,
        car_vin: document.getElementById("edit-vin").value,
        car_color: document.getElementById("edit-color").value,
        car_model_year: document.getElementById("edit-year").value,
        price: `$${document.getElementById("edit-price").value}`,
        availability: document.getElementById("edit-availability").checked
    });
    updateData();
    closeModal();
}

function editCar() {
    const carId = document.getElementById("add-edit-modal").dataset.carId;
    const carIndex = carsData.findIndex(function (car) {
        return car.id == carId;
    });
    carsData[carIndex] = {
        ...carsData[carIndex],
        car_color: document.getElementById("edit-color").value,
        price: `$${document.getElementById("edit-price").value}`,
        availability: document.getElementById("edit-availability").checked
    }
    updateData();
    closeModal();
}

function deleteCar() {
    const carId = document.getElementById("delete-modal").dataset.carId;
    const carIndex = carsData.findIndex(function (car) {
        return car.id == carId;
    });
    carsData.splice(carIndex, 1);
    updateData();
    closeModal();
}

function updateData() {
    sessionStorage.setItem("sessionCarsData", JSON.stringify(carsData));
    updateTable();
}

function closeModal() {
    const modals = document.querySelectorAll(".modal");
    for(const modal of modals){
        modal.style.visibility = "hidden";
    }
}