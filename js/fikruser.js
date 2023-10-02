//Registered Users
let userId = null;
let userName = null;

function getUserId() {

    if (userId === null) {
        return "johndoe"; // Return "johndoe" if userId is null
    } else {
        return userId; // Return the actual userId if it's not null
    }
}

function getUserName() {

    return userName;
}

function setUserId(user) {

    userId = user;
}

function setUserName(name) {

    userName = name;
}

const selectedUserElement = document.getElementById('selectedUser');

// Add an event listener for the "Register User" button to open the modal
document.addEventListener("DOMContentLoaded", function() {
    // Add a click event listener to the "Register User" button
    const registerUserButton = document.getElementById("registeruser");
    if (registerUserButton) {
        registerUserButton.addEventListener("click", function() {
            // Clear the form fields when opening the modal
            document.getElementById("userId").value = "";
            document.getElementById("userName").value = "";
            document.getElementById("password").value = "";
            document.getElementById("confirmPassword").value = "";



            // Trigger the modal to show
            const registrationModal = new bootstrap.Modal(document.getElementById("registrationModal"));
            registrationModal.show();
        });


        // Add a click event listener to the "Save" button in the modal
        const saveuserRegistrationButton = document.getElementById("saveUserRegistration");
        if (saveuserRegistrationButton) {
            saveuserRegistrationButton.addEventListener("click", (event) => {



                // Clear previous error messages
                clearFieldErrors();

                const userId = document.getElementById('userId').value;
                const userName = document.getElementById('userName').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;

                // Validate user inputs
                if (isFieldEmpty(userId)) {
                    showFieldError('userId', 'User ID is required.');
                    return;
                }

                if (isFieldEmpty(userName)) {
                    showFieldError('userName', 'User Name is required.');
                    return;
                }

                if (isFieldEmpty(password)) {
                    showFieldError('password', 'Password is required.');
                    return;
                }

                if (isFieldEmpty(confirmPassword)) {
                    showFieldError('confirmPassword', 'Confirm Password is required.');
                    return;
                }

                if (password !== confirmPassword) {
                    showFieldError('password', 'Password and confirm password do not match.');
                    showFieldError('confirmPassword', 'Password and confirm password do not match.');
                    return;
                }

                if (!checkPasswordStrength(password)) {
                    showFieldError('password', 'Password does not meet the strength requirements.');
                    return;
                }

                // Your registration logic here
                // Send the data to your server or perform any necessary actions
                handleuserRegistrationForm(event);
                // Close the modal
                // $('#registrationModal').modal('hide');
            });










        }


    }


});



// Function to handle the form submission
function handleuserRegistrationForm(event) {
    event.preventDefault(); // Prevent the form from submitting and reloading the page

    // Get the values from the input fields
    userId = document.getElementById("userId").value;
    userName = document.getElementById("userName").value;

    // Display the collected User ID and User Name
    const registrationResult = document.getElementById("registrationResult");
    //console.log(`User ID: ${userId}, User Name: ${userName}`);
    selectedUserElement.textContent = userId;
    // fadi here we are reusing the same session when switching from non user to user



    // Close the modal
    var myModalEl = document.getElementById('registrationModal');
    var modal = bootstrap.Modal.getInstance(myModalEl); // Returns a Bootstrap modal instance
    modal.hide();
}



// Function to check password strength
function checkPasswordStrength(password) {
    // Add your password strength rules here
    // Example: Check for at least one uppercase letter, one number, and one special character
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
}

// Function to update password strength indicator
function updatePasswordStrengthIndicator() {
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.getElementById('passwordStrength');
    const password = passwordInput.value;

    // Check password strength and update the indicator accordingly
    if (checkPasswordStrength(password)) {
        passwordStrength.textContent = 'Strong';
        passwordStrength.classList.remove('text-danger');
        passwordStrength.classList.add('text-success');
    } else {
        passwordStrength.textContent = 'Weak (at least 8 characters with 1 uppercase, 1 number, and 1 special character)';
        passwordStrength.classList.remove('text-success');
        passwordStrength.classList.add('text-danger');
    }
}

// Add an event listener to check password strength as the user types
document.getElementById('password').addEventListener('input', updatePasswordStrengthIndicator);




// Function to check if a field is empty
function isFieldEmpty(fieldValue) {
    return fieldValue.trim() === '';
}

// Function to show an error message for a field
function showFieldError(fieldId, errorMessage) {
    const fieldElement = document.getElementById(fieldId);
    fieldElement.classList.add('is-invalid');
    const errorElement = document.getElementById(`${fieldId}Error`);
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
}

// Function to clear error messages for all fields
function clearFieldErrors() {
    const fields = ['userId', 'userName', 'password', 'confirmPassword'];
    fields.forEach((fieldId) => {
        const fieldElement = document.getElementById(fieldId);
        fieldElement.classList.remove('is-invalid');
        const errorElement = document.getElementById(`${fieldId}Error`);
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    });
}


export { getUserId, getUserName, setUserId, setUserName };