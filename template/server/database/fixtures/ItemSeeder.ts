import AbstractSeeder from "./AbstractSeeder";

// Import seeders that must be executed before this one
// Follow your foreign keys to find the right order ;)
import UserSeeder from "./UserSeeder";

class ItemSeeder extends AbstractSeeder {
  constructor() {
    // Call the constructor of the parent class (AbstractSeeder) with appropriate options
    super({ table: "item", truncate: true, dependencies: [UserSeeder] });
  }

  // The run method - Populate the 'item' table with fake data

  run() {
    // Generate and insert fake data into the 'item' table
    for (let i = 0; i < 10; i += 1) {
      // Generate fake item data
      const fakeItem = {
        title: this.faker.lorem.word(), // Generate a fake title using faker library
        user_id: this.getRef(`user_${i}`).insertId, // Get the insertId of the corresponding user from UserSeeder
      };

      // Insert the fakeItem data into the 'item' table
      this.insert(fakeItem); // insert into item(title, user_id) values (?, ?)
    }
  }
}

// Export the ItemSeeder class
export default ItemSeeder;
