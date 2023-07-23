// Function to fetch all donations from the backend
async function getDonations() {
    try {
      const response = await fetch('http://localhost:3000/donations');
      const data = await response.json();
      displayDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  }
  
  function displayDonations(donations) {
    const donationList = document.getElementById("donation-items");
    donationList.innerHTML = "";
  
    // Sort the donations array by ID in descending order to get the latest donations first
    const sortedDonations = donations.sort((a, b) => b.id - a.id);
  
    // Get the last four donations (or less if there are fewer than four)
    const lastFourDonations = sortedDonations.slice(0, 4);

    lastFourDonations.forEach((donation) => {
      if (!donation.claimedBy) { // Check if the donation is not already claimed
        const donationItemDiv = document.createElement("div");
        donationItemDiv.classList.add("col-md-6", "col-lg-3", "mb-5");
        const personDonateDiv = document.createElement("div");
        personDonateDiv.classList.add("person-donate", "text-center");
  
        const image = document.createElement("img");
        image.src = donation.image; // Assuming 'donation' has an 'image' property with the image URL
        image.alt = "Image placeholder";
        image.classList.add("img-fluid");
  
        const donateInfoDiv = document.createElement("div");
        donateInfoDiv.classList.add("donate-info");
  
        const nameHeader = document.createElement("h2");
        nameHeader.textContent = donation.name;
  
        const amountParagraph = document.createElement("p");
        amountParagraph.innerHTML = `Donated <span class="text-success">${donation.quantity}</span> pound/piece of<p class="link-underline fundraise-item">${donation.foodItem}</p>`;
  
        // Add a "Claim" button for each unclaimed donation
        const claimButton = document.createElement("button");
        claimButton.textContent = "Claim";
        claimButton.classList.add("claim-button"); // Add a class to the button for event delegation
  
        // Set the donation ID as the value of the hidden input field
        const donationIdInput = document.createElement("input");
        donationIdInput.type = "hidden";
        donationIdInput.name = "donationId";
        donationIdInput.value = donation.id;
  
        donateInfoDiv.appendChild(nameHeader);
        donateInfoDiv.appendChild(amountParagraph);
        donateInfoDiv.appendChild(claimButton); // Add the "Claim" button to the donation info
  
        personDonateDiv.appendChild(image);
        personDonateDiv.appendChild(donateInfoDiv);
        personDonateDiv.appendChild(donationIdInput);
  
        donationItemDiv.appendChild(personDonateDiv);
        donationList.appendChild(donationItemDiv);
      }
    });
  
    donationList.addEventListener("click", async (event) => {
      if (event.target.classList.contains("claim-button")) {
        const organizationName = prompt("Enter your organization's name:");
        if (organizationName) {
          // Traverse the DOM to find the closest parent element with class "person-donate"
          const personDonateDiv = event.target.closest(".person-donate");
          const donationId = personDonateDiv.querySelector("input[name='donationId']").value;
          await claimDonation(donationId, organizationName);
        }
      }
    });
    
  }
  
  // Function to generate the QR code URL using goqr.me API
  function generateQRCodeURL(donation) {
    const qrCodeData = JSON.stringify(donation);
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeData)}&size=200x200`;
    return apiUrl;
  }
  
  // Event handler for the donation form submission
  async function handleDonationSubmission(event) {
    event.preventDefault();
    const name = document.querySelector("#donation-form input[name='name']").value;
    const foodItem = document.querySelector("#donation-form input[name='foodItem']").value;
    const quantity = document.querySelector("#donation-form input[name='quantity']").value;
    const donationId = document.querySelector("#donation-form input[name='donationId']").value;
  
    // Validate input fields
    if (!name || !foodItem || !quantity) {
      alert("All fields are required.");
      return;
    }
  
    const newDonation = { name, foodItem, quantity: parseInt(quantity), donationId };
  
    // Make a POST request to add the new donation to the backend
    try {
      const response = await fetch('http://localhost:3000/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDonation),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add donation.');
      }
  
      // Refresh the donation list with the updated data
      getDonations();
  
      // Generate the QR code URL for the new donation
      const qrCodeURL = generateQRCodeURL(newDonation);
  
      // Display the QR code on the page
      const qrCodeElement = document.getElementById('qrcode');
      qrCodeElement.src = qrCodeURL;
  
      // Clear the form
      event.target.reset();
    } catch (error) {
      console.error('Error adding donation:', error);
    }
  }
  
  
  // Function to handle donation claim
  async function claimDonation(donationId, organizationName) {
    try {
      // Make a POST request to claim the donation
      const claimResponse = await fetch('http://localhost:3000/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ donationId, organizationName }),
      });
  
      const claimData = await claimResponse.json();
  
      if (claimResponse.ok) {
        console.log(claimData.message); // Print the success message
        // After claiming the donation, refresh the donation list to reflect the changes
        getDonations();
      } else {
        console.error('Error claiming donation:', claimData.message);
        alert('An error occurred while claiming the donation. Please try again later.');
      }
    } catch (error) {
      console.error('Error claiming donation:', error);
      alert('An error occurred while claiming the donation. Please try again later.');
    }
  }
  
  
  
  // Add event listener to the donation form
  const donationForm = document.querySelector("#donation-form");
  donationForm.addEventListener("submit", handleDonationSubmission);
  
  // Initial display of donations on page load
  getDonations();