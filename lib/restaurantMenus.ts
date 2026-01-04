export type RestaurantMenu = {
    name: string;
    items: { id: string; name: string; price: number }[];
};

export const restaurantMenus: Record<string, RestaurantMenu> = {
    "america-cafe": {
        name: "Add Up Café",
        items: [
            // Appetizers
            { id: "america-cafe-1", name: "Chicken Wings", price: 8.50 },
            { id: "america-cafe-2", name: "Mozzarella Sticks", price: 7.25 },
            { id: "america-cafe-3", name: "Loaded Nachos", price: 9.75 },
            // Entrees
            { id: "america-cafe-4", name: "Chicken Avocado Club Sandwich", price: 12.50 },
            { id: "america-cafe-5", name: "Cheeseburger & Fries", price: 14.25 },
            { id: "america-cafe-6", name: "Grilled Salmon Plate", price: 18.50 },
            // Drinks
            { id: "america-cafe-7", name: "Lemonade", price: 3.50 },
            { id: "america-cafe-8", name: "Iced Tea", price: 3.25 },
            // Desserts
            { id: "america-cafe-9", name: "New Orleans Beignets", price: 6.75 },
            { id: "america-cafe-10", name: "Apple Pie", price: 5.50 },
        ],
    },
    "italian-trattoria": {
        name: "Italian Trattoria",
        items: [
            // Appetizers
            { id: "italian-trattoria-1", name: "Garlic Bread", price: 5.50 },
            { id: "italian-trattoria-2", name: "Bruschetta", price: 7.25 },
            { id: "italian-trattoria-3", name: "Caprese Salad", price: 8.75 },
            // Entrees
            { id: "italian-trattoria-4", name: "Margherita Pizza", price: 13.50 },
            { id: "italian-trattoria-5", name: "Fettuccine Alfredo", price: 15.25 },
            { id: "italian-trattoria-6", name: "Chicken Parmesan", price: 17.50 },
            // Drinks
            { id: "italian-trattoria-7", name: "Italian Soda", price: 4.25 },
            { id: "italian-trattoria-8", name: "Sparkling Water", price: 3.75 },
            // Desserts
            { id: "italian-trattoria-9", name: "Tiramisu", price: 7.50 },
            { id: "italian-trattoria-10", name: "Cannoli", price: 6.25 },
        ],
    },
    "mexican-cantina": {
        name: "Mexican Cantina",
        items: [
            // Appetizers
            { id: "mexican-cantina-1", name: "Guacamole & Chips", price: 6.50 },
            { id: "mexican-cantina-2", name: "Queso Dip", price: 5.75 },
            // Entrees
            { id: "mexican-cantina-3", name: "Carne Asada Tacos", price: 11.25 },
            { id: "mexican-cantina-4", name: "Chicken Enchiladas", price: 12.50 },
            { id: "mexican-cantina-5", name: "Burrito Bowl", price: 13.75 },
            { id: "mexican-cantina-6", name: "Quesadilla Grande", price: 10.50 },
            // Drinks
            { id: "mexican-cantina-7", name: "Horchata", price: 3.75 },
            { id: "mexican-cantina-8", name: "Jarritos Soda", price: 3.25 },
            // Desserts
            { id: "mexican-cantina-9", name: "Churros", price: 5.50 },
            { id: "mexican-cantina-10", name: "Flan", price: 6.25 },
        ],
    },
    "chinese-kitchen": {
        name: "Chinese Kitchen",
        items: [
            // Appetizers
            { id: "chinese-kitchen-1", name: "Spring Rolls", price: 5.25 },
            { id: "chinese-kitchen-2", name: "Pork Dumplings", price: 6.50 },
            { id: "chinese-kitchen-3", name: "Egg Rolls", price: 5.75 },
            // Entrees
            { id: "chinese-kitchen-4", name: "Veggie Fried Rice", price: 9.50 },
            { id: "chinese-kitchen-5", name: "Chicken & Broccoli", price: 11.25 },
            { id: "chinese-kitchen-6", name: "Sweet & Sour Pork", price: 12.50 },
            // Drinks
            { id: "chinese-kitchen-7", name: "Jasmine Tea", price: 2.75 },
            { id: "chinese-kitchen-8", name: "Bubble Tea", price: 4.50 },
            // Desserts
            { id: "chinese-kitchen-9", name: "Fortune Cookies", price: 2.25 },
            { id: "chinese-kitchen-10", name: "Sesame Balls", price: 5.50 },
        ],
    },
    "thai-kitchen": {
        name: "Thai Kitchen",
        items: [
            // Appetizers
            { id: "thai-kitchen-1", name: "Spring Rolls", price: 5.75 },
            { id: "thai-kitchen-2", name: "Satay Skewers", price: 7.50 },
            // Entrees
            { id: "thai-kitchen-3", name: "Pad Thai", price: 11.75 },
            { id: "thai-kitchen-4", name: "Green Curry", price: 12.50 },
            { id: "thai-kitchen-5", name: "Drunken Noodles", price: 13.25 },
            { id: "thai-kitchen-6", name: "Jasmine Rice Bowl", price: 8.50 },
            // Drinks
            { id: "thai-kitchen-7", name: "Thai Iced Tea", price: 4.25 },
            { id: "thai-kitchen-8", name: "Coconut Water", price: 3.75 },
            // Desserts
            { id: "thai-kitchen-9", name: "Mango Sticky Rice", price: 7.50 },
            { id: "thai-kitchen-10", name: "Fried Banana", price: 5.25 },
        ],
    },
    "japanese-grill": {
        name: "Japanese Grill",
        items: [
            // Appetizers
            { id: "japanese-grill-1", name: "Edamame", price: 4.50 },
            { id: "japanese-grill-2", name: "Gyoza", price: 6.75 },
            { id: "japanese-grill-3", name: "Miso Soup", price: 3.50 },
            // Entrees
            { id: "japanese-grill-4", name: "Teriyaki Bowl", price: 11.50 },
            { id: "japanese-grill-5", name: "Udon Noodle Soup", price: 10.75 },
            { id: "japanese-grill-6", name: "Sushi Roll", price: 13.25 },
            // Drinks
            { id: "japanese-grill-7", name: "Green Tea", price: 2.75 },
            { id: "japanese-grill-8", name: "Ramune Soda", price: 3.50 },
            // Desserts
            { id: "japanese-grill-9", name: "Mochi Ice Cream", price: 6.50 },
            { id: "japanese-grill-10", name: "Dorayaki", price: 5.75 },
        ],
    },
    "indian-canteen": {
        name: "Spice Canteen",
        items: [
            // Appetizers
            { id: "indian-canteen-1", name: "Samosas", price: 5.50 },
            { id: "indian-canteen-2", name: "Pakoras", price: 6.25 },
            // Entrees
            { id: "indian-canteen-3", name: "Chicken Tikka Plate", price: 12.75 },
            { id: "indian-canteen-4", name: "Butter Chicken", price: 13.50 },
            { id: "indian-canteen-5", name: "Chana Masala", price: 10.25 },
            { id: "indian-canteen-6", name: "Biryani Bowl", price: 11.75 },
            // Drinks
            { id: "indian-canteen-7", name: "Mango Lassi", price: 4.50 },
            { id: "indian-canteen-8", name: "Chai Tea", price: 3.25 },
            // Desserts
            { id: "indian-canteen-9", name: "Gulab Jamun", price: 5.75 },
            { id: "indian-canteen-10", name: "Kheer", price: 6.50 },
        ],
    },
    "mediterranean-bistro": {
        name: "Mediterranean Bistro",
        items: [
            // Appetizers
            { id: "mediterranean-bistro-1", name: "Hummus & Pita", price: 6.50 },
            { id: "mediterranean-bistro-2", name: "Stuffed Grape Leaves", price: 7.25 },
            { id: "mediterranean-bistro-3", name: "Greek Salad", price: 8.75 },
            // Entrees
            { id: "mediterranean-bistro-4", name: "Chicken Shawarma Plate", price: 12.50 },
            { id: "mediterranean-bistro-5", name: "Falafel Wrap", price: 10.75 },
            { id: "mediterranean-bistro-6", name: "Gyro Plate", price: 13.25 },
            // Drinks
            { id: "mediterranean-bistro-7", name: "Mint Lemonade", price: 3.75 },
            { id: "mediterranean-bistro-8", name: "Turkish Coffee", price: 4.25 },
            // Desserts
            { id: "mediterranean-bistro-9", name: "Baklava", price: 6.75 },
            { id: "mediterranean-bistro-10", name: "Rice Pudding", price: 5.50 },
        ],
    },

    // Keep legacy key mapped to the same menu as Chinese Kitchen for backward compatibility
    "asian-fusion": {
        name: "Chinese Kitchen",
        items: [
            { id: "asian-fusion-1", name: "Spring Rolls", price: 5.25 },
            { id: "asian-fusion-2", name: "Pork Dumplings", price: 6.50 },
            { id: "asian-fusion-3", name: "Egg Rolls", price: 5.75 },
            { id: "asian-fusion-4", name: "Veggie Fried Rice", price: 9.50 },
            { id: "asian-fusion-5", name: "Chicken & Broccoli", price: 11.25 },
            { id: "asian-fusion-6", name: "Sweet & Sour Pork", price: 12.50 },
            { id: "asian-fusion-7", name: "Jasmine Tea", price: 2.75 },
            { id: "asian-fusion-8", name: "Bubble Tea", price: 4.50 },
            { id: "asian-fusion-9", name: "Fortune Cookies", price: 2.25 },
            { id: "asian-fusion-10", name: "Sesame Balls", price: 5.50 },
        ],
    },
};