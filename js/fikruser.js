import * as common from './common.js';

//Registered Users
let userId = null;
let userName = null;


// Define API base URL
let baseUrlfikrflowserver = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrlfikrflowserver = 'http://localhost:3000'; // Cloud Run URL
} else {
    baseUrlfikrflowserver = 'https://fikrflowserver-g74cb7lg5a-uc.a.run.app'; // Local URL
}

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



const sendVerificationCodeButton = document.getElementById('sendVerificationCode');
const verificationCode = document.getElementById('verificationCode');
const verifyProceedButton = document.getElementById("verifyProceed");
const nextTabButton = document.getElementById("nextTab");
const backTabButton = document.getElementById("backTab");

const verificationtab = document.getElementById('verificationInfo-tab'); // Selects the second tab

const saveuserRegistrationButton = document.getElementById("saveUserRegistration");


const selectedUserElement = document.getElementById('selectedUser');
const selectedStatusElement = document.getElementById('selectedStatus');


// Add an event listener for the "Register User" button to open the modal
document.addEventListener("DOMContentLoaded", function() {

    // BACK
    if (backTabButton) {
        backTabButton.addEventListener("click", function() {


            // Select the tab you want to activate
            $('#userInfo-tab').tab('show');


        });
    }

    // NEXT
    if (nextTabButton) {
        nextTabButton.addEventListener("click", function() {


            $('#verificationInfo-tab').tab('show');



        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////// Registration SIGNUP
    // Send Verification Code
    if (sendVerificationCodeButton) {
        sendVerificationCodeButton.addEventListener("click", function() {
            // Enable the input field
            verificationCode.disabled = false;

            generateVerificationCode(userId)
                .then(retval => {
                    console.log("retval =", retval);
                    const expectedval = 'verification_code_generated'; // Replace with your expected code
                    if (retval === expectedval) {
                        console.log('Verification code Generated');
                        common.showFieldError('verificationCode', 'Verification Code has been generated. Check your email');
                        verifyProceedButton.removeAttribute("disabled");

                        // Do something when the verification code matches your expectation
                    } else {
                        console.error('Verification code not Geenrated');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });

        });
    }


    // Verify Verification Code
    if (verifyProceedButton) {
        verifyProceedButton.addEventListener("click", function() {
            const userverifcode = verificationCode.value;
            console.log("Passing userId", userId);
            console.log("Passing userverifcode", userverifcode);

            verifyCode(userId, userverifcode)
                .then(retval => {
                    console.log("retval =", retval);
                    const expectedval = 'user_verified'; // Replace with your expected code
                    if (retval === expectedval) {
                        console.log("Showing Verificaton done");

                        verificationCodeError.textContent = 'User Verified';
                        verificationCodeError.classList.remove('text-danger');
                        verificationCodeError.classList.add('text-success');
                        selectedStatusElement.textContent = 'Verified';
                        console.log("Verification Done ...");

                        // Do something when the verification code matches your expectation
                    } else {
                        console.log('User not Verified');
                        common.showFieldError('verificationCode', 'You have entered invalid verification code');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });

        });
    }



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
            initiateregistrationModal();
            registrationModal.show();
        });
    }

    function initiateregistrationModal() {
        saveUserRegistration.setAttribute("disabled", "disabled");
        nextTabButton.setAttribute("disabled", "disabled");

        // sendVerificationCode.setAttribute("disabled", "disabled");
        // verifyProceed.setAttribute("disabled", "disabled");
        document.getElementById("userId").value = "";
        document.getElementById("userName").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirmPassword").value = "";
        verificationtab.classList.add('disabled'); // Add the "disabled" class

    }


    const userIdElement = document.getElementById("userId");

    // Add a blur event listener to the userIdInput field
    userIdElement.addEventListener("blur", async() => {
        userId = userIdElement.value;
        console.log("userID Entered ", userId);
        if (!common.isFieldEmpty(userId)) {

            // Check if the user already exists
            const userExists = await checkuser(userId);
            console.log("userExists", userExists);

            if (userExists == "user_found") {
                // Generate a random 2-digit number
                const randomTwoDigitNumber = Math.floor(Math.random() * 100);

                // Suggest an alternative username
                const suggestedUserId = `${userId}${randomTwoDigitNumber}`;

                // Show an error message with the suggestion
                common.showFieldError('userId', `User ID "${userId}" is already taken. You can use "${suggestedUserId}" or choose another.`);
                return;
            } else {
                console.log("User Not Found. Registering User =", userId);
                common.showFieldError('userId', '', true); // Clear the error
                saveuserRegistrationButton.removeAttribute("disabled");


            }
        } else {
            common.showFieldError('userId', 'User ID is required.');
            return;
        }
    });


    const userEmailElement = document.getElementById("userEmail");
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;


    // Add a blur event listener to the userIdInput field
    userEmailElement.addEventListener("blur", async() => {
        const userEmail = userEmailElement.value;
        if (!emailRegex.test(userEmail)) {
            // Display an error message or take appropriate action
            console.error('Invalid email format');
            common.showFieldError('userEmail', 'You have entered non valid email format');

        } else {
            // Email format is valid
            console.error('Valid email format');
            sendVerificationCode.removeAttribute("disabled");

        }
    });


    // Add a click event listener to the "Save" button in the modal
    if (saveuserRegistrationButton) {
        saveuserRegistrationButton.addEventListener("click", async(event) => {



            // Clear previous error messages
            const fields = ['userId', 'userName', 'password', 'confirmPassword'];

            clearFieldErrors(fields);

            const userId = document.getElementById('userId').value;
            const userName = document.getElementById('userName').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;


            if (!common.isFieldEmpty(userId)) {

                // Check if the user already exists
                const userExists = await checkuser(userId);
                console.log("userExists", userExists);

                if (userExists == "user_found") {
                    // Generate a random 2-digit number
                    const randomTwoDigitNumber = Math.floor(Math.random() * 100);

                    // Suggest an alternative username
                    const suggestedUserId = `${userId}${randomTwoDigitNumber}`;

                    // Show an error message with the suggestion
                    common.showFieldError('userId', `User ID "${userId}" is already taken. You can use "${suggestedUserId}" or choose another.`);
                    return;
                } else {
                    console.log("User Not Found. Registering User =", userId);
                    common.showFieldError('userId', '', true); // Clear the error

                }
            } else {
                common.showFieldError('userId', 'User ID is required.');
                return;
            }

            if (common.isFieldEmpty(userName)) {
                common.showFieldError('userName', 'User Name is required.');
                return;
            }

            if (common.isFieldEmpty(password)) {
                common.showFieldError('password', 'Password is required.');
                return;
            }

            if (common.isFieldEmpty(confirmPassword)) {
                common.showFieldError('confirmPassword', 'Confirm Password is required.');
                return;
            }

            if (password !== confirmPassword) {
                common.showFieldError('password', 'Password and confirm password do not match.');
                common.showFieldError('confirmPassword', 'Password and confirm password do not match.');
                return;
            }

            if (!checkPasswordStrength(password)) {
                common.showFieldError('password', 'Password does not meet the strength requirements.');
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

        if (common.isFieldEmpty(userId)) {
            common.showFieldError('loginuserid', 'User ID is required.');
            return;
        }

        if (common.isFieldEmpty(password)) {
            common.showFieldError('loginpassword', 'Password is required.');
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


    // fadi consider redoing the UI and Split of Register vs Generate Code
    // // Close the modal
    // var myModalEl = document.getElementById('registrationModal');
    // var modal = bootstrap.Modal.getInstance(myModalEl); // Returns a Bootstrap modal instance
    // modal.hide();

    selectedUserElement.textContent = userId;
    selectedStatusElement.textContent = 'None Verified (NEW)';

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
        setUserId(userId);
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
    const response = await fetch(`${baseUrlfikrflowserver}/api/checkuser?userId=${userId}`);
    const data = await response.json();
    console.log("user exists ? ", data);
    return data.result;
}



async function registeruser(userId, userName, password) {
    // Check if the user provided a file name


    // Proceed with saving using the file name
    try {
        const response = await fetch('${baseUrlfikrflowserver}/api/registeruser', {
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
            console.log('User Registered successfully');
            common.showMessage('User Registered successfully ...', 2000);
            verificationtab.classList.remove('disabled');
            nextTabButton.removeAttribute("disabled");

            const userIdElement = document.getElementById("userId");

            userIdElement.value = userId;

            return true; // Return true on success
        } else {
            console.error('Failed to Register User');
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

        common.showFieldError('loginuserid', 'User and/Or Combination Not Valid...');
        common.showFieldError('loginpassword', 'User and/Or Combination Not Valid...');
        return false;

    }

}

// Function to check if a user exists
// Function to check if a user exists and authenticate
async function checkUserPassword(loginUserId, loginPassword) {

    console.log("checkUserPassword.loginUserId = ", loginUserId);
    console.log("checkUserPassword.loginPassword = ", loginPassword);

    try {
        const response = await fetch('${baseUrlfikrflowserver}/api/authenticate', {
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

async function generateVerificationCode(userId) {
    try {

        console.log("Generating Verification Code function userId = ", userId);
        const response = await fetch(`${baseUrlfikrflowserver}/api/generate-verification-code?userId=${userId}`);
        const data = await response.json();

        if (response.ok) {
            return data.result;
        } else {
            console.error('Error:', data.error || response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


async function verifyCode(userId, verificationCode) {
    try {
        const response = await fetch(`${baseUrlfikrflowserver}/api/verifycode?userId=${userId}&verificationcode=${verificationCode}`, {
            method: 'GET',
        });

        const data = await response.json();

        console.log("data", data);
        return data.result;

    } catch (error) {
        console.error('Error:', error);
        return error;
    }
}




export { getUserId, getUserName, setUserId, setUserName };