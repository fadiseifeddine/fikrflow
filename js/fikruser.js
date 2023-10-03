import * as common from './common.js';

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

    ////////////////////////////////////////////////////////////////////////////////////////////////////// Registration SIGNUP
    // Add a click event listener to the "Register User" button (MENU SIGN-UP / REGISTER USER)
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
    }


    const userIdElement = document.getElementById("userId");

    // Add a blur event listener to the userIdInput field
    userIdElement.addEventListener("blur", async() => {

        const userId = userIdElement.value;

        if (!isFieldEmpty(userId)) {

            // Check if the user already exists
            const userExists = await checkuser(userId);
            console.log("userExists", userExists);

            if (userExists == "user_found") {
                // Generate a random 2-digit number
                const randomTwoDigitNumber = Math.floor(Math.random() * 100);

                // Suggest an alternative username
                const suggestedUserId = `${userId}${randomTwoDigitNumber}`;

                // Show an error message with the suggestion
                showFieldError('userId', `User ID "${userId}" is already taken. You can use "${suggestedUserId}" or choose another.`);
                return;
            } else {
                console.log("User Not Found. Registering User =", userId);
                showFieldError('userId', '', true); // Clear the error

            }
        } else {
            showFieldError('userId', 'User ID is required.');
            return;
        }
    });


    // Add a click event listener to the "Save" button in the modal
    const saveuserRegistrationButton = document.getElementById("saveUserRegistration");
    if (saveuserRegistrationButton) {
        saveuserRegistrationButton.addEventListener("click", async(event) => {



            // Clear previous error messages
            const fields = ['userId', 'userName', 'password', 'confirmPassword'];

            clearFieldErrors(fields);

            const userId = document.getElementById('userId').value;
            const userName = document.getElementById('userName').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;


            if (!isFieldEmpty(userId)) {

                // Check if the user already exists
                const userExists = await checkuser(userId);
                console.log("userExists", userExists);

                if (userExists == "user_found") {
                    // Generate a random 2-digit number
                    const randomTwoDigitNumber = Math.floor(Math.random() * 100);

                    // Suggest an alternative username
                    const suggestedUserId = `${userId}${randomTwoDigitNumber}`;

                    // Show an error message with the suggestion
                    showFieldError('userId', `User ID "${userId}" is already taken. You can use "${suggestedUserId}" or choose another.`);
                    return;
                } else {
                    console.log("User Not Found. Registering User =", userId);
                    showFieldError('userId', '', true); // Clear the error

                }
            } else {
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

    ////////////////////////////////////////////////////////////////////////////////////////////////// Login
    // Add a click event listener to the "Login User" button (MENU SIGN-IN / LOGIN USER)
    const loginUserButton = document.getElementById("loginuser");
    if (loginUserButton) {
        loginUserButton.addEventListener("click", function() {

            console.log("Sign-In Clearing the Dialog first....");
            // Clear the form fields when opening the modal
            document.getElementById("loginuserid").value = "";
            document.getElementById("loginpassword").value = "";

            console.log("Sign-In Instatiating the Modal....");

            // Trigger the modal to show
            const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));

            console.log("Sign-In Showing the Modal....");

            loginModal.show();
        });
    }

    // Add an event listener to the "Login" button inside the modal
    document.getElementById("loginButton").addEventListener("click", async function() {
        // Your login logic goes here

        console.log("In Login .... ");

        // Clear previous error messages
        const fields = ['loginuserid', 'loginpassword'];
        clearFieldErrors(fields);


        const userId = document.getElementById('loginuserid').value;
        const password = document.getElementById('loginpassword').value;

        if (isFieldEmpty(userId)) {
            showFieldError('loginuserid', 'User ID is required.');
            return;
        }

        if (isFieldEmpty(password)) {
            showFieldError('loginpassword', 'Password is required.');
            return;
        }


        // Your registration logic here
        // Send the data to your server or perform any necessary actions
        handleuserLoginForm(event);

    });



    ////////////////////////////////////////////////////////////////////////////////////////////////////

});



