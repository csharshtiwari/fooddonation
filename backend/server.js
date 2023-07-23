const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Sample initial donation data (in a real-world implementation, this data would be stored in a database)
let donations = [];

// Sample initial organization data (in a real-world implementation, this data would be stored in a database)
let organizations = [
  { id: 1, name: "Organization A" },
  { id: 2, name: "Organization B" },
  // Add more initial organizations if needed
];

// Route for the root path to serve homepage.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'homepage.html'));
});

// Route for the root path to serve donation.html
app.get('/donation', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'donation.html'));
});

// Route to get all donations
app.get('/donations', (req, res) => {
  res.json(donations);
});

// Route to add a new donation
app.post('/donations', (req, res) => {
  const { name, foodItem, quantity } = req.body;
  if (!name || !foodItem || !quantity) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newDonation = {
    id: donations.length + 1,
    name,
    foodItem,
    quantity: parseInt(quantity),
    claimedBy: null,
  };

  donations.push(newDonation);

  // Send the updated list of donations to the frontend
  res.status(201).json(newDonation);
});

// Route for claiming a donation
app.post('/claim', (req, res) => {
  const { donationId, organizationName } = req.body;

  // Find the donation in the donations array with the matching ID
  const donation = donations.find((donation) => donation.id === donationId);

  if (!donation) {
    return res.status(404).json({ message: "Donation not found." });
  }

  // Check if the donation is already claimed
  if (donation.claimedBy) {
    return res.status(400).json({ message: "This donation is already claimed." });
  }

  // Update the donation's claimedBy property to the organization's name
  donation.claimedBy = organizationName;

  res.status(200).json({ message: "Donation claimed successfully.", donation });
});



// Endpoint to add a new organization name or get the organization ID if it already exists
app.post('/organizations', (req, res) => {
  const { organizationName } = req.body;
  if (!organizationName) {
    return res.status(400).json({ message: "Organization name is required." });
  }

  // Check if the organization name already exists
  const existingOrganization = organizations.find((org) => org.name === organizationName);

  if (existingOrganization) {
    // If organization name exists, return the organization ID
    res.status(200).json({ message: "Organization already exists.", organizationId: existingOrganization.id });
  } else {
    // If organization name does not exist, create a new organization
    const newOrganization = {
      id: organizations.length + 1,
      name: organizationName,
    };
    organizations.push(newOrganization);
    res.status(201).json({ message: "Organization name added successfully.", organizationId: newOrganization.id });
  }
});

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
