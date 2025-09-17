# ParageBragdon E-commerce Site

A fully functional e-commerce website for ParageBragdon, offering premium horse hoof care products and services.

## Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/paragebragdon.git
    cd paragebragdon
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the `server/` directory with:
    ```
    MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/paragebragdon
    STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    DOMAIN=https://your-domain.com
    PORT=3000
    ```

4. **Add product images**:
    Place product images in `public/images/` (e.g., `Artimud_300g.png`, `hero-horse.jpg`).

5. **Populate MongoDB**:
    Insert product data into MongoDB. Example:
    ```javascript
    use paragebragdon
    db.products.insertMany([
        {
            name: "Artimud 300g",
            price: 30.00,
            description: "Artimud is a product based on green clay, honey, natural minerals and essential oils.",
            fullDescription: "Artimud est un produit à base d'argile verte, de miel, de minéraux naturels et d'huiles essentiels...",
            usage: "Pour les crevasses ou seimes plus profondes et mince, nous vous recommandons d'utiliser le Hoof-stuff.",
            image: "/images/Artimud_300g.png",
            category: "hoof-care"
        },
        // Add other products
    ])
    ```

6. **Run the server**:
    ```bash
    npm start
    ```

7. **Deploy**:
    - **Frontend**: Deploy `public/` to Netlify or Vercel.
    - **Backend**: Deploy `server/` to Heroku or AWS.
    - Set up a domain and SSL certificate (e.g., via Let's Encrypt).

## Features
- Product catalog with filtering and search
- Shopping cart with Stripe checkout
- Contact form with email notifications
- Dark mode and accessibility enhancements
- Responsive design for mobile and desktop
- SEO optimization and Google Analytics

## License
© 2025 ParageBragdon. All rights reserved.