// Function to handle the Register User / Sign-Up form submission
function handleuserRegistrationForm(event) {
    event.preventDefault(); // Prevent the form from submitting and reloading the page

    // Get the values from the input fields
    const userId = document.getElementById("userId").value;
    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;




    // Register the user (your registration logic here)
    // Send the data to your server or perform any necessary actions
    registeruser(userId, userName, password);


    // Close the modal
    var myModalEl = document.getElementById('registrationModal');
    var modal = bootstrap.Modal.getInstance(myModalEl); // Returns a Bootstrap modal instance
    modal.hide();

    selectedUserElement.textContent = userId;
    // fadi here we are reusing the same session when switching from non user to user
}


// Function to handle the Login User / Sign-In form submission
async function handleuserLoginForm(event) {
    event.preventDefault(); // Prevent the form from submitting and reloading the page


    console.log("handleuserLoginForm ....");
    // Get the values from the input fields
    const userId = document.getElementById("loginuserid").value;
    const password = document.getElementById("loginpassword").value;


    // Register the user (your registration logic here)
    // Send the data to your server or perform any necessary actions
    const autheticated = await authenticateuser(userId, password);
    if (autheticated == true) {
        console.log("autheticated .... True");
        // Close the modal
        var myModalEl = document.getElementById('loginModal');
        var modal = bootstrap.Modal.getInstance(myModalEl); // Returns a Bootstrap modal instance
        modal.hide();

        selectedUserElement.textContent = userId;
        // fadi here we are reusing the same session when switching from non user to user

    } else {
        console.log("autheticated .... false");

        return;
    }



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

// Function to show or clear an error message for a field
function showFieldError(fieldId, errorMessage, clearError = false) {
    const fieldElement = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);

    if (clearError) {
        fieldElement.classList.remove('is-invalid');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    } else {
        fieldElement.classList.add('is-invalid');
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
    }
}


// Function to clear error messages for all fields
function clearFieldErrors(fields) {
    fields.forEach((fieldId) => {
        const fieldElement = document.getElementById(fieldId);
        fieldElement.classList.remove('is-invalid');
        const errorElement = document.getElementById(`${fieldId}Error`);
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    });
}

// Function to check if a user exists
async function checkuser(userId) {
    const response = await fetch(`http://localhost:3000/api/checkuser?userId=${userId}`);
    const data = await response.json();
    console.log("user exists ? ", data);
    return data.result;
}



async function registeruser(userId, userName, password) {
    // Check if the user provided a file name


    // Proceed with saving using the file name
    try {
        const response = await fetch('http://localhost:3000/api/registeruser', {
            method: 'POST',
            body: JSON.stringify({
                userId: userId,
                userName: userName,
                password: password
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("response =", response);

        if (response.ok) {
            //console.log('Drawing saved successfully');
            common.showMessage('User Registered successfully ...', 2000);
            return true; // Return true on success
        } else {
            console.error('Failed to save drawing');
            // Handle the error and provide appropriate user feedback
            return false; // Return false on failure
        }
    } catch (error) {
        console.error('An error occurred:', error);
        // Handle the error and provide appropriate user feedback
        return false; // Return false on error
    }

}


async function authenticateuser(userId, password) {
    console.log("authenticateuser ....");

    // Check if the user already exists
    const userAuthenticated = await checkUserPassword(userId, password);
    console.log("userAuthenticated", userAuthenticated);

    if (userAuthenticated.result == "user_authenticated") {
        console.log("Authenticated  True...");
        return true;

    } else {

        showFieldError('loginuserid', 'User and/Or Combination Not Valid...');
        showFieldError('loginpassword', 'User and/Or Combination Not Valid...');
        return false;

    }

}

// Function to check if a user exists
// Function to check if a user exists and authenticate
async function checkUserPassword(loginUserId, loginPassword) {

    console.log("checkUserPassword.loginUserId = ", loginUserId);
    console.log("checkUserPassword.loginPassword = ", loginPassword);

    try {
        const response = await fetch('http://localhost:3000/api/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: loginUserId,
                password: loginPassword,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}


export { getUserId, getUserName, setUserId, setUserName };