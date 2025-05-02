import axios from "axios";

const saveButton = document.querySelector('.students-form__button--save');
const addButton = document.querySelector('.students-form__button--add');
const studentForm = document.getElementById('students-form');
const studentsGroup = document.getElementById("students-table__body");
const downloadBtn = document.querySelector(".students-table__download-btn");
const table = document.querySelector(".students-table");

renderTable();

function formCleaner() {
    document.getElementById('name').value = "";
    document.getElementById('age').value = "";
    document.getElementById('course').value = "";
    document.getElementById('skills').value = "";
    document.getElementById('email').value = "";
    document.getElementById('recorded').checked = false;
}

function noteForUser(studentsArr) {
    if (studentsArr.length > 0) {
        table.classList.add("disable");
    } else if (studentsArr.length === 0) {
        table.classList.remove("disable");
    }
}

// RENDER
async function renderTable() {
    const source = document.getElementById('students-table__body-template').innerHTML.trim();
    const template = Handlebars.compile(source);
    try {
        const {data} = await axios.get('http://localhost:3000/students');  
        const formattedData = data.map(student => ({
            ...student,
            skills: Array.isArray(student.skills) ? student.skills.join(', ') : student.skills
        }));
        studentsGroup.innerHTML = formattedData.map(student => template(student)).join('');
        noteForUser(data);
    } catch (error) {
        console.error("Помилка рендеру:", error);
    }
}

// CREATE
async function createStudent(obj) {
    try {
        const newStudent = await axios.post('http://localhost:3000/students', obj);
        console.log('Студент доданий:', obj.name);
        renderTable();
    } catch (error) {
        console.error("Помилка створення студента:", error);
    }
    formCleaner();
}

// UPDATE
async function editElement(id) {
    try {
        const {data} = await axios.get('http://localhost:3000/students');
        const student = data.find(s => s.id === id);

        if (!student) {
            console.error(`Студент з ID ${id} не знайдений`);
            return;
        }
    
        document.getElementById('name').value = student.name;
        document.getElementById('age').value = student.age;
        document.getElementById('course').value = student.course;
        document.getElementById('skills').value = student.skills;
        document.getElementById('email').value = student.email;
        document.getElementById('recorded').checked = student.recorded;
        

        saveButton.onclick = async function() {
            const index = data.findIndex(s => s.id === id);
            const url = 'http://localhost:3000';
            const endpoint = 'students';
            let newStudent = {
                id: id,
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                course: document.getElementById('course').value,
                skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()),
                email: document.getElementById('email').value,
                recorded: document.getElementById('recorded').checked
            };
            if (index !== -1) {
                try {
                    const response = await axios.put(`${url}/${endpoint}/${id}`, newStudent);
                    console.log('Оновлено:', response.data);
                    renderTable();
                } catch (error) {
                    console.error("Не вдалося оновити студента:", error);
                }
            }
            saveButton.classList.remove('active');
            addButton.classList.remove('disable');
            studentForm.classList.remove('active');
            formCleaner();
        };
    } catch (error) {
        console.error("Помилка редагування:", error);
    }
}

// DELETE
async function deleteElement(id) {
    try {
        const {data} = await axios.get('http://localhost:3000/students');
        const index = data.findIndex(s => s.id === id);
        if (index !== -1) {
            const url = 'http://localhost:3000';
            const endpoint = 'students';  
            const response = await axios.delete(`${url}/${endpoint}/${id}`);
            console.log(`Студент з ID ${id} видалений`)
            renderTable();
        }
    } catch (error) {
        console.error("Помилка видалення:", error);
    }
}

studentForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const studentData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        course: document.getElementById('course').value,
        skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()),
        email: document.getElementById('email').value,
        recorded: document.getElementById('recorded').checked
    };
    createStudent(studentData);
});

document.getElementById("students-table__body").addEventListener('click', (event) => {
    const editButton = event.target.closest('.students-table__body-btn--edit');
    const deleteBtn = event.target.closest('.students-table__body-btn--delete');

    if (editButton) {
        editElement(editButton.id);
        saveButton.classList.add('active');
        addButton.classList.add('disable');
        studentForm.classList.add('active');
    } else if (deleteBtn) {
        deleteElement(deleteBtn.id);
    }
});

// JSON

function downloadJSON(filename, jsonData) {
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); 

    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); 
}

// DOWNLOAD
async function downloadList() {
    try {
        const {data} = await axios.get('http://localhost:3000/students');
    if (data.length > 0) {
        const jsonStudents = JSON.stringify(data, null, 2);
        downloadJSON("Students.json", jsonStudents);
        try {
            const parseDataStudents = JSON.parse(jsonStudents);
            console.log("JSON students is valid:", Array.isArray(parseDataStudents));
        } catch (error) {
            console.error("Invalid JSON:", error);
        }
    } else {
        alert("You don't have students yet!");
    }
    } catch (error) {
        console.error("Помилка завантаження:", error);
    }
};

downloadBtn.addEventListener("click", downloadList);