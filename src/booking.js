console.log("webhookurl", process.env.WEBHOOK);

document.addEventListener("DOMContentLoaded", function () {
  if (typeof google !== "undefined") {
    // Initialize Google Places Autocomplete
    var gpaInput = document.getElementById("Address");
    var autocomplete = new google.maps.places.Autocomplete(gpaInput);
  }

  // Get references to the input and span elements
  const passengerCountInput = document.getElementById("passengerCount");
  const totalPaySpan = document.getElementById("totalPay");

  function generateUUID() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let uuid = "ord_live_";

    for (let i = 0; i < 16; i++) {
      const charIndex = Math.floor(Math.random() * characters.length);
      uuid += characters.charAt(charIndex);
    }

    return uuid;
  }

  const uniqueId = generateUUID();

  // Add an event listener to the passengerCount input
  passengerCountInput.addEventListener("change", function () {
    const passengerCount = parseInt(passengerCountInput.value) || 0;
    if (isNaN(passengerCount) || passengerCount < 0) {
      // Handle invalid input
      return;
    }

    // Calculate the total pay
    const totalPay = (passengerCount * 129).toFixed(2);
    totalPaySpan.textContent = `${totalPay}`;

    let culqiTotal = totalPay * 100;

    Culqi.publicKey = "pk_test_W9omu85704qlf95x";
    Culqi.settings({
      title: "Culqi Store",
      currency: "USD",
      amount: culqiTotal,
      metadata: uniqueId,
    });
  });

  const btn_pagar = document.getElementById("submitForm");

  btn_pagar.addEventListener("click", function (e) {
    // Abre el formulario with the configuration in Culqi.settings and CulqiOptions
    Culqi.open();
    e.preventDefault();
  });

  const passengerCount = document.getElementById("passengerCount");
  const passengerContainer = document.getElementById("passengerContainer");
  const submitButton = document.getElementById("submitForm");
  const passengers = [];

  passengerCount.addEventListener("change", function () {
    const numPassengers = parseInt(passengerCount.value);
    passengerContainer.innerHTML = ""; // Clear previous entries
    passengers.length = 0; // Clear previous passenger data

    for (let i = 0; i < numPassengers; i++) {
      const div = document.createElement("div");
      div.className = "passengers_item";
      div.innerHTML = `
          <p class="heading-style-h6">Passenger ${i + 1}</p>
          <div class="space-medium"></div>
          <p class="paragraph.is-label">Full Name</p>
          <input class="input" type="text" id="name${i}" name="name${i}" required> <br>
          <div class="space-small"></div>
          <p class="paragraph.is-label">Passport #</p>
          <input class="input" type="text" id="passport${i}" name="passport${i}" required><br>
          <div class="space-small"></div>
          <p class="paragraph.is-label">Age</p>
          <input class="input" type="number" id="age${i}" name="age${i}" required><br>
        `;
      passengerContainer.appendChild(div);

      passengers.push({ name: "", passport: "", age: "" }); // Initialize empty passenger data
    }
  });

  submitButton.addEventListener("click", function () {
    for (let i = 0; i < passengers.length; i++) {
      const nameInput = document.getElementById(`name${i}`);
      const passportInput = document.getElementById(`passport${i}`);
      const ageInput = document.getElementById(`age${i}`);
      passengers[i].name = nameInput.value;
      passengers[i].passport = passportInput.value;
      passengers[i].age = ageInput.value;
    }

    console.log(passengers); // Display passenger data in the console
    localStorage.setItem("myPassengers", JSON.stringify(passengers));
  });

  // Your existing code...

  const dateInput = document.getElementById("date");
  const addressInput = document.getElementById("Address");
  const emailInput = document.getElementById("email");
  const phoneNumberInput = document.getElementById("phone-number");

  // Add an event listener to all relevant input fields
  passengerCount.addEventListener("input", checkFormFields);
  dateInput.addEventListener("input", checkFormFields);
  addressInput.addEventListener("input", checkFormFields);
  emailInput.addEventListener("input", checkFormFields);
  phoneNumberInput.addEventListener("input", checkFormFields);

  function checkFormFields() {
    const passengerCountValue = passengerCount.value.trim();
    const dateValue = dateInput.value.trim();
    const addressValue = addressInput.value.trim();
    const emailValue = emailInput.value.trim();
    const phoneNumberValue = phoneNumberInput.value.trim();

    // Check if all input fields are filled out
    if (
      passengerCountValue !== "" &&
      dateValue !== "" &&
      addressValue !== "" &&
      emailValue !== "" &&
      phoneNumberValue !== ""
    ) {
      // Remove the "is-disable" class to enable the button
      submitButton.classList.remove("is-disable");
    } else {
      // Add the "is-disable" class to disable the button
      submitButton.classList.add("is-disable");
    }
  }
});

function culqi() {
  if (Culqi.token) {
    // ¡Objeto Token creado exitosamente!
    const token = Culqi.token.id;
    console.log("Se ha creado un Token: ", Culqi.token);

    // Retrieve the passenger data from localStorage
    const jsonString = localStorage.getItem("myPassengers");
    const myPassengers = JSON.parse(jsonString) || [];
    const bookingDate = document.getElementById("date").value;
    const pickupAddress = document.getElementById("Address").value;
    const emailAddress = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phone-number").value;
    const passengerCountInput = document.getElementById("passengerCount");
    const passengerCount = passengerCountInput.value;
    // Calculate the total pay
    const totalPay = (passengerCount * 129).toFixed(2);
    let culqiTotal = totalPay * 100;

    const payload = {
      passengersNumber: passengerCountInput.value,
      date: bookingDate,
      address: pickupAddress,
      email: emailAddress,
      phone: phoneNumber,
      uuid: token,
      passengerList: myPassengers,
    };

    // Define the URL of the webhook
    const webhookURL = process.env.WEBHOOK;

    console.log("webhookurl", webhookURL);

    fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Webhook request was successful.");
          // Redirect to the successful payment page
          // window.location.href = "/successful-payment";
        } else {
          console.error("Webhook request failed.");
          // Redirect to the failed payment page
          // window.location.href = "/failed-payment";
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        // Redirect to the failed payment page
        // window.location.href = "/failed-payment";
      });

    // Define the URL of the Culqi API to create a charge
    const culqiAPIURL = "https://api.culqi.com/v2/charges";

    // Payload for creating the charge on Culqi
    const chargePayload = {
      amount: culqiTotal,
      currency_code: "USD",
      email: emailAddress,
      source_id: `${token}`,
      capture: true,
      description: "Prueba",
      installments: 1,
      antifraud_details: {},
    };

    // Make the API call to create the charge on Culqi
    fetch(culqiAPIURL, {
      method: "POST",
      headers: {
        Authorization: "Bearer sk_test_Raiof3ahXEu4IEJ3",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chargePayload),
    })
      .then((response) => {
        if (response.ok) {
          // Redirect to the successful payment page
          window.location.href = "/successful-payment";
        } else {
          console.error("Culqi charge creation failed.");
          // Redirect to the failed payment page
          window.location.href = "/failed-payment";
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        // Redirect to the failed payment page
        window.location.href = "/failed-payment";
      });
  } else if (Culqi.order) {
    // ¡Objeto Order creado exitosamente!
    const order = Culqi.order;
    console.log("Se ha creado el objeto Order: ", order);
  } else {
    // Mostramos JSON de objeto error en consola
    console.log("Error: ", Culqi.error);
    // Redirect to the /failed-payment route
    window.location.href = "/failed-payment";
  }
}
