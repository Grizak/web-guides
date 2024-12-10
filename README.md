# Web Development Guides

Welcome to the **Web Development Guides** project! This application is designed to provide an organized platform for creating, managing, and sharing web development guides. With support for categories, search functionality, and an admin dashboard, it's built to be both user-friendly and scalable.

---

## Features

- **Dynamic Guide Management**: Add, edit, and delete guides easily.
- **Category Support**: Guides are organized by categories for better discoverability.
- **Admin Dashboard**: Manage guides and categories through a user-friendly interface.
- **MongoDB Integration**: All data is stored securely in a MongoDB database.

---

## Prerequisites

Before starting, make sure you have the following installed on your machine:

- **Node.js** (version 18 or later)
- **MongoDB** (local or cloud instance)
- A package manager like `npm` or `yarn`

---

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Grizak/web-guides.git
   cd web-guides
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/web-guides?retryWrites=true&w=majority
   ```

4. **Start the development server**:

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000/`.

---

## Usage

- Navigate to the homepage to view available guides.
- Log in as an admin to manage guides and categories.

---

## Project Structure

```plaintext
web-development-guides/
├── models/          # MongoDB schemas for Guides and Categories
├── routes/          # Express routes for guides and categories
├── views/           # EJS templates for frontend rendering
├── public/          # Static assets (CSS, JavaScript, images)
├── .env             # Environment variables
├── app.js           # Main server file
├── package.json     # Project metadata and dependencies
└── README.md        # Project documentation
```

---

## Roadmap

- [ ] Add user authentication for guide creators.
- [ ] Implement guide versioning and draft support.
- [ ] Add ratings and comments for guides.

---

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue to suggest improvements.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## Acknowledgments

Special thanks to:

- The developers and maintainers of [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/).

---

## Contact

For questions or support, please open an issue or contact the maintainer.
